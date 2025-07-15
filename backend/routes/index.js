import express from "express";
import userRouter from "./userRoute.js";
import medicalLeaveRouter from "./medicalLeaveRoute.js";
import healthRecordRouter from "./healthRecordRoutes.js";
import appointmentRouter from "./appointmentRoutes.js";
import adminRouter from "./adminRoutes.js";
import doctorRouter from "./doctorRoutes.js";
import notificationRoutes from "./notififcationRoutes.js";

const router = express.Router();


router.use("/user", userRouter);
router.use("/leave", medicalLeaveRouter);
router.use("/health-record", healthRecordRouter);
router.use("/appointment", appointmentRouter);
router.use("/medical-leaves", adminRouter);
router.use("/doctor", doctorRouter);
router.use("/notifications",notificationRoutes);

export default router;