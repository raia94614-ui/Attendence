// AttendX LocalStorage Utility Manager
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_STUDENT_SUBJECTS,
  INITIAL_WEEKLY_ROUTINE,
  INITIAL_HOLIDAYS,
  INITIAL_ASSIGNMENTS,
  generateSeedDailyLogs
} from '../data/demoData';

const KEYS = {
  PROFILE: 'attendx_v2_profile',
  SUBJECTS: 'attendx_v2_subjects',
  TIMETABLE_IMAGE: 'attendx_v2_timetable_image',
  WEEKLY_ROUTINE: 'attendx_v2_weekly_routine',
  DAILY_LOGS: 'attendx_v2_daily_logs',
  HOLIDAYS: 'attendx_v2_holidays',
  ASSIGNMENTS: 'attendx_v2_assignments',
  SETTINGS: 'attendx_v2_settings',
  REMINDERS: 'attendx_v2_reminder_settings',
  THEME: 'attendx_theme'
};

function safeGet(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined || item === 'undefined') {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading ${key} from LocalStorage:`, error);
    return defaultValue;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to LocalStorage:`, error);
    return false;
  }
}

const CLEAN_STORAGE_VERSION_KEY = 'attendx_clean_mode_v10';

export function cleanSubjectName(name = '', code = '') {
  let str = (name || '').trim();
  const c = (code || '').trim();
  if (!str && !c) return 'Subject';
  if (!str) return c;

  // Remove bracket expansion like "ADI-FA (App Dev & Innovation)" -> "ADI-FA"
  const bracketIdx = str.indexOf(' (');
  if (bracketIdx !== -1) {
    str = str.substring(0, bracketIdx).trim();
  }
  return str || c;
}

