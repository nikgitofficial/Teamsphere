// middleware/authEmployee.js
export default function authenticateEmployee(req, res, next) {
  const { employeeId } = req.headers; // pass employeeId in headers
  if (!employeeId) return res.status(401).json({ msg: "Unauthorized" });
  req.employeeId = employeeId;
  next();
}
