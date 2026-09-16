// Routine Timetable Reminder & Browser Notification Helper

const TRIGGERED_STORAGE_KEY = 'attendx_triggered_alerts';

/**
 * Parse time string (e.g. "09:00 AM - 10:00 AM" or "1:30 PM") to total minutes from midnight (0 - 1439)
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  try {
    const firstPart = timeStr.split('-')[0].trim();
    const isPM = /pm/i.test(firstPart);
    const isAM = /am/i.test(firstPart);
    const clean = firstPart.replace(/(am|pm)/gi, '').trim();
    const [hStr, mStr] = clean.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    if (isNaN(h)) return null;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
  } catch (e) {
    return null;
  }
}

/**
 * Parse end time from range e.g. "09:00 AM - 10:00 AM"
 */
export function parseEndTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  try {
    const parts = timeStr.split('-');
    if (parts.length < 2) return null;
    const endPart = parts[1].trim();
    const isPM = /pm/i.test(endPart);
    const isAM = /am/i.test(endPart);
    const clean = endPart.replace(/(am|pm)/gi, '').trim();
    const [hStr, mStr] = clean.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    if (isNaN(h)) return null;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
  } catch (e) {
    return null;
  }
}

/**
 * Get current time in minutes from midnight
 */
export function getCurrentTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Formats minutes remaining into human readable string
 */
export function formatMinutesRemaining(diffMinutes) {
  if (diffMinutes <= 0) return 'Starting now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const hrs = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Returns today's slots sorted chronologically with time metadata
 */
export function getAugmentedTodaySlots(slots = []) {
  const currentMinutes = getCurrentTimeMinutes();

  return slots.map(slot => {
    const startMin = parseTimeToMinutes(slot.time);
    const endMin = parseEndTimeToMinutes(slot.time) || (startMin !== null ? startMin + 60 : null);
    
    let state = 'upcoming';
    let diffMinutes = null;

    if (startMin !== null) {
      diffMinutes = startMin - currentMinutes;
      if (diffMinutes > 0) {
        state = 'upcoming';
      } else if (endMin !== null && currentMinutes <= endMin) {
        state = 'live';
      } else {
        state = 'passed';
      }
    }

    return {
      ...slot,
      startMin,
      endMin,
      diffMinutes,
      state
    };
  }).sort((a, b) => {
    if (a.startMin === null) return 1;
    if (b.startMin === null) return -1;
    return a.startMin - b.startMin;
  });
}

/**
 * Returns next class that is upcoming or live today
 */
export function getNextUpcomingClass(todaySlots = []) {
  const augmented = getAugmentedTodaySlots(todaySlots);
  
  // Find first upcoming or live slot
  const live = augmented.find(s => s.state === 'live');
  if (live) return live;

  const upcoming = augmented.find(s => s.state === 'upcoming' && s.diffMinutes !== null && s.diffMinutes >= 0);
  return upcoming || null;
}

/**
 * Storage helpers to prevent repeating alerts for the same class on the same day
 */
function getTriggeredAlertsMap() {
  try {
    const raw = sessionStorage.getItem(TRIGGERED_STORAGE_KEY) || localStorage.getItem(TRIGGERED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function isAlertAlreadyTriggered(slotId, dateStr) {
  const map = getTriggeredAlertsMap();
  const key = `${dateStr}_${slotId}`;
  return !!map[key];
}

export function markAlertAsTriggered(slotId, dateStr) {
  try {
    const map = getTriggeredAlertsMap();
    const key = `${dateStr}_${slotId}`;
    map[key] = Date.now();
    sessionStorage.setItem(TRIGGERED_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

export function clearTriggeredAlert(slotId, dateStr) {
  try {
    const map = getTriggeredAlertsMap();
    const key = `${dateStr}_${slotId}`;
    delete map[key];
    sessionStorage.setItem(TRIGGERED_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

/**
 * Request native browser notification permissions
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return 'denied';
  }
}

/**
 * Send browser push notification
 */
export function sendBrowserPushNotification(title, { body, icon = '/vite.svg', tag, data, onClick }) {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon,
        tag: tag || 'attendx-class-alarm',
        renotify: true,
        vibrate: [200, 100, 200, 100, 300],
        data
      });

      notif.onclick = () => {
        window.focus();
        if (onClick) onClick();
        notif.close();
      };

      return notif;
    } catch (e) {
      console.warn('Native notification error:', e);
      return null;
    }
  }
  return null;
}