export function initializeStorage() {
  // Purge any legacy keys
  const legacyKeys = [
    'attendx_student_profile',
    'attendx_student_subjects',
    'attendx_timetable_image',
    'attendx_weekly_routine',
    'attendx_daily_attendance_logs',
    'attendx_holidays',
    'attendx_assignments',
    'attendx_student_settings',
    'attendx_data_cleaned_v1',
    'attendx_v4_routine_version'
  ];
  legacyKeys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  });

  // Check if storage needs reset to fresh clean state
  const isCleaned = localStorage.getItem(CLEAN_STORAGE_VERSION_KEY);
  if (isCleaned !== 'true') {
    safeSet(KEYS.PROFILE, INITIAL_STUDENT_PROFILE);
    safeSet(KEYS.SUBJECTS, []);
    safeSet(KEYS.WEEKLY_ROUTINE, INITIAL_WEEKLY_ROUTINE);
    safeSet(KEYS.DAILY_LOGS, []);
    safeSet(KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
    safeSet(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    safeSet(KEYS.SETTINGS, { minAttendanceTarget: 75, collegeName: "" });
    safeSet(KEYS.REMINDERS, DEFAULT_REMINDER_SETTINGS);
    try {
      localStorage.removeItem(KEYS.TIMETABLE_IMAGE);
    } catch (e) {}
    localStorage.setItem(CLEAN_STORAGE_VERSION_KEY, 'true');
  }

  // Auto deduplicate & clean subjects if any exist and filter out unwanted legacy PA
  const existingSubs = safeGet(KEYS.SUBJECTS, null);
  if (existingSubs && Array.isArray(existingSubs) && existingSubs.length > 0) {
    const cleanSubs = existingSubs.filter(s => s && s.code !== 'PA' && s.id !== 'sub-pa' && (!s.name || !s.name.includes('Predictive Analytics')));
    const deduped = deduplicateSubjects(cleanSubs);
    safeSet(KEYS.SUBJECTS, deduped);
  }

  // Also clean any existing routine slots
  const existingRoutine = safeGet(KEYS.WEEKLY_ROUTINE, null);
  if (existingRoutine && typeof existingRoutine === 'object') {
    const cleanedRoutine = {};
    let changed = false;
    Object.keys(existingRoutine).forEach(day => {
      if (Array.isArray(existingRoutine[day])) {
        cleanedRoutine[day] = existingRoutine[day].map(slot => {
          const cleanName = cleanSubjectName(slot.subjectName, slot.subjectCode);
          if (cleanName !== slot.subjectName) changed = true;
          return { ...slot, subjectName: cleanName };
        });
      } else {
        cleanedRoutine[day] = [];
      }
    });
    if (changed) {
      safeSet(KEYS.WEEKLY_ROUTINE, cleanedRoutine);
    }
  }

  // Only initialize defaults if not already present
  if (!localStorage.getItem(KEYS.PROFILE)) {
    safeSet(KEYS.PROFILE, INITIAL_STUDENT_PROFILE);
  }
  if (!localStorage.getItem(KEYS.SUBJECTS)) {
    safeSet(KEYS.SUBJECTS, INITIAL_STUDENT_SUBJECTS);
  }
  if (!localStorage.getItem(KEYS.WEEKLY_ROUTINE)) {
    safeSet(KEYS.WEEKLY_ROUTINE, INITIAL_WEEKLY_ROUTINE);
  }
  if (!localStorage.getItem(KEYS.DAILY_LOGS)) {
    safeSet(KEYS.DAILY_LOGS, []);
  }
  if (!localStorage.getItem(KEYS.HOLIDAYS)) {
    safeSet(KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
  }
  if (!localStorage.getItem(KEYS.ASSIGNMENTS)) {
    safeSet(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    safeSet(KEYS.SETTINGS, { minAttendanceTarget: 75, collegeName: "" });
  }
  if (!localStorage.getItem(KEYS.REMINDERS)) {
    safeSet(KEYS.REMINDERS, DEFAULT_REMINDER_SETTINGS);
  }
}

export function applyChitkaraWeeklySchedule() {
  const demoProfile = {
    name: "Student",
    college: "Chitkara University, Himachal Pradesh",
    department: "School of Engineering & Technology (BE-CSE)",
    semester: "5th Semester (5A)",
    rollNumber: "",
    minTarget: 75
  };
  safeSet(KEYS.PROFILE, demoProfile);
  safeSet(KEYS.SUBJECTS, CHITKARA_BE_CSE_5A_SUBJECTS);
  safeSet(KEYS.WEEKLY_ROUTINE, CHITKARA_BE_CSE_5A_ROUTINE);
  safeSet(KEYS.SETTINGS, { minAttendanceTarget: 75, collegeName: "Chitkara University, Himachal Pradesh" });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('attendx-routine-updated'));
    window.dispatchEvent(new CustomEvent('attendx-attendance-updated'));
  }
  return { routine: CHITKARA_BE_CSE_5A_ROUTINE, subjects: CHITKARA_BE_CSE_5A_SUBJECTS };
}

// ================= STUDENT PROFILE =================
export function getStudentProfile() {
  return safeGet(KEYS.PROFILE, INITIAL_STUDENT_PROFILE);
}

export function saveStudentProfile(profile) {
  return safeSet(KEYS.PROFILE, profile);
}

export function normalizeSubjectKey(codeOrName = '') {
  if (!codeOrName) return '';
  const clean = codeOrName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  if (clean === 'aoc' || clean === 'aocii' || clean === 'aociig1' || clean === 'aoc2' || clean === 'aocg1' || clean === 'aoc11') return 'aoc-ii-g1';
  if (clean === 'adifa' || clean === 'ad1fa' || clean === 'adifag1') return 'adi-fa';
  if (clean === 'adi' || clean === 'ad1' || clean === 'adig1') return 'adi';
  if (clean === 'aaipd' || clean === 'aa1pd' || clean === 'aipd') return 'aaipd';
  if (clean === 'bee' || clean === '8ee' || clean === 'bfe') return 'bee';
  if (clean === 'bpc' || clean === 'bpcg3' || clean === 'bpc3' || clean === '8pc') return 'bpc-g3';
  if (clean === 'nalr' || clean === 'nalri' || clean === 'nalr1' || clean === 'na1r') return 'nalr-i';
  return clean;
}

export function deduplicateSubjects(list = []) {
  if (!Array.isArray(list)) return [];
  const seenKeys = new Map();

  list.forEach(sub => {
    if (!sub || typeof sub !== 'object') return;
    const rawCode = (sub.code || '').trim();
    const rawName = (sub.name || '').trim();
    if (!rawCode && !rawName) return;
    if (rawCode === 'PA' || sub.id === 'sub-pa' || (rawName && rawName.includes('Predictive Analytics'))) return;

    const code = cleanSubjectName(rawCode, rawCode);
    const name = cleanSubjectName(rawName, code);

    const key = normalizeSubjectKey(code) || normalizeSubjectKey(name) || (sub.id || '').toLowerCase();

    if (seenKeys.has(key)) {
      const existing = seenKeys.get(key);
      seenKeys.set(key, {
        id: existing.id || sub.id,
        name: name.length <= existing.name.length ? name : existing.name,
        code: code || existing.code,
        teacher: existing.teacher || sub.teacher || '',
        room: existing.room || sub.room || '',
        color: existing.color || sub.color || '#6366f1',
        present: Math.max(parseInt(existing.present) || 0, parseInt(sub.present) || 0),
        total: Math.max(parseInt(existing.total) || 0, parseInt(sub.total) || 0),
        target: existing.target || sub.target || 75
      });
    } else {
      seenKeys.set(key, {
        id: sub.id || `sub-${key}`,
        name: name || code || 'Subject',
        code: code || name || 'SUB',
        teacher: sub.teacher || '',
        room: sub.room || '',
        color: sub.color || '#6366f1',
        present: parseInt(sub.present) || 0,
        total: parseInt(sub.total) || 0,
        target: parseInt(sub.target) || 75
      });
    }
  });

  return Array.from(seenKeys.values());
}

// ================= SUBJECTS =================
export function getStudentSubjects() {
  const data = safeGet(KEYS.SUBJECTS, null);
  if (data === null) {
    safeSet(KEYS.SUBJECTS, INITIAL_STUDENT_SUBJECTS);
    return INITIAL_STUDENT_SUBJECTS;
  }
  const clean = data.filter(s => s && s.code !== 'PA' && s.id !== 'sub-pa' && (!s.name || !s.name.includes('Predictive Analytics')));
  return deduplicateSubjects(clean);
}

export function saveStudentSubjects(subjects) {
  const deduped = deduplicateSubjects(subjects);
  return safeSet(KEYS.SUBJECTS, deduped);
}

export function addStudentSubject(subject) {
  const list = getStudentSubjects();
  const subCode = (subject.code || '').trim();
  const subName = (subject.name || '').trim();
  const subKey = normalizeSubjectKey(subCode) || normalizeSubjectKey(subName);

  const existingIdx = list.findIndex(s => {
    const k = normalizeSubjectKey(s.code) || normalizeSubjectKey(s.name) || s.id.toLowerCase();
    return k === subKey || s.id === subject.id;
  });

  const newSubject = {
    ...subject,
    id: existingIdx !== -1 ? list[existingIdx].id : (subject.id || `sub-${Date.now()}`),
    present: parseInt(subject.present) || 0,
    total: parseInt(subject.total) || 0,
    target: parseInt(subject.target) || 75,
    color: subject.color || '#6366f1'
  };

  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...newSubject };
  } else {
    list.push(newSubject);
  }

  saveStudentSubjects(list);
  return newSubject;
}

