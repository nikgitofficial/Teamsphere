// utils/calculateHours.js

export const calculateHours = (attendance) => {
  if (!attendance.checkIn || !attendance.checkOut) return 0;

  let totalMs = new Date(attendance.checkOut) - new Date(attendance.checkIn);

  if (attendance.breakOut && attendance.breakIn) {
    totalMs -= new Date(attendance.breakIn) - new Date(attendance.breakOut);
  }

  return totalMs / (1000 * 60 * 60); // return hours as decimal
};
