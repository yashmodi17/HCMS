import express from "express";
import {
  getAanganwadis,
  getAanganwadiChildren,
  getChildHealthDetails,
  addChildHealthRecord,
  updateVolunteerStatus,
  getVolunteerDoctors
} from "../controllers/doctorController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for volunteer doctors
router.get("/aanganwadis", authMiddleware(["doctor"]), getAanganwadis);
router.get("/aanganwadi/:aanganwadiCode/children", authMiddleware(["doctor"]), getAanganwadiChildren);
router.get("/child/:childId", authMiddleware(["doctor"]), getChildHealthDetails);
router.post("/child/:childId/health-record", authMiddleware(["doctor"]), addChildHealthRecord);
router.put("/volunteer-status", authMiddleware(["doctor"]), updateVolunteerStatus);

// Public route to get volunteer doctors list
router.get("/volunteers", getVolunteerDoctors);

export default router;