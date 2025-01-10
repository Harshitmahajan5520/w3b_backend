import express from "express";
import { createEvent, getEvents,updateEvent,deleteEvent } from "../controllers/eventController.js";
import uploadMiddleware from "../config/multer-events.js";

const router = express.Router();

router.get("/getEvents", getEvents);
router.post("/createEvent",uploadMiddleware, createEvent);
router.put("/updateEvent/:eventId", updateEvent);
router.delete("/deleteEvent/:eventId", deleteEvent);

export default router;