export function updateStudentSubject(id, updatedFields) {
  const list = getStudentSubjects();
  const idx = list.findIndex(s => s.id === id);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      ...updatedFields,
      present: parseInt(updatedFields.present !== undefined ? updatedFields.present : list[idx].present),
      total: parseInt(updatedFields.total !== undefined ? updatedFields.total : list[idx].total),
      target: parseInt(updatedFields.target !== undefined ? updatedFields.target : list[idx].target)
    };
    saveStudentSubjects(list);
    return list[idx];
  }
  return null;
}

export function deleteStudentSubject(id) {
  const list = getStudentSubjects();
  const filtered = list.filter(s => s.id !== id);
  saveStudentSubjects(filtered);

  // Also remove from routine
  const routine = getWeeklyRoutine();
  Object.keys(routine).forEach(day => {
    routine[day] = (routine[day] || []).filter(slot => slot.subjectId !== id);
  });
  saveWeeklyRoutine(routine);

  return true;
}

export function adjustSubjectAttendance(id, deltaPresent, deltaTotal) {
  const list = getStudentSubjects();
  const idx = list.findIndex(s => s.id === id);
  if (idx !== -1) {
    const newPresent = Math.max(0, (list[idx].present || 0) + deltaPresent);
    const newTotal = Math.max(newPresent, (list[idx].total || 0) + deltaTotal);
    list[idx].present = newPresent;
    list[idx].total = newTotal;
    saveStudentSubjects(list);
    return list[idx];
  }
  return null;
}

