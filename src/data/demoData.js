// AttendX Student Personal Attendance & Routine Data Seeds

export const INITIAL_STUDENT_PROFILE = {
  name: "Alex Rivera",
  college: "Apex Institute of Technology",
  department: "Computer Science & Engineering",
  semester: "Semester 4 (Sec A)",
  rollNumber: "CS-2024-042",
  minTarget: 75
};

export const INITIAL_STUDENT_SUBJECTS = [
  {
    id: "sub-1",
    code: "CS401",
    name: "Data Structures & Algorithms",
    teacher: "Prof. Sarah Jenkins",
    color: "#6366f1", // Indigo
    target: 75,
    present: 22,
    total: 25,
    credits: 4
  },
  {
    id: "sub-2",
    code: "CS402",
    name: "Database Management Systems",
    teacher: "Dr. Marcus Sterling",
    color: "#0ea5e9", // Sky blue
    target: 75,
    present: 19,
    total: 22,
    credits: 4
  },
  {
    id: "sub-3",
    code: "CS403",
    name: "Operating Systems",
    teacher: "Dr. Elena Rostova",
    color: "#10b981", // Emerald
    target: 75,
    present: 15,
    total: 21,
    credits: 3
  },
  {
    id: "sub-4",
    code: "CS404",
    name: "Computer Networks",
    teacher: "Dr. Priya Sundaram",
    color: "#f59e0b", // Amber
    target: 75,
    present: 18,
    total: 24,
    credits: 3
  },
  {
    id: "sub-5",
    code: "IT401",
    name: "Full Stack Web Development",
    teacher: "Prof. Rajesh Kothari",
    color: "#8b5cf6", // Purple
    target: 75,
    present: 20,
    total: 22,
    credits: 4
  }
];

export const INITIAL_WEEKLY_ROUTINE = {
  Monday: [
    { id: "mon-1", subjectId: "sub-1", subjectName: "Data Structures & Algorithms", time: "09:00 AM - 10:00 AM", room: "CS-Lab 2" },
    { id: "mon-2", subjectId: "sub-2", subjectName: "Database Management Systems", time: "10:15 AM - 11:15 AM", room: "Room 304" },
    { id: "mon-3", subjectId: "sub-5", subjectName: "Full Stack Web Development", time: "01:30 PM - 03:30 PM", room: "Web Lab" }
  ],
  Tuesday: [
    { id: "tue-1", subjectId: "sub-3", subjectName: "Operating Systems", time: "09:00 AM - 10:00 AM", room: "Room 208" },
    { id: "tue-2", subjectId: "sub-4", subjectName: "Computer Networks", time: "10:15 AM - 11:15 AM", room: "Room 102" },
    { id: "tue-3", subjectId: "sub-1", subjectName: "Data Structures & Algorithms", time: "11:30 AM - 12:30 PM", room: "CS-Lab 2" }
  ],
  Wednesday: [
    { id: "wed-1", subjectId: "sub-2", subjectName: "Database Management Systems", time: "09:00 AM - 10:00 AM", room: "Room 304" },
    { id: "wed-2", subjectId: "sub-3", subjectName: "Operating Systems", time: "10:15 AM - 11:15 AM", room: "OS-Lab" },
    { id: "wed-3", subjectId: "sub-4", subjectName: "Computer Networks", time: "02:00 PM - 03:00 PM", room: "Room 102" }
  ],
  Thursday: [
    { id: "thu-1", subjectId: "sub-1", subjectName: "Data Structures & Algorithms", time: "09:00 AM - 10:00 AM", room: "CS-Lab 2" },
    { id: "thu-2", subjectId: "sub-5", subjectName: "Full Stack Web Development", time: "11:30 AM - 12:30 PM", room: "Room 304" },
    { id: "thu-3", subjectId: "sub-2", subjectName: "Database Management Systems", time: "02:00 PM - 04:00 PM", room: "DB-Lab" }
  ],
  Friday: [
    { id: "fri-1", subjectId: "sub-4", subjectName: "Computer Networks", time: "09:00 AM - 10:00 AM", room: "Room 102" },
    { id: "fri-2", subjectId: "sub-3", subjectName: "Operating Systems", time: "10:15 AM - 11:15 AM", room: "Room 208" },
    { id: "fri-3", subjectId: "sub-5", subjectName: "Full Stack Web Development", time: "01:30 PM - 02:30 PM", room: "Web Lab" }
  ],
  Saturday: [
    { id: "sat-1", subjectId: "sub-1", subjectName: "Data Structures (Tutorial/Doubt)", time: "10:00 AM - 11:30 AM", room: "Room 304" }
  ],
  Sunday: []
};

export const INITIAL_HOLIDAYS = [
  { id: "hol-1", name: "National Festival Holiday", date: "2026-10-02", type: "holiday" },
  { id: "hol-2", name: "Diwali Semester Break", date: "2026-11-01", type: "holiday" },
  { id: "hol-3", name: "College Annual Sports Fest", date: "2026-11-14", type: "event" },
  { id: "hol-4", name: "Mid-Term Examination Week", date: "2026-10-15", type: "exam" }
];

export const INITIAL_ASSIGNMENTS = [
  { id: "asg-1", subjectId: "sub-1", subjectName: "Data Structures", title: "Binary Search Tree Implementation Lab Sheet", dueDate: "2026-09-20", completed: false },
  { id: "asg-2", subjectId: "sub-2", subjectName: "Database Management", title: "SQL Normalization & Indexing Quiz", dueDate: "2026-09-22", completed: false },
  { id: "asg-3", subjectId: "sub-5", subjectName: "Web Development", title: "React Portfolio Project Milestone 1", dueDate: "2026-09-25", completed: true }
];

export function generateSeedDailyLogs() {
  const logs = [];
  const today = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 24; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayName = daysOfWeek[d.getDay()];

    if (dayName === 'Sunday') continue;

    const dateStr = d.toISOString().split('T')[0];
    const scheduled = INITIAL_WEEKLY_ROUTINE[dayName] || [];

    scheduled.forEach((item, idx) => {
      let status = "present";
      if ((i + idx) % 7 === 0) status = "absent";
      else if (i === 11 && idx === 1) status = "cancelled";

      logs.push({
        id: `log-${dateStr}-${item.subjectId}-${idx}`,
        date: dateStr,
        day: dayName,
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        time: item.time,
        room: item.room,
        status: status,
        timestamp: new Date(d.setHours(9 + idx * 2, 0, 0, 0)).toISOString()
      });
    });
  }

  return logs;
}
