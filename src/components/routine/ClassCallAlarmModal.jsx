import React, { useEffect, useState } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Bell,
  Clock,
  MapPin,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { useRoutineAlert } from '../../context/RoutineAlertContext';
import { stopClassRingtone, stopClassSpeech } from '../../utils/routineAlarmAudio';

export default function ClassCallAlarmModal({ onNavigate }) {
  const {
    activeAlert,
    dismissAlert,
    snoozeAlert,
    attendClassDirectly
  } = useRoutineAlert();

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(false);
  }, [activeAlert]);

  if (!activeAlert) return null;

  const { slot, subject, minutesBefore, isTest } = activeAlert;

  const handleToggleMute = () => {
    if (!isMuted) {
      stopClassRingtone();
      stopClassSpeech();
      setIsMuted(true);
    }
  };

  const handleAttend = () => {
    attendClassDirectly(slot);
  };

  const handleViewTimetable = () => {
    dismissAlert();
    if (onNavigate) {
      onNavigate('timetable');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-300">
      
      {/* Dark Ambient Backdrop with Blur and Glow */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl transition-opacity"
        onClick={dismissAlert}
      />

      {/* Pulsing Ambient Background Glow Circles */}
      <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-indigo-600/25 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none -bottom-10" />

      {/* Modal Card Styled like an Incoming Call Screen */}
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[96dvh] overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-indigo-500/40 shadow-2xl text-white flex flex-col items-center text-center p-4 sm:p-8 space-y-4 sm:space-y-6 my-auto">
        
        {/* Top Header Tag */}
        <div className="w-full flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            {isTest ? '🧪 Test Call Alarm' : '🚨 Class Starting Alert'}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Quick Mute Audio */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title={isMuted ? 'Muted' : 'Mute Ringtone'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
            </button>

            {/* Close / Dismiss */}
            <button
              onClick={dismissAlert}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Caller Avatar with Animated Ripple Rings */}
        <div className="relative flex items-center justify-center pt-2">
          {/* Ripple Wave 1 */}
          <div className="absolute w-36 h-36 rounded-full border border-indigo-500/40 animate-ping pointer-events-none duration-1000" />
          {/* Ripple Wave 2 */}
          <div className="absolute w-28 h-28 rounded-full border border-indigo-400/60 animate-pulse pointer-events-none" />

          <div
            className="w-24 h-24 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-white font-black text-2xl relative z-10 ring-4 ring-white/10"
            style={{ backgroundColor: subject.color || '#6366f1' }}
          >
            <PhoneCall className="w-9 h-9 animate-bounce" />
            <span className="text-[11px] font-mono tracking-wider opacity-90 mt-0.5">
              {subject.code || 'CLASS'}
            </span>
          </div>
        </div>

        {/* Caller Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {subject.name}
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-indigo-200">
            <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {minutesBefore === 0 ? 'Starting Now!' : `In ${minutesBefore} Minutes (${slot.time || 'Period'})`}
            </span>

            {slot.room && (
              <span className="inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {slot.room}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 italic pt-1">
            "Incoming lecture call alert • Time to head to class!"
          </p>
        </div>

        {/* Sound Wave Graphic */}
        <div className="flex items-center justify-center gap-1 h-6">
          {[40, 75, 100, 60, 90, 45, 80, 100, 50, 70].map((h, i) => (
            <span
              key={i}
              className="w-1 bg-gradient-to-t from-indigo-500 to-teal-400 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>

        {/* Call Actions */}
        <div className="w-full space-y-3 pt-2">
          
          {/* Main Primary Action: Attend Class & Mark Present */}
          <button
            type="button"
            onClick={handleAttend}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>Attend Class & Mark Present (+1)</span>
          </button>

          {/* Secondary Actions: Snooze 2m & Decline/Dismiss */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => snoozeAlert(2)}
              className="py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Snooze 2 Mins</span>
            </button>

            <button
              type="button"
              onClick={dismissAlert}
              className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Dismiss / Skip</span>
            </button>
          </div>

          {/* Quick Timetable link */}
          <button
            type="button"
            onClick={handleViewTimetable}
            className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center justify-center gap-1 mx-auto transition-colors pt-1"
          >
            <Calendar className="w-3 h-3" />
            <span>Open Timetable Schedule</span>
          </button>

        </div>

      </div>

    </div>
  );
}