// ================= TIMETABLE IMAGE (PHOTO) =================
export function getTimetableImage() {
  try {
    return localStorage.getItem(KEYS.TIMETABLE_IMAGE) || null;
  } catch (e) {
    return null;
  }
}

export function saveTimetableImage(base64DataUrl) {
  try {
    localStorage.setItem(KEYS.TIMETABLE_IMAGE, base64DataUrl);
    return true;
  } catch (e) {
    console.error('Error saving timetable photo:', e);
    return false;
  }
}

export function removeTimetableImage() {
  localStorage.removeItem(KEYS.TIMETABLE_IMAGE);
  return true;
}

// ================= WEEKLY ROUTINE =================
export function getWeeklyRoutine() {
  const data = safeGet(KEYS.WEEKLY_ROUTINE, null);
  if (!data) {
    safeSet(KEYS.WEEKLY_ROUTINE, INITIAL_WEEKLY_ROUTINE);
    return INITIAL_WEEKLY_ROUTINE;
  }
  const cleanRoutine = {};
  Object.keys(data).forEach(day => {
    if (Array.isArray(data[day])) {
      cleanRoutine[day] = data[day].map(slot => ({
        ...slot,
        subjectName: cleanSubjectName(slot.subjectName, slot.subjectCode)
      }));
    } else {
      cleanRoutine[day] = [];
    }
  });
  return cleanRoutine;
}

export function saveWeeklyRoutine(routine) {
  return safeSet(KEYS.WEEKLY_ROUTINE, routine);
}

export function addRoutineSlot(day, slot) {
  const routine = getWeeklyRoutine();
  if (!routine[day]) routine[day] = [];
  const newSlot = {
    ...slot,
    id: slot.id || `slot-${Date.now()}`
  };
  routine[day].push(newSlot);
  saveWeeklyRoutine(routine);
  return newSlot;
}

export function deleteRoutineSlot(day, slotId) {
  const routine = getWeeklyRoutine();
  if (routine[day]) {
    routine[day] = routine[day].filter(s => s.id !== slotId);
    saveWeeklyRoutine(routine);
    return true;
  }
  return false;
}

// ================= DAILY ATTENDANCE LOGS =================
export function getDailyAttendanceLogs() {
  return safeGet(KEYS.DAILY_LOGS, []);
}

export function saveDailyAttendanceLogs(logs) {
  return safeSet(KEYS.DAILY_LOGS, logs);
}

