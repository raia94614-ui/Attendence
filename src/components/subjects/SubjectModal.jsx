import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { addSubject, updateSubject, getTeachers } from '../../utils/storage';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering'
];

export default function SubjectModal({ isOpen, onClose, subject = null, onSaved }) {
  const toast = useToast();
  const isEdit = !!subject;
  const [teachersList, setTeachersList] = useState([]);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: 'Computer Science',
    semester: '4',
    teacherId: '',
    credits: 4,
    color: 'indigo'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const teachers = getTeachers();
      setTeachersList(teachers);
      if (subject) {
        setFormData({
          code: subject.code || '',
          name: subject.name || '',
          department: subject.department || 'Computer Science',
          semester: subject.semester || '4',
          teacherId: subject.teacherId || '',
          credits: subject.credits || 4,
          color: subject.color || 'indigo'
        });
      } else {
        setFormData({
          code: '',
          name: '',
          department: 'Computer Science',
          semester: '4',
          teacherId: teachers.length > 0 ? teachers[0].id : '',
          credits: 4,
          color: 'indigo'
        });
      }
      setErrors({});
    }
  }, [subject, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.code.trim()) errs.code = 'Subject code is required.';
    if (!formData.name.trim()) errs.name = 'Subject name is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      updateSubject(subject.id, formData);
      toast.success(`Updated subject ${formData.code} - ${formData.name}`);
    } else {
      addSubject(formData);
      toast.success(`Created new course ${formData.code}`);
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Course / Subject' : 'Add New Course / Subject'}
      description="Define the curriculum subject, semester level, and assigned teacher."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Subject Code *
            </label>
            <input
              type="text"
              placeholder="e.g. CS401"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.code ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.code && <p className="text-[11px] text-rose-500">{errors.code}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Credit Hours
            </label>
            <input
              type="number"
              min="1"
              max="6"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Course Title / Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Data Structures & Algorithms"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3.5 py-2 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
            }`}
          />
          {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Semester
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Instructor / Assigned Faculty
          </label>
          <select
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="">-- Unassigned --</option>
            {teachersList.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
          >
            {isEdit ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
