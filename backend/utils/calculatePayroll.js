// utils/calculatePayroll.js

export const calculatePayroll = (totalHours, ratePerHour, deductions = 0) => {
  const grossPay = totalHours * ratePerHour;
  const netPay = grossPay - deductions;
  return { grossPay, netPay };
};
