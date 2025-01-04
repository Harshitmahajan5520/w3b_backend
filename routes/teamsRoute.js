import express from "express";
import {
  postTeams,
  getTeams,
  updateTeam,
  updateMember,
  updateTeamHead,
  deleteMember,
  addMember,
  getTeamHeads
} from "../controllers/teamsController.js";
const router = express.Router();

// for posting all teams data
router.post("/postTeams", postTeams);
// for getting all teams data
router.get("/getTeams", getTeams);
// for getting team heads detail
router.get("/getTeamHeads", getTeamHeads);
// for updating team data when new recruitement comes
router.put("/updateTeam/:teamName", updateTeam);
// for updating individual member data
router.put("/:teamName/members/:memberIndex", updateMember);
// for adding a member
router.post("/:teamName/members", addMember);
// for updating team head data
router.put("/:teamName/teamHead", updateTeamHead);
// for removing a member from the team
router.delete("/:teamName/members/:memberIndex", deleteMember);
export default router;
