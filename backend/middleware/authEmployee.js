export default function authenticateEmployee(req, res, next) {
  const employeeId = req.headers.employeeid; // headers are always lowercase
  if (!employeeId) return res.status(401).json({ msg: "Unauthorized" });

  req.employeeId = employeeId;
  next();
}
