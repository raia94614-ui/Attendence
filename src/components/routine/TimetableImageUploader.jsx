import React, { useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Camera,
  CheckCircle2
} from 'lucide-react';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { getTimetableImage, saveTimetableImage, removeTimetableImage } from '../../utils/storage';

export default function TimetableImageUploader({ onImageChange }) {
  const toast = useToast();
  const [imageSrc, setImageSrc] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setImageSrc(getTimetableImage());
  }, []);

  const handleFileUpload = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      saveTimetableImage(dataUrl);
      setImageSrc(dataUrl);
      if (onImageChange) onImageChange(dataUrl);
      toast.success('Timetable picture uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileUpload(file);
  };

  const handleRemove = () => {
    removeTimetableImage();
    setImageSrc(null);
    if (onImageChange) onImageChange(null);
    toast.info('Timetable picture removed.');
  };

  return (
    <div className="space-y-4">
      {imageSrc ? (
        /* Image Preview Box */
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <ImageIcon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  My Timetable Picture
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Uploaded college schedule notice / photo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full View</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold cursor-pointer transition-colors border border-indigo-200/60 dark:border-indigo-800/40">
                <Camera className="w-3.5 h-3.5" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleRemove}
                title="Remove photo"
                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Picture Display Canvas */}
          <div
            onClick={() => setIsFullscreen(true)}
            className="relative w-full max-h-[420px] rounded-2xl overflow-hidden bg-slate-950/5 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center cursor-pointer group"
          >
            <img
              src={imageSrc}
              alt="Class Timetable"
              className="w-full max-h-[400px] object-contain transition-transform duration-200 group-hover:scale-101"
            />
            <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                <Maximize2 className="w-3.5 h-3.5" /> Click to Enlarge
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed text-center transition-all flex flex-col items-center justify-center ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-600'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs">
            <Camera className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Upload Your College Timetable Picture
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-5">
            Take a photo or screenshot of your college timetable notice and upload it here so you can view your schedule anytime in 1 click.
          </p>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-102 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Select Timetable Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Fullscreen Zoom Modal */}
      {isFullscreen && (
        <Modal
          isOpen={isFullscreen}
          onClose={() => {
            setIsFullscreen(false);
            setZoomLevel(1);
          }}
          title="Timetable Photo Viewer"
          description="View and inspect your college timetable screenshot"
          maxWidth="max-w-5xl"
        >
          <div className="space-y-3">
            {/* Zoom Controls Bar */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.25))}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <ZoomIn className="w-4 h-4" /> Zoom In
                </button>
                <button
                  onClick={() => setZoomLevel(z => Math.max(0.75, z - 0.25))}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <ZoomOut className="w-4 h-4" /> Zoom Out
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset ({Math.round(zoomLevel * 100)}%)
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                Pinch or scroll to inspect
              </span>
            </div>

            {/* Canvas */}
            <div className="overflow-auto max-h-[75vh] rounded-2xl bg-slate-950 p-4 flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Timetable"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                className="max-w-full transition-transform duration-150"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
