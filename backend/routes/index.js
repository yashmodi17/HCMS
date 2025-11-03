import express from "express";
import userRouter from "./userRoute.js";
import vaccinationRouter from "./vaccinationRoutes.js";
import healthRecordRouter from "./healthRecordRoutes.js";
import childRouter from "./childRoutes.js";
import donationRouter from "./donationRoutes.js";
import adminRouter from "./adminRoutes.js";
import doctorRouter from "./doctorRoutes.js";
import coordinatorRouter from "./coordinatorRoutes.js";
import aanganwadiRouter from "./aanganwadiRoutes.js";
import notificationRoutes from "./notififcationRoutes.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/vaccination", vaccinationRouter);
router.use("/health-record", healthRecordRouter);
router.use("/children", childRouter);
router.use("/donations", donationRouter);
router.use("/admin", adminRouter);
router.use("/coordinator", coordinatorRouter);
router.use("/doctor", doctorRouter);
router.use("/aanganwadi", aanganwadiRouter);
router.use("/notifications",notificationRoutes);

export default router;