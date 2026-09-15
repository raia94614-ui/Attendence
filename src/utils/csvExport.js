// Frontend Pure JavaScript CSV Export Utility

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function downloadCSV(filename, csvContent) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportStudentsToCSV(students) {
  const headers = ['Student ID', 'Roll Number', 'Full Name', 'Email', 'Department', 'Semester', 'Section', 'Phone', 'Parent Contact', 'Status'];
  
  const rows = students.map(s => [
    escapeCSV(s.studentId),
    escapeCSV(s.rollNumber),
    escapeCSV(s.name),
    escapeCSV(s.email),
    escapeCSV(s.department),
    escapeCSV(s.semester),
    escapeCSV(s.section),
    escapeCSV(s.phone),
    escapeCSV(s.parentContact),
    escapeCSV(s.status)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`AttendX_Students_Export_${new Date().toISOString().split('T')[0]}`, csvContent);
}

export function exportAttendanceSessionsToCSV(sessions) {
  const headers = ['Session ID', 'Date', 'Subject Code', 'Subject Name', 'Department', 'Semester', 'Section', 'Marked By', 'Total Students', 'Present', 'Absent', 'Late', 'Excused', 'Attendance %'];

  const rows = sessions.map(s => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    const total = s.records ? s.records.length : 0;

    (s.records || []).forEach(r => {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'excused') excused++;
    });

    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    return [
      escapeCSV(s.id),
      escapeCSV(s.date),
      escapeCSV(s.subjectCode),
      escapeCSV(s.subjectName),
      escapeCSV(s.department),
      escapeCSV(s.semester),
      escapeCSV(s.section),
      escapeCSV(s.markedBy || ''),
      total,
      present,
      absent,
      late,
      excused,
      `${pct}%`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`AttendX_Attendance_Sessions_${new Date().toISOString().split('T')[0]}`, csvContent);
}

export function exportDetailedAttendanceLogsToCSV(sessions) {
  const headers = ['Date', 'Subject Code', 'Subject Name', 'Semester', 'Section', 'Roll Number', 'Student Name', 'Status', 'Remarks', 'Marked By'];

  const rows = [];
  sessions.forEach(s => {
    (s.records || []).forEach(r => {
      rows.push([
        escapeCSV(s.date),
        escapeCSV(s.subjectCode),
        escapeCSV(s.subjectName),
        escapeCSV(s.semester),
        escapeCSV(s.section),
        escapeCSV(r.rollNumber),
        escapeCSV(r.studentName),
        escapeCSV(r.status.toUpperCase()),
        escapeCSV(r.remarks || ''),
        escapeCSV(s.markedBy || '')
      ].join(','));
    });
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(`AttendX_Detailed_Logs_${new Date().toISOString().split('T')[0]}`, csvContent);
}

export function exportStudentReportToCSV(student, studentStats) {
  const meta = [
    `AttendX Student Attendance Report`,
    `Generated on: ${new Date().toLocaleDateString()}`,
    `Student Name: ${student.name}`,
    `Roll Number: ${student.rollNumber}`,
    `Department: ${student.department}`,
    `Semester: ${student.semester} - Section ${student.section}`,
    `Overall Attendance: ${studentStats.overallPercentage}% (${studentStats.present}/${studentStats.totalClasses} classes)`,
    `\r\n--- SUBJECT-WISE BREAKDOWN ---`,
    ['Subject Code', 'Subject Name', 'Total Classes', 'Present', 'Absent', 'Late', 'Excused', 'Percentage', 'Status'].join(',')
  ];

  const subjectRows = studentStats.subjectBreakdown.map(sub => [
    escapeCSV(sub.code),
    escapeCSV(sub.name),
    sub.total,
    sub.present,
    sub.absent,
    sub.late,
    sub.excused,
    `${sub.percentage}%`,
    escapeCSV(sub.status.toUpperCase())
  ].join(','));

  const historyHeader = [`\r\n--- ATTENDANCE LOG HISTORY ---`, ['Date', 'Subject', 'Status', 'Remarks', 'Recorded By'].join(',')];
  
  const historyRows = studentStats.sessionHistory.map(h => [
    escapeCSV(h.date),
    escapeCSV(h.subjectName || h.subjectCode),
    escapeCSV(h.status.toUpperCase()),
    escapeCSV(h.remarks || ''),
    escapeCSV(h.markedBy || '')
  ].join(','));

  const csvContent = [...meta, ...subjectRows, ...historyHeader, ...historyRows].join('\r\n');
  downloadCSV(`Attendance_${student.rollNumber}_${new Date().toISOString().split('T')[0]}`, csvContent);
}
