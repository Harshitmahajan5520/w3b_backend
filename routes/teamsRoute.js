import express from "express";
import {
  postTeams,
  getTeams,
  updateMember,
  updateTeamHead,
  deleteMember,
  getTeamHeads,
  postMembers,
  postTeam,
} from "../controllers/teamsController.js";
import uploadMiddleware from "../config/multer-config.js";
const router = express.Router();

// for posting all teams data
router.post("/postTeams", uploadMiddleware, postTeam);

// for adding individual member
router.post("/postMembers", uploadMiddleware, postMembers);

// for getting all teams data
router.get("/getTeams", getTeams);

// for getting team heads detail
router.get("/getTeamHeads", getTeamHeads);

// for updating individual member data
router.put("/:teamName/members/:memberId", uploadMiddleware, updateMember);

// for updating team head data
router.put("/:teamName", uploadMiddleware, updateTeamHead);

// for removing a member from the team
router.delete("/:teamName/members/:memberId", deleteMember);
export default router;
