import AttendanceRemark from "../models/attendanceRemark.js";
import { put, del } from "@vercel/blob";

// Create
export const createRemark = async (req, res) => {
  try {
    const { employee, type,departments,reason, remarks, status } = req.body;
    let fileData;

    if (req.file) {
      const blob = await put(req.file.originalname, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
        addRandomSuffix: true,
      });

      fileData = {
        filename: blob.pathname,
        url: blob.url,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }

    const remark = new AttendanceRemark({
      employee,
      type,
      departments,
      reason,
      remarks,
      status,
      createdBy: req.user?.id,
      file: fileData,
    });

    await remark.save();
    res.status(201).json(remark);
  } catch (err) {
    console.error("❌ Error creating remark:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all
export const getRemarks = async (req, res) => {
  try {
    const remarks = await AttendanceRemark.find()
      .populate("employee", "fullName position profilePic");
    res.json(remarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get by employee
export const getRemarksByEmployee = async (req, res) => {
  try {
    const remarks = await AttendanceRemark.find({ employee: req.params.employeeId })
      .populate("employee", "fullName position profilePic");
    res.json(remarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateRemark = async (req, res) => {
  try {
    const remark = await AttendanceRemark.findById(req.params.id);
    if (!remark) return res.status(404).json({ message: "Remark not found" });

    const { employee, type, departments,reason, remarks, status } = req.body;

    remark.employee = employee || remark.employee;
    remark.type = type || remark.type;
    remark.departments = departments || remark.departments;
    remark.reason = reason || remark.reason;
    remark.remarks = remarks || remark.remarks;
    remark.status = status || remark.status;

    if (req.file) {
      // Delete old file if exists
      if (remark.file?.filename) await del(remark.file.filename);

      const blob = await put(req.file.originalname, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
        addRandomSuffix: true,
      });

      remark.file = {
        filename: blob.pathname,
        url: blob.url,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }

    await remark.save();
    res.json(remark);
  } catch (err) {
    console.error("❌ Error updating remark:", err);
    res.status(400).json({ error: err.message });
  }
};


// Delete
export const deleteRemark = async (req, res) => {
  try {
    const remark = await AttendanceRemark.findByIdAndDelete(req.params.id);
    if (!remark) return res.status(404).json({ message: "Remark not found" });

    if (remark.file?.filename) {
      await del(remark.file.filename); // delete file from Vercel Blob
    }

    res.json({ message: "Remark deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
