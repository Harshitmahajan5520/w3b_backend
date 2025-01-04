import express from "express";
import { addConstant, getConstants,updateConstant,deleteConstant } from "../controllers/constController.js";

const router = express.Router();

router.get("/getConstants", getConstants);

router.post("/addConstant", addConstant);

router.delete("/deleteConstant/:section/:title", deleteConstant);

router.put("/updateConstant/:section/:title", updateConstant);

export default router;