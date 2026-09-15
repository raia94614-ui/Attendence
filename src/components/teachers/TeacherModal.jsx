import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { addTeacher, updateTeacher, getSubjects } from '../../utils/storage';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering'
];

export default function TeacherModal({ isOpen, onClose, teacher = null, onSaved }) {
  const toast = useToast();
  const isEdit = !!teacher;
  const [subjectsList, setSubjectsList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science',
    phone: '',
    office: '',
    subjects: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSubjectsList(getSubjects());
      if (teacher) {
        setFormData({
          name: teacher.name || '',
          email: teacher.email || '',
          department: teacher.department || 'Computer Science',
          phone: teacher.phone || '',
          office: teacher.office || '',
          subjects: teacher.subjects || []
        });
      } else {
        setFormData({
          name: '',
          email: '',
          department: 'Computer Science',
          phone: '',
          office: 'Main Academic Block',
          subjects: []
        });
      }
      setErrors({});
    }
  }, [teacher, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full Name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Invalid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toggleSubject = (subCode) => {
    setFormData(prev => {
      const exists = prev.subjects.includes(subCode);
      if (exists) {
        return { ...prev, subjects: prev.subjects.filter(c => c !== subCode) };
      } else {
        return { ...prev, subjects: [...prev.subjects, subCode] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      updateTeacher(teacher.id, formData);
      toast.success(`Updated faculty member ${formData.name}`);
    } else {
      addTeacher(formData);
      toast.success(`Added faculty member ${formData.name}`);
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Faculty Member' : 'Add New Faculty Member'}
      description="Enter the teacher's profile details and assigned subject courses."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Faculty Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Dr. Arthur Vance"
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
              Email Address *
            </label>
            <input
              type="email"
              placeholder="e.g. teacher@attendx.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.email && <p className="text-[11px] text-rose-500">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Contact Phone
            </label>
            <input
              type="text"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Office / Room Location
            </label>
            <input
              type="text"
              placeholder="e.g. Block A, Room 302"
              value={formData.office}
              onChange={(e) => setFormData({ ...formData, office: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Assigned Subjects Multi-Select */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Assigned Teaching Subjects
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            {subjectsList.map(sub => {
              const isSelected = formData.subjects.includes(sub.code);
              return (
                <button
                  type="button"
                  key={sub.code}
                  onClick={() => toggleSubject(sub.code)}
                  className={`p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <span className="font-bold block">{sub.code}</span>
                  <span className="text-[10px] opacity-80 truncate block">{sub.name}</span>
                </button>
              );
            })}
          </div>
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
            {isEdit ? 'Save Changes' : 'Add Teacher'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
