// Date utility functions for AttendX

export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', options);
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateStr;
  }
}

export function getRelativeTime(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(isoString.split('T')[0]);
  } catch (e) {
    return '';
  }
}

/**
 * Returns 2D grid matrix for Calendar view (6 weeks x 7 days)
 */
export function getCalendarGrid(year, month) {
  // month: 0-indexed (0 = Jan, 11 = Dec)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const totalDays = lastDay.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const days = [];

  // Previous month padding days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDay = prevMonthLastDay - i;
    const prevMonthNum = month === 0 ? 12 : month;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
    days.push({
      day: prevDay,
      dateString: dateStr,
      isCurrentMonth: false,
      isPreviousMonth: true
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const currentMonthNum = month + 1;
    const dateStr = `${year}-${String(currentMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      day: d,
      dateString: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === getTodayDateString()
    });
  }

  // Next month padding days to fill 35 or 42 slots
  const remainingSlots = (7 - (days.length % 7)) % 7;
  for (let n = 1; n <= remainingSlots; n++) {
    const nextMonthNum = month === 11 ? 1 : month + 2;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
    days.push({
      day: n,
      dateString: dateStr,
      isCurrentMonth: false,
      isNextMonth: true
    });
  }

  return days;
}
