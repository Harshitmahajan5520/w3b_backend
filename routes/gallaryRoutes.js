import express from "express";
import {createGalleryEntry,getGallery,updateGallery,deleteGallery} from "../controllers/gallaryController.js";
import uploadMiddleware from "../config/multer-config.js";
const router = express.Router();

router.post("/createGallery", uploadMiddleware, createGalleryEntry);
router.get("/getGallery", getGallery);
router.put("/updateGallery/:id", updateGallery);
router.delete("/deleteGallery/:id", deleteGallery); 

export default router;



