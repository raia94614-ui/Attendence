// Web Audio API Ringtone Synthesizer & Speech Voice Announcement Utility
// 100% Offline, zero external MP3 dependencies required.

let audioCtx = null;
let activeOscillators = [];
let loopInterval = null;
let isRinging = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a single synthesized tone with ADSR envelope
 */
function playTone(freq, type = 'sine', duration = 0.3, startTime = 0, gainLevel = 0.25) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    // Smooth envelope (attack, decay)
    const t = ctx.currentTime + startTime;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(gainLevel, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + duration);

    activeOscillators.push(osc);
    osc.onended = () => {
      activeOscillators = activeOscillators.filter(o => o !== osc);
    };
  } catch (e) {
    console.warn('Audio tone play error:', e);
  }
}

/**
 * Plays an iPhone/Pixel-style Marimba / Ringtone melody pattern
 */
function playMarimbaPattern() {
  // Melodic notes in Hz (C5, E5, G5, B5, C6, G5, E5, C5)
  const melody = [
    { note: 523.25, time: 0.0, dur: 0.16, type: 'triangle' }, // C5
    { note: 659.25, time: 0.16, dur: 0.16, type: 'triangle' }, // E5
    { note: 783.99, time: 0.32, dur: 0.16, type: 'triangle' }, // G5
    { note: 987.77, time: 0.48, dur: 0.22, type: 'sine' },     // B5
    { note: 1046.50, time: 0.72, dur: 0.28, type: 'sine' },    // C6
    { note: 783.99, time: 1.05, dur: 0.18, type: 'triangle' }, // G5
    { note: 880.00, time: 1.25, dur: 0.22, type: 'sine' },     // A5
    { note: 659.25, time: 1.50, dur: 0.35, type: 'triangle' }  // E5
  ];

  melody.forEach(item => {
    playTone(item.note, item.type, item.dur, item.time, 0.28);
  });
}

/**
 * Plays soft double chime alert
 */
function playChimePattern() {
  playTone(880, 'sine', 0.4, 0, 0.3); // A5
  playTone(1318.5, 'sine', 0.6, 0.25, 0.25); // E6
  playTone(1760, 'sine', 0.8, 0.55, 0.2); // A6
}

/**
 * Plays electronic urgent alarm buzzer
 */
function playBuzzerPattern() {
  for (let i = 0; i < 4; i++) {
    playTone(850, 'sawtooth', 0.12, i * 0.18, 0.2);
  }
}

/**
 * Start loop of selected ringtone sound
 */
export function playClassRingtone(soundType = 'marimba') {
  stopClassRingtone();
  isRinging = true;

  const playSequence = () => {
    if (!isRinging) return;
    if (soundType === 'chime') {
      playChimePattern();
    } else if (soundType === 'buzzer') {
      playBuzzerPattern();
    } else {
      playMarimbaPattern();
    }
  };

  playSequence();
  // Repeat every 2.4 seconds like an incoming phone call
  const intervalTime = soundType === 'buzzer' ? 1400 : 2500;
  loopInterval = setInterval(playSequence, intervalTime);
}

/**
 * Stop active ringtone audio immediately
 */
export function stopClassRingtone() {
  isRinging = false;
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }
  activeOscillators.forEach(osc => {
    try {
      osc.stop();
    } catch (e) {}
  });
  activeOscillators = [];
}

/**
 * Speaks a natural voice announcement using SpeechSynthesis API
 */
export function speakClassAlert({ subjectName, room, minutesBefore = 5, studentName = '' }) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // cancel any active speech

    const greeting = studentName ? `Hey ${studentName}!` : 'Attention!';
    const timeText = minutesBefore === 0 
      ? 'is starting right now' 
      : `starts in ${minutesBefore} minute${minutesBefore > 1 ? 's' : ''}`;
    const roomText = room ? `in ${room}` : '';

    const text = `${greeting} Your ${subjectName} class ${timeText} ${roomText}. Time to attend!`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    // Pick English natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

/**
 * Stop active speech immediately
 */
export function stopClassSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}
