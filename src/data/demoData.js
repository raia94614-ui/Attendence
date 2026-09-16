// AttendX Student Personal Attendance & Routine Data
// Preset with authentic Chitkara University BE-CSE-5A schedule

export const INITIAL_STUDENT_PROFILE = {
  name: "",
  college: "",
  department: "",
  semester: "",
  rollNumber: "",
  minTarget: 75
};

export const CHITKARA_BE_CSE_5A_SUBJECTS = [
  {
    id: "sub-aaipd",
    name: "AAIPD (Applied AI & Product Design)",
    code: "AAIPD",
    teacher: "Dr Ashutosh",
    room: "RJ310R",
    color: "#0ea5e9",
    present: 0,
    total: 0,
    target: 75
  },
  {
    id: "sub-adi-fa",
    name: "ADI-FA (App Dev & Innovation)",
    code: "ADI-FA",
    teacher: "Ms Ritu",
    room: "RJ310R",
    color: "#6366f1",
    present: 0,
    total: 0,
    target: 75
  },
  {
    id: "sub-adi",
    name: "ADI (App Dev & Innovation)",
    code: "ADI",
    teacher: "Mr Ritesh",
    room: "RJ310R",
    color: "#8b5cf6",
    present: 0,
    total: 0,
    target: 75
  },
  {
    id: "sub-aoc-2",
    name: "AoC-II-G1 (Architecture on Cloud)",
    code: "AoC-II-G1",
    teacher: "Mr. Ajay",
    room: "RJ310R",
    color: "#f59e0b",
    present: 0,
    total: 0,
    target: 75
  },
  {
    id: "sub-bee",
    name: "BEE (Basic Electrical Engineering)",
    code: "BEE",
    teacher: "Mr Sandeep",
    room: "RJ310R",
    color: "#10b981",
    present: 0,
    total: 0,
    target: 75
  },
  {
    id: "sub-bpc-3",
    name: "BPC-G3 (Business Process & Comm)",
    code: "BPC-G3",
    teacher: "Mr Manish",
    room: "RJ310R / CVR309R",
    color: "#ec4899",
    present: 0,
    total: 0,
    target: 75
  },
  {
    id: "sub-nalr-1",
    name: "NALR-I (Numerical Analysis & Linear Reasoning)",
    code: "NALR-I",
    teacher: "Mr Satish",
    room: "RJ310R",
    color: "#f97316",
    present: 0,
    total: 0,
    target: 75
  }
];

