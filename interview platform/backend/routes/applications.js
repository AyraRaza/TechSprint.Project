import express from "express";
import { sendStatusEmail } from "../utils/sendEmail.js";
import Applicant from "../models/Applicant.js";

const router = express.Router();

router.put("/:id/status", async (req, res) => {
  const { status } = req.body;

  const applicant = await Applicant.findById(req.params.id);

  if (!applicant) {
    return res.status(404).json({ message: "Applicant not found" });
  }

  // prevent duplicate emails
  if (applicant.status === status) {
    return res.json({ message: "Status unchanged" });
  }

  applicant.status = status;
  await applicant.save();

  if (status !== "PENDING") {
    await sendStatusEmail({
      to: applicant.email,
      candidateName: applicant.name,
      jobTitle: applicant.jobTitle,
      status
    });
  }

  res.json({ success: true });
});

export default router;
