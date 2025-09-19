export const calculateHours = (attendance) => {
  if (!attendance.checkIns?.length || !attendance.checkOuts?.length) return 0;

  let totalMs = 0;

  for (let i = 0; i < attendance.checkIns.length; i++) {
    const checkIn = new Date(attendance.checkIns[i]);
    const checkOut = attendance.checkOuts[i] ? new Date(attendance.checkOuts[i]) : null;

    if (!checkOut || checkOut <= checkIn) continue;

    let sessionMs = checkOut - checkIn;

    // Handle breaks for this session
    if (attendance.breakOuts?.length && attendance.breakIns?.length) {
      // Filter breaks that belong to this session
      const breaksOut = Array.isArray(attendance.breakOuts[i]) ? attendance.breakOuts[i] : [attendance.breakOuts[i]];
      const breaksIn = Array.isArray(attendance.breakIns[i]) ? attendance.breakIns[i] : [attendance.breakIns[i]];

      for (let j = 0; j < breaksOut.length; j++) {
        const bOut = new Date(breaksOut[j]);
        const bIn = breaksIn[j] ? new Date(breaksIn[j]) : null;

        if (bIn && bOut >= checkIn && bIn <= checkOut) {
          sessionMs -= (bIn - bOut);
        }
      }
    }

    totalMs += sessionMs;
  }

  // Convert to decimal hours
  return totalMs / 1000 / 3600;
};
