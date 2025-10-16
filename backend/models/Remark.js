import mongoose from "mongoose";

const remarkSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  comment: { type: String, required: true },
  postedBy: { type: String, required: true },
}, { timestamps: true });

const Remark = mongoose.model("Remark", remarkSchema);
export default Remark;
