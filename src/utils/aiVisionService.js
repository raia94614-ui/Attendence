// AttendX AI Vision Service
// Combines Offline Computer Vision Pattern Recognition + Google Gemini Vision API

import {
  CHITKARA_BE_CSE_5A_ROUTINE,
  CHITKARA_BE_CSE_5A_SUBJECTS
} from '../data/demoData';
import {
  extractTextFromImage,
  parseTimetableScheduleFromOCR,
  analyzeImageQuality
} from './timetableOCR';

const GEMINI_API_KEY_STORAGE = 'attendx_gemini_api_key';

export function getSavedGeminiApiKey() {
  try {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE) || '';
  } catch (e) {
    return '';
  }
}

export function saveGeminiApiKey(key) {
  try {
    if (!key || key.trim() === '') {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    } else {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Scan Timetable using Google Gemini Multimodal Vision Model
 */
export async function analyzeTimetableWithGeminiVision(imageBase64, apiKey) {
  const key = apiKey || getSavedGeminiApiKey();
  if (!key) {
    throw new Error('Please enter a Google Gemini API Key or use the Built-in Offline Vision Engine.');
  }

  let mimeType = 'image/png';
  let base64Data = imageBase64;
  if (imageBase64.includes('data:') && imageBase64.includes(';base64,')) {
    const parts = imageBase64.split(';base64,');
    mimeType = parts[0].replace('data:', '') || 'image/png';
    base64Data = parts[1];
  }

  const prompt = `You are an expert academic timetable vision scanner.
Analyze this university class schedule / timetable picture carefully and extract the complete weekly routine.

Strict Accuracy Rules:
1. Identify all days (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday).
2. For each day, find all scheduled lecture periods, subject codes, faculty/teacher names, room numbers, and exact time slots.
3. If a slot or day is empty, keep its array empty. Do NOT make up fake subjects.
4. If a field like teacher or room is not visible or unclear, leave it as an empty string ("") and set "needsReview": true.
5. For each lecture period, extract:
   - subjectCode: Exact short code/acronym from the cell (e.g., ADI-FA, ADI, BEE, NALR-I, AAIPD, AoC-II-G1, BPC-G3)
   - subjectName: Full subject name
   - teacher: Faculty name (e.g. Ms Ritu, Mr Ritesh, Dr Ashutosh, Mr. Ajay, Mr Sandeep, Mr Manish, Mr Satish)
   - room: Classroom / Lab number (e.g. RJ310R, CVR309R)
   - time: Period start and end time (e.g. "09:30 AM - 11:10 AM", "11:10 AM - 12:50 PM", "01:40 PM - 02:30 PM", "02:30 PM - 04:10 PM")
   - confidence: Number from 1 to 100 representing recognition certainty
   - needsReview: boolean (true if uncertain or field is missing)

Return ONLY a valid, raw JSON object (no markdown, no backticks) with this structure:
{
  "title": "Course/Section title if visible",
  "subjects": [
    { "code": "ADI-FA", "name": "ADI-FA (App Dev & Innovation)", "teacher": "Ms Ritu", "room": "RJ310R", "color": "#6366f1" }
  ],
  "routine": {
    "Monday": [],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": [],
    "Sunday": []
  }
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: "application/json"
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error?.message || `API error (${response.status})`;
    throw new Error(`Gemini Vision Error: ${errMsg}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

  const parsed = JSON.parse(cleanJson);

  const palette = ['#6366f1', '#8b5cf6', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#f97316', '#06b6d4'];
  const subjects = (parsed.subjects || []).map((s, idx) => ({
    id: `sub-${(s.code || `sub-${idx}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: s.name || s.code || `Subject ${idx + 1}`,
    code: s.code || 'SUB',
    teacher: s.teacher || '',
    room: s.room || '',
    color: s.color || palette[idx % palette.length],
    present: 0,
    total: 0,
    target: 75
  }));

  const routine = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };

  const subMap = new Map();
  subjects.forEach(s => {
    subMap.set(s.code.toLowerCase(), s);
    subMap.set(s.name.toLowerCase(), s);
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let totalSlots = 0;

  days.forEach(d => {
    const rawDaySlots = parsed.routine?.[d] || [];
    routine[d] = rawDaySlots.map((slot, sIdx) => {
      totalSlots++;
      const matched = subMap.get((slot.subjectCode || '').toLowerCase()) ||
                      subMap.get((slot.subjectName || '').toLowerCase()) ||
                      subjects[0];
      
      const score = slot.confidence !== undefined ? slot.confidence : 90;
      const isReview = slot.needsReview || !slot.subjectName || !slot.time || score < 65;

      return {
        id: `slot-${d.toLowerCase()}-${sIdx + 1}-${Date.now()}`,
        subjectId: matched ? matched.id : `sub-auto-${sIdx}`,
        subjectName: slot.subjectName || matched?.name || 'Lecture',
        subjectCode: slot.subjectCode || matched?.code || 'SUB',
        teacher: slot.teacher || matched?.teacher || '',
        time: slot.time || '09:30 AM - 11:10 AM',
        room: slot.room || matched?.room || '',
        type: slot.type || 'Lecture',
        confidenceScore: score,
        confidenceLevel: score >= 85 ? 'high' : score >= 65 ? 'medium' : 'low',
        isNeedsReview: isReview
      };
    });
  });

  return {
    routine,
    subjects,
    totalSlots,
    title: parsed.title || 'Weekly Timetable'
  };
}

/**
 * Intelligent Built-in Vision Pattern Recognizer (Offline Spatial OCR Model)
 */
export async function analyzeTimetableWithBuiltinAI(imageBase64, onProgress, preprocessOpts = {}) {
  if (onProgress) onProgress({ status: 'Assessing image quality & exposure...', progress: 15 });
  const quality = await analyzeImageQuality(imageBase64);

  if (onProgress) onProgress({ status: 'Enhancing contrast, sharpening & deskewing...', progress: 30 });
  
  let ocrResult = { text: '', words: [], lines: [] };
  try {
    ocrResult = await extractTextFromImage(imageBase64, (p) => {
      if (onProgress) onProgress({ status: p.status, progress: 30 + Math.round(p.progress * 0.5) });
    }, preprocessOpts);
  } catch (e) {
    console.warn('OCR error:', e);
  }

  if (onProgress) onProgress({ status: 'Running Spatial Table Structure Recognizer...', progress: 85 });

  const parsed = parseTimetableScheduleFromOCR(ocrResult);
  parsed.qualityAnalysis = quality;

  return parsed;
}

