import React from 'react';
import Modal from '../common/Modal';
import { Printer, Download, GraduationCap, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { formatDate, getTodayDateString } from '../../utils/dateUtils';
import { downloadCSV } from '../../utils/csvExport';

export default function PrintableAttendanceSlip({ isOpen, onClose, profile, metrics, settings }) {
  if (!isOpen || !profile || !metrics) return null;

  const todayStr = getTodayDateString();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = ['Subject Code', 'Subject Title', 'Classes Attended', 'Total Classes', 'Attendance %', 'Status'];
    const rows = metrics.subjects.map(s => [
      `"${s.code || 'SUB'}"`,
      `"${s.name}"`,
      s.present,
      s.total,
      `"${s.percentage}%"`,
      `"${s.percentage >= (s.target || 75) ? 'ELIGIBLE' : 'SHORTAGE'}"`
    ].join(','));

    const meta = [
      `"ATTENDX OFFICIAL ATTENDANCE TRANSCRIPT"`,
      `"Institution: ${profile.college || 'College'}"`,
      `"Student Name: ${profile.name}"`,
      `"Roll Number: ${profile.rollNumber}"`,
      `"Department: ${profile.department}"`,
      `"Overall Attendance: ${metrics.overallPercentage}%"`,
      `"Date: ${formatDate(todayStr)}"`,
      `\r\n`
    ];

    downloadCSV(`Attendance_Slip_${profile.rollNumber}_${todayStr}`, [...meta, headers.join(','), ...rows].join('\r\n'));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Attendance Transcript Slip"
      description="Preview and print official attendance summary sheet for faculty / HOD submission"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 no-print">
          <span className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
            Ready to print or save as PDF via your browser's print dialog.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Printable Transcript Document Paper */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 print:border-none print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                {profile.college || 'Institute of Technology'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                Official Student Attendance & Eligibility Transcript
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                {metrics.isEligible ? 'ELIGIBLE' : 'ATTENDANCE SHORTAGE'}
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Date: {formatDate(todayStr)}</p>
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <p className="text-slate-400 font-medium text-[10px] uppercase">Student Name</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile.name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[10px] uppercase">Roll Number</p>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{profile.rollNumber}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[10px] uppercase">Department / Branch</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile.department}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[10px] uppercase">Semester & Batch</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile.semester}</p>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-3 gap-3 text-center border-y border-slate-200 dark:border-slate-800 py-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Classes Held</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{metrics.totalHeld}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Classes Attended</p>
              <p className="text-xl font-black text-emerald-600">{metrics.totalPresent}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Overall Attendance</p>
              <p className={`text-xl font-black ${metrics.isEligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                {metrics.overallPercentage}%
              </p>
            </div>
          </div>

          {/* Subjects Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Course-Wise Attendance Breakdown
            </h4>
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-2.5">Code</th>
                  <th className="p-2.5">Subject Title</th>
                  <th className="p-2.5 text-center">Attended</th>
                  <th className="p-2.5 text-center">Total</th>
                  <th className="p-2.5 text-center">Percentage</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics.subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono font-bold">{sub.code || 'SUB'}</td>
                    <td className="p-2.5 font-medium">{sub.name}</td>
                    <td className="p-2.5 text-center font-semibold text-emerald-600">{sub.present}</td>
                    <td className="p-2.5 text-center font-semibold">{sub.total}</td>
                    <td className="p-2.5 text-center font-bold">{sub.percentage}%</td>
                    <td className="p-2.5 text-right font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${sub.percentage >= sub.target ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {sub.percentage >= sub.target ? 'Satisfied' : 'Shortage'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures Row */}
          <div className="grid grid-cols-3 gap-8 pt-10 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-700 dark:text-slate-300">Student Signature</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-700 dark:text-slate-300">Faculty Advisor / Mentor</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-700 dark:text-slate-300">Head of Department (HOD)</p>
            </div>
          </div>

        </div>

      </div>
    </Modal>
  );
}
