// AttendX Student Attendance & Smart Bunk Calculator

/**
 * Calculate smart bunk & attendance criteria for a single subject
 * @param {number} present - Classes attended
 * @param {number} total - Total classes held
 * @param {number} targetPct - Minimum attendance target percentage (e.g. 75)
 */
export function calculateSubjectBunkStats(present = 0, total = 0, targetPct = 75) {
  const p = Math.max(0, parseInt(present) || 0);
  const t = Math.max(p, parseInt(total) || 0);
  const target = (parseFloat(targetPct) || 75) / 100;

  const currentPct = t > 0 ? (p / t) * 100 : 100;
  const roundedPct = Math.round(currentPct);

  let status = 'safe'; // >= target
  if (roundedPct < targetPct) {
    status = roundedPct >= targetPct - 5 ? 'warning' : 'danger';
  }

  // If already at or above target, calculate how many classes student can safely bunk
  // Formula: (p) / (t + b) >= target => b <= (p / target) - t
  let safeBunks = 0;
  if (t === 0) {
    safeBunks = 0;
  } else if (currentPct >= targetPct) {
    safeBunks = Math.max(0, Math.floor((p / target) - t));
  }

  // If below target, calculate how many consecutive upcoming classes student must attend
  // Formula: (p + a) / (t + a) >= target => a >= (target * t - p) / (1 - target)
  let mustAttend = 0;
  if (t > 0 && currentPct < targetPct) {
    mustAttend = Math.max(0, Math.ceil((target * t - p) / (1 - target)));
  }

  return {
    present: p,
    total: t,
    absent: t - p,
    percentage: roundedPct,
    rawPercentage: currentPct,
    target: targetPct,
    status,
    safeBunks,
    mustAttend
  };
}

/**
 * Calculate overall metrics across all student subjects
 */
export function calculateOverallStudentMetrics(subjects = [], defaultTarget = 75) {
  let totalPresent = 0;
  let totalHeld = 0;
  let subjectsAboveTarget = 0;
  let subjectsBelowTarget = 0;

  const enrichedSubjects = subjects.map(sub => {
    const stats = calculateSubjectBunkStats(sub.present, sub.total, sub.target || defaultTarget);
    totalPresent += stats.present;
    totalHeld += stats.total;

    if (stats.percentage >= (sub.target || defaultTarget)) {
      subjectsAboveTarget++;
    } else {
      subjectsBelowTarget++;
    }

    return {
      ...sub,
      ...stats
    };
  });

  const overallPercentage = totalHeld > 0 ? Math.round((totalPresent / totalHeld) * 100) : 100;
  const overallStats = calculateSubjectBunkStats(totalPresent, totalHeld, defaultTarget);

  return {
    subjects: enrichedSubjects,
    totalSubjects: subjects.length,
    totalPresent,
    totalHeld,
    totalAbsent: totalHeld - totalPresent,
    overallPercentage,
    overallSafeBunks: overallStats.safeBunks,
    overallMustAttend: overallStats.mustAttend,
    subjectsAboveTarget,
    subjectsBelowTarget,
    isEligible: overallPercentage >= defaultTarget
  };
}