export function markDailyLectureStatus(dateStr, subjectId, status, slotDetails = {}) {
  const logs = getDailyAttendanceLogs();
  const existingIdx = logs.findIndex(l => l.date === dateStr && l.subjectId === subjectId && (slotDetails.id ? l.slotId === slotDetails.id : true));

  const subjects = getStudentSubjects();
  const sub = subjects.find(s => s.id === subjectId);
  const oldStatus = existingIdx !== -1 ? logs[existingIdx].status : null;

  const newLog = {
    id: existingIdx !== -1 ? logs[existingIdx].id : `log-${Date.now()}`,
    slotId: slotDetails.id || null,
    date: dateStr,
    day: slotDetails.day || '',
    subjectId: subjectId,
    subjectName: sub ? sub.name : 'Lecture',
    time: slotDetails.time || '09:00 AM - 10:00 AM',
    room: slotDetails.room || '',
    status: status, // 'present' | 'absent' | 'cancelled'
    timestamp: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    logs[existingIdx] = newLog;
  } else {
    logs.unshift(newLog);
  }
  saveDailyAttendanceLogs(logs);

  // Synchronize subject totals
  if (sub) {
    let presDelta = 0;
    let totDelta = 0;

    if (oldStatus === 'present') {
      presDelta -= 1;
      totDelta -= 1;
    } else if (oldStatus === 'absent') {
      totDelta -= 1;
    }

    if (status === 'present') {
      presDelta += 1;
      totDelta += 1;
    } else if (status === 'absent') {
      totDelta += 1;
    }

    if (presDelta !== 0 || totDelta !== 0) {
      adjustSubjectAttendance(subjectId, presDelta, totDelta);
    }
  }

  return newLog;
}

// ================= HOLIDAYS =================
export function getHolidays() {
  return safeGet(KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
}

export function saveHolidays(holidays) {
  return safeSet(KEYS.HOLIDAYS, holidays);
}

export function addHoliday(holiday) {
  const list = getHolidays();
  const newHol = {
    ...holiday,
    id: holiday.id || `hol-${Date.now()}`,
    type: holiday.type || 'holiday'
  };
  list.push(newHol);
  saveHolidays(list);
  return newHol;
}

export function deleteHoliday(id) {
  const list = getHolidays();
  const filtered = list.filter(h => h.id !== id);
  saveHolidays(filtered);
  return true;
}

export function isDateHoliday(dateStr) {
  const list = getHolidays();
  return list.find(h => h.date === dateStr) || null;
}

// ================= ASSIGNMENTS & DEADLINES =================
export function getAssignments() {
  return safeGet(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
}

export function saveAssignments(assignments) {
  return safeSet(KEYS.ASSIGNMENTS, assignments);
}

export function addAssignment(asg) {
  const list = getAssignments();
  const newAsg = {
    ...asg,
    id: asg.id || `asg-${Date.now()}`,
    completed: false
  };
  list.unshift(newAsg);
  saveAssignments(list);
  return newAsg;
}

export function toggleAssignment(id) {
  const list = getAssignments();
  const idx = list.findIndex(a => a.id === id);
  if (idx !== -1) {
    list[idx].completed = !list[idx].completed;
    saveAssignments(list);
    return list[idx];
  }
  return null;
}

export function deleteAssignment(id) {
  const list = getAssignments();
  const filtered = list.filter(a => a.id !== id);
  saveAssignments(filtered);
  return true;
}

// ================= SETTINGS, REMINDERS & THEME =================
export const DEFAULT_REMINDER_SETTINGS = {
  enabled: true,
  leadTimeMinutes: 10, // 10 min before class alarm
  ringtoneEnabled: true,
  soundType: 'marimba', // 'marimba' | 'chime' | 'buzzer'
  speechEnabled: true,
  browserNotificationEnabled: true
};

export function getSettings() {
  return safeGet(KEYS.SETTINGS, { minAttendanceTarget: 75, collegeName: "Apex Institute of Technology" });
}

export function saveSettings(settings) {
  return safeSet(KEYS.SETTINGS, settings);
}

export function getReminderSettings() {
  return safeGet(KEYS.REMINDERS, DEFAULT_REMINDER_SETTINGS);
}

export function saveReminderSettings(settings) {
  return safeSet(KEYS.REMINDERS, settings);
}

export function getTheme() {
  return localStorage.getItem(KEYS.THEME) || 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
}

// ================= BACKUP & STATS =================
export function exportDataAsJSON() {
  const backup = {
    appName: "AttendX",
    version: "2.1.0",
    exportDate: new Date().toISOString(),
    profile: getStudentProfile(),
    subjects: getStudentSubjects(),
    routine: getWeeklyRoutine(),
    dailyLogs: getDailyAttendanceLogs(),
    holidays: getHolidays(),
    assignments: getAssignments(),
    timetableImage: getTimetableImage(),
    settings: getSettings(),
    reminders: getReminderSettings()
  };
  return JSON.stringify(backup, null, 2);
}

export function importDataFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.subjects || !Array.isArray(data.subjects)) {
      throw new Error("Invalid backup format: missing subjects array.");
    }
    if (data.profile) safeSet(KEYS.PROFILE, data.profile);
    if (data.subjects) safeSet(KEYS.SUBJECTS, data.subjects);
    if (data.routine) safeSet(KEYS.WEEKLY_ROUTINE, data.routine);
    if (data.dailyLogs) safeSet(KEYS.DAILY_LOGS, data.dailyLogs);
    if (data.holidays) safeSet(KEYS.HOLIDAYS, data.holidays);
    if (data.assignments) safeSet(KEYS.ASSIGNMENTS, data.assignments);
    if (data.timetableImage) localStorage.setItem(KEYS.TIMETABLE_IMAGE, data.timetableImage);
    if (data.settings) safeSet(KEYS.SETTINGS, data.settings);
    if (data.reminders) safeSet(KEYS.REMINDERS, data.reminders);
    return { success: true, message: "Attendance & Routine data imported successfully!" };
  } catch (error) {
    return { success: false, message: error.message || "Failed to parse JSON backup file." };
  }
}