export const CHITKARA_BE_CSE_5A_ROUTINE = {
  Monday: [
    {
      id: "slot-mo-1",
      subjectId: "sub-adi-fa",
      subjectName: "ADI-FA (App Dev & Innovation)",
      subjectCode: "ADI-FA",
      teacher: "Ms Ritu",
      time: "09:30 AM - 11:10 AM",
      room: "RJ310R"
    },
    {
      id: "slot-mo-2",
      subjectId: "sub-adi",
      subjectName: "ADI (App Dev & Innovation)",
      subjectCode: "ADI",
      teacher: "Mr Ritesh",
      time: "11:10 AM - 12:50 PM",
      room: "RJ310R"
    },
    {
      id: "slot-mo-3",
      subjectId: "sub-aaipd",
      subjectName: "AAIPD (Applied AI & Product Design)",
      subjectCode: "AAIPD",
      teacher: "Dr Ashutosh",
      time: "01:40 PM - 02:30 PM",
      room: "RJ310R"
    },
    {
      id: "slot-mo-4",
      subjectId: "sub-aoc-2",
      subjectName: "AoC-II-G1 (Architecture on Cloud)",
      subjectCode: "AoC-II-G1",
      teacher: "Mr. Ajay",
      time: "02:30 PM - 04:10 PM",
      room: "RJ310R"
    }
  ],
  Tuesday: [
    {
      id: "slot-tu-1",
      subjectId: "sub-bee",
      subjectName: "BEE (Basic Electrical Engineering)",
      subjectCode: "BEE",
      teacher: "Mr Sandeep",
      time: "09:30 AM - 11:10 AM",
      room: "RJ310R"
    },
    {
      id: "slot-tu-2",
      subjectId: "sub-bpc-3",
      subjectName: "BPC-G3 (Business Process & Comm)",
      subjectCode: "BPC-G3",
      teacher: "Mr Manish",
      time: "11:10 AM - 12:50 PM",
      room: "RJ310R"
    },
    {
      id: "slot-tu-3",
      subjectId: "sub-aoc-2",
      subjectName: "AoC-II-G1 (Architecture on Cloud)",
      subjectCode: "AoC-II-G1",
      teacher: "Mr. Ajay",
      time: "02:30 PM - 04:10 PM",
      room: "RJ310R"
    }
  ],
  Wednesday: [
    {
      id: "slot-we-1",
      subjectId: "sub-nalr-1",
      subjectName: "NALR-I (Numerical Analysis & Linear Reasoning)",
      subjectCode: "NALR-I",
      teacher: "Mr Satish",
      time: "09:30 AM - 11:10 AM",
      room: "RJ310R"
    },
    {
      id: "slot-we-2",
      subjectId: "sub-bee",
      subjectName: "BEE (Basic Electrical Engineering)",
      subjectCode: "BEE",
      teacher: "Mr Sandeep",
      time: "11:10 AM - 12:50 PM",
      room: "RJ310R"
    },
    {
      id: "slot-we-3",
      subjectId: "sub-adi",
      subjectName: "ADI (App Dev & Innovation)",
      subjectCode: "ADI",
      teacher: "Mr Ritesh",
      time: "02:30 PM - 04:10 PM",
      room: "RJ310R"
    }
  ],
  Thursday: [
    {
      id: "slot-th-1",
      subjectId: "sub-aaipd",
      subjectName: "AAIPD (Applied AI & Product Design)",
      subjectCode: "AAIPD",
      teacher: "Dr Ashutosh",
      time: "09:30 AM - 11:10 AM",
      room: "RJ310R"
    },
    {
      id: "slot-th-2",
      subjectId: "sub-adi",
      subjectName: "ADI (App Dev & Innovation)",
      subjectCode: "ADI",
      teacher: "Mr Ritesh",
      time: "11:10 AM - 12:50 PM",
      room: "RJ310R"
    },
    {
      id: "slot-th-3",
      subjectId: "sub-bee",
      subjectName: "BEE (Basic Electrical Engineering)",
      subjectCode: "BEE",
      teacher: "Mr Sandeep",
      time: "02:30 PM - 04:10 PM",
      room: "RJ310R"
    }
  ],
  Friday: [
    {
      id: "slot-fr-1",
      subjectId: "sub-bpc-3",
      subjectName: "BPC-G3 (Business Process & Comm)",
      subjectCode: "BPC-G3",
      teacher: "Mr Manish",
      time: "09:30 AM - 11:10 AM",
      room: "CVR309R"
    },
    {
      id: "slot-fr-2",
      subjectId: "sub-adi",
      subjectName: "ADI (App Dev & Innovation)",
      subjectCode: "ADI",
      teacher: "Mr Ritesh",
      time: "11:10 AM - 12:50 PM",
      room: "RJ310R"
    },
    {
      id: "slot-fr-3",
      subjectId: "sub-nalr-1",
      subjectName: "NALR-I (Numerical Analysis & Linear Reasoning)",
      subjectCode: "NALR-I",
      teacher: "Mr Satish",
      time: "02:30 PM - 04:10 PM",
      room: "RJ310R"
    }
  ],
  Saturday: [],
  Sunday: []
};

export const INITIAL_STUDENT_SUBJECTS = [];
export const INITIAL_WEEKLY_ROUTINE = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: []
};

export const INITIAL_HOLIDAYS = [];
export const INITIAL_ASSIGNMENTS = [];

export function generateSeedDailyLogs() {
  return [];
}
