import express from "express";
import {createGalleryEntry,getGallery,updateGallery,deleteGallery} from "../controllers/gallaryController.js";
import uploadMiddleware from "../config/multer-config.js";
const router = express.Router();

router.post("/create", uploadMiddleware, createGalleryEntry);
router.get("/get", getGallery);
router.put("/update/:id", updateGallery);
router.delete("/delete/:id", deleteGallery); 

export default router;