export function resetToDefaultData() {
  safeSet(KEYS.PROFILE, INITIAL_STUDENT_PROFILE);
  safeSet(KEYS.SUBJECTS, INITIAL_STUDENT_SUBJECTS);
  safeSet(KEYS.WEEKLY_ROUTINE, INITIAL_WEEKLY_ROUTINE);
  safeSet(KEYS.DAILY_LOGS, generateSeedDailyLogs());
  safeSet(KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
  safeSet(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  safeSet(KEYS.SETTINGS, { minAttendanceTarget: 75, collegeName: "Apex Institute of Technology" });
  localStorage.removeItem(KEYS.TIMETABLE_IMAGE);
  return true;
}

export function clearAllData() {
  safeSet(KEYS.PROFILE, INITIAL_STUDENT_PROFILE);
  safeSet(KEYS.SUBJECTS, []);
  safeSet(KEYS.WEEKLY_ROUTINE, { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] });
  safeSet(KEYS.DAILY_LOGS, []);
  safeSet(KEYS.HOLIDAYS, []);
  safeSet(KEYS.ASSIGNMENTS, []);
  safeSet(KEYS.SETTINGS, { minAttendanceTarget: 75, collegeName: "" });
  localStorage.removeItem(KEYS.TIMETABLE_IMAGE);
  return true;
}

export function getStorageStats() {
  let totalBytes = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith('attendx_')) {
      totalBytes += (localStorage[key].length + key.length) * 2;
    }
  }

  const subjects = getStudentSubjects();
  const routine = getWeeklyRoutine();
  let totalSlots = 0;
  Object.values(routine).forEach(arr => { if (Array.isArray(arr)) totalSlots += arr.length; });
  const logs = getDailyAttendanceLogs();
  const holidays = getHolidays();
  const assignments = getAssignments();
  const hasImage = !!getTimetableImage();

  return {
    usedKB: (totalBytes / 1024).toFixed(2),
    subjectCount: subjects.length,
    routineSlotsCount: totalSlots,
    totalLogsCount: logs.length,
    holidaysCount: holidays.length,
    assignmentsCount: assignments.length,
    hasTimetableImage: hasImage
  };
}
