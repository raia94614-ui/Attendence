import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  getWeeklyRoutine,
  getStudentSubjects,
  getStudentProfile,
  getReminderSettings,
  saveReminderSettings,
  markDailyLectureStatus,
  isDateHoliday
} from '../utils/storage';
import {
  parseTimeToMinutes,
  getCurrentTimeMinutes,
  getNextUpcomingClass,
  isAlertAlreadyTriggered,
  markAlertAsTriggered,
  requestNotificationPermission,
  sendBrowserPushNotification
} from '../utils/routineNotifier';
import {
  playClassRingtone,
  stopClassRingtone,
  speakClassAlert,
  stopClassSpeech
} from '../utils/routineAlarmAudio';
import { getTodayDateString } from '../utils/dateUtils';
import { useToast } from './ToastContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const RoutineAlertContext = createContext(null);

export function RoutineAlertProvider({ children }) {
  const toast = useToast();

  const [reminderSettings, setReminderSettings] = useState(getReminderSettings());
  const [activeAlert, setActiveAlert] = useState(null); // { slot, minutesBefore, isTest, subject }
  const [nextUpcomingClass, setNextUpcomingClass] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const snoozeTimerRef = useRef(null);

  // Update Settings
  const updateSettings = useCallback((newSettings) => {
    const updated = { ...reminderSettings, ...newSettings };
    setReminderSettings(updated);
    saveReminderSettings(updated);
  }, [reminderSettings]);

  // Request browser permission
  const requestBrowserPermission = async () => {
    const result = await requestNotificationPermission();
    setNotificationPermission(result);
    if (result === 'granted') {
      toast.success('Browser notification permission enabled! 🔔');
    } else if (result === 'denied') {
      toast.error('Notification permission was blocked in your browser settings.');
    }
    return result;
  };

  // Trigger alert popup, ringtone & native notification
  const triggerAlert = useCallback((slot, minutesBefore = 5, isTest = false) => {
    const subjects = getStudentSubjects();
    const profile = getStudentProfile();
    const sub = subjects.find(s => s.id === slot.subjectId) || {
      name: slot.subjectName || 'Upcoming Lecture',
      code: slot.subjectCode || 'SUB',
      color: slot.subjectColor || '#6366f1'
    };

    const alertData = {
      slot,
      subject: sub,
      minutesBefore: Math.max(0, minutesBefore),
      isTest,
      timestamp: Date.now()
    };

    setActiveAlert(alertData);

    // 1. Play phone ringtone
    if (reminderSettings.ringtoneEnabled) {
      playClassRingtone(reminderSettings.soundType || 'marimba');
    }

    // 2. Speak announcement via SpeechSynthesis
    if (reminderSettings.speechEnabled) {
      speakClassAlert({
        subjectName: sub.name,
        room: slot.room,
        minutesBefore: Math.max(0, minutesBefore),
        studentName: profile.name || ''
      });
    }

    // 3. Native Browser Notification
    if (reminderSettings.browserNotificationEnabled) {
      const timeStr = minutesBefore <= 0 ? 'Starting Now' : `Starts in ${minutesBefore} mins`;
      const title = `🔔 Class Reminder: ${sub.name}`;
      const body = `${sub.code} • ${timeStr} ${slot.room ? `• ${slot.room}` : ''} (${slot.time || ''})`;

      sendBrowserPushNotification(title, {
        body,
        tag: `class-${slot.id || 'alert'}`,
        onClick: () => {
          window.focus();
        }
      });
    }
  }, [reminderSettings]);

  // Dismiss active alert
  const dismissAlert = useCallback(() => {
    stopClassRingtone();
    stopClassSpeech();
    setActiveAlert(null);
  }, []);

  // Snooze alert
  const snoozeAlert = useCallback((snoozeMinutes = 2) => {
    if (!activeAlert) return;
    const currentAlert = activeAlert;
    dismissAlert();
    toast.info(`Alarm snoozed for ${snoozeMinutes} minutes ⏰`);

    if (snoozeTimerRef.current) {
      clearTimeout(snoozeTimerRef.current);
    }

    snoozeTimerRef.current = setTimeout(() => {
      triggerAlert(currentAlert.slot, 0, currentAlert.isTest);
    }, snoozeMinutes * 60 * 1000);
  }, [activeAlert, dismissAlert, triggerAlert, toast]);

  // Attend directly from call screen
  const attendClassDirectly = useCallback((slot, onAttendanceUpdated) => {
    const todayDateStr = getTodayDateString();
    const todayDayName = DAYS[new Date().getDay()];

    markDailyLectureStatus(todayDateStr, slot.subjectId, 'present', {
      id: slot.id,
      day: todayDayName,
      time: slot.time,
      room: slot.room
    });

    dismissAlert();
    toast.success(`Marked Present for ${slot.subjectName || 'Class'}! 🎉`);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    if (onAttendanceUpdated) onAttendanceUpdated();
    window.dispatchEvent(new CustomEvent('attendx-attendance-updated'));
  }, [dismissAlert, toast]);

  // Trigger Instant Test Call Alert
  const triggerTestAlert = useCallback(() => {
    const subjects = getStudentSubjects();
    const sub = subjects[0] || {
      id: 'test-sub-1',
      name: 'Computer Networks',
      code: 'CS401',
      color: '#6366f1'
    };

    const testSlot = {
      id: `test-slot-${Date.now()}`,
      subjectId: sub.id,
      subjectName: sub.name,
      time: '09:00 AM - 10:00 AM',
      room: 'Room 304 (Lab 2)'
    };

    triggerAlert(testSlot, reminderSettings.leadTimeMinutes || 5, true);
  }, [reminderSettings, triggerAlert]);

  // Heartbeat Routine Monitor & Next Class Calculator
  useEffect(() => {
    const checkSchedule = () => {
      const today = new Date();
      const todayDateStr = getTodayDateString();
      const todayDayName = DAYS[today.getDay()];

      const routine = getWeeklyRoutine();
      const todaySlots = routine[todayDayName] || [];

      // Update Next Class
      const next = getNextUpcomingClass(todaySlots);
      setNextUpcomingClass(next);

      // If holiday, don't trigger alarms
      if (isDateHoliday(todayDateStr)) return;
      if (!reminderSettings.enabled) return;

      const currentMin = getCurrentTimeMinutes();
      const leadTime = parseInt(reminderSettings.leadTimeMinutes, 10) || 5;

      todaySlots.forEach(slot => {
        const startMin = parseTimeToMinutes(slot.time);
        if (startMin === null) return;

        const diff = startMin - currentMin;

        // Trigger when diff is within lead time window (e.g. diff <= leadTime and diff >= 0)
        // or if leadTime == 0, when diff === 0
        if (diff <= leadTime && diff >= -1) {
          if (!isAlertAlreadyTriggered(slot.id, todayDateStr)) {
            markAlertAsTriggered(slot.id, todayDateStr);
            triggerAlert(slot, Math.max(0, diff), false);
          }
        }
      });
    };

    // Run immediately and then every 10 seconds
    checkSchedule();
    const interval = setInterval(checkSchedule, 10000);

    return () => {
      clearInterval(interval);
      if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
    };
  }, [reminderSettings, triggerAlert]);

  return (
    <RoutineAlertContext.Provider
      value={{
        reminderSettings,
        updateSettings,
        activeAlert,
        nextUpcomingClass,
        notificationPermission,
        requestBrowserPermission,
        triggerAlert,
        triggerTestAlert,
        dismissAlert,
        snoozeAlert,
        attendClassDirectly
      }}
    >
      {children}
    </RoutineAlertContext.Provider>
  );
}

export function useRoutineAlert() {
  const ctx = useContext(RoutineAlertContext);
  if (!ctx) {
    throw new Error('useRoutineAlert must be used within a RoutineAlertProvider');
  }
  return ctx;
}
