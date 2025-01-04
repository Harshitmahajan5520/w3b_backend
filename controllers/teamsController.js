import { ref, set, get, update } from "firebase/database";
import { database } from "../config/firebase-config.js";

const postTeams = async (req, res) => {
  try {
    const { teamName, teamHead, members,teamDescription } = req.body;
    if (!teamName || !teamHead || !members || !Array.isArray(members) || !teamDescription) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    if (!teamHead.name || !teamHead.profilePic) {
      return res
        .status(400)
        .json({ error: "Team head must have a name and profile picture" });
    }

    members.forEach((member, index) => {
      if (!member.name || !member.profilePic) {
        throw new Error(`Member at index ${index} is missing required fields.`);
      }
    });

    const teamData = {
      teamName,
      teamHead,
      members,
      teamDescription
    };

    const teamRef = ref(database, `teams/${teamName}`);

    await set(teamRef, teamData);

    return res
      .status(201)
      .json({ message: "Team data saved successfully", teamName });
  } catch (error) {
    console.error("Error posting team data:", error);
    return res.status(500).json({ error: "Failed to save team data" });
  }
};
const getTeams = async (req, res) => {
  try {
    const teamsRef = ref(database, "teams");
    const teamsSnapshot = await get(teamsRef);

    if (teamsSnapshot.exists()) {
      const teams = teamsSnapshot.val();
      return res.status(200).json(teams);
    } else {
      return res.status(404).json({ message: "No teams found" });
    }
  } catch (error) {
    console.error("Error getting teams:", error);
    return res.status(500).json({ error: "Failed to get teams" });
  }
};

// get Teams heads details {name,imaageurl}
const getTeamHeads = async (req, res) => {
  try {
    const teamsRef = ref(database, "teams");
    const snapshot = await get(teamsRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No teams found" });
    }

    const teamsData = snapshot.val();
    const teamHeads = Object.keys(teamsData).map((teamName) => {
      const { teamHead } = teamsData[teamName];
      return { teamName, ...teamHead };
    });

    return res.status(200).json({ teamHeads });
  } catch (error) {
    console.error("Error fetching team heads:", error);
    return res.status(500).json({ error: "Failed to fetch team heads" });
  }
};

// use when new recruitment comes in
const updateTeam = async (req, res) => {
  try {
    const { teamName } = req.params;
    const updatedTeamData = req.body;

    if (!teamName || !updatedTeamData) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    if (updatedTeamData.teamHead) {
      if (
        !updatedTeamData.teamHead.name ||
        !updatedTeamData.teamHead.profilePic
      ) {
        return res
          .status(400)
          .json({ error: "Team head must have a name and profile picture" });
      }
    }

    if (updatedTeamData.members && Array.isArray(updatedTeamData.members)) {
      updatedTeamData.members.forEach((member, index) => {
        if (!member.name || !member.profilePic) {
          throw new Error(
            `Member at index ${index} is missing required fields.`
          );
        }
      });
    }

    // Reference to the specific team in the database
    const teamRef = ref(database, `teams/${teamName}`);

    // Update team data in Firebase
    await update(teamRef, updatedTeamData);

    return res
      .status(200)
      .json({ message: "Team data updated successfully", updatedTeamData });
  } catch (error) {
    console.error("Error updating team data:", error);
    return res.status(500).json({ error: "Failed to update team data" });
  }
};

const updateMember = async (req, res) => {
  try {
    const { teamName, memberIndex } = req.params;
    const updatedMemberData = req.body;

    // Validation
    if (!teamName || memberIndex === undefined || !updatedMemberData) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    if (!updatedMemberData.name || !updatedMemberData.profilePic) {
      return res.status(400).json({
        error: "Member must have a name and profile picture",
      });
    }

    // Reference to the specific team in the database
    const teamRef = ref(database, `teams/${teamName}`);
    const teamSnapshot = await get(teamRef);

    if (!teamSnapshot.exists()) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamData = teamSnapshot.val();

    // Check if the member index exists in the team
    if (!teamData.members || !teamData.members[memberIndex]) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Update the specific member's data
    teamData.members[memberIndex] = {
      ...teamData.members[memberIndex],
      ...updatedMemberData,
    };

    // Update the team's data in Firebase
    await update(teamRef, { members: teamData.members });

    return res.status(200).json({
      message: "Member updated successfully",
      updatedMember: teamData.members[memberIndex],
    });
  } catch (error) {
    console.error("Error updating member data:", error);
    return res.status(500).json({ error: "Failed to update member data" });
  }
};

const updateTeamHead = async (req, res) => {
  try {
    const { teamName } = req.params;
    const updatedTeamHeadData = req.body;

    // Validation
    if (!teamName || !updatedTeamHeadData) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    if (!updatedTeamHeadData.name || !updatedTeamHeadData.profilePic) {
      return res.status(400).json({
        error: "Team head must have a name and profile picture",
      });
    }

    // Reference to the specific team in the database
    const teamRef = ref(database, `teams/${teamName}`);
    const teamSnapshot = await get(teamRef);

    if (!teamSnapshot.exists()) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamData = teamSnapshot.val();

    // Update the team head's data
    teamData.teamHead = updatedTeamHeadData;

    // Update the team's data in Firebase
    await update(teamRef, { teamHead: teamData.teamHead });

    return res.status(200).json({
      message: "Team head updated successfully",
      updatedTeamHead: teamData.teamHead,
    });
  } catch (error) {
    console.error("Error updating team head data:", error);
    return res.status(500).json({ error: "Failed to update team head data" });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { teamName, memberIndex } = req.params;

    // Validation
    if (!teamName || memberIndex === undefined) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Reference to the specific team in the database
    const teamRef = ref(database, `teams/${teamName}`);
    const teamSnapshot = await get(teamRef);

    if (!teamSnapshot.exists()) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamData = teamSnapshot.val();

    // Check if the member index exists in the team
    if (!teamData.members || !teamData.members[memberIndex]) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Remove the specific member from the team
    teamData.members.splice(memberIndex, 1);

    // Update the team's data in Firebase
    await update(teamRef, { members: teamData.members });

    return res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    return res.status(500).json({ error: "Failed to delete member" });
  }
};


const addMember = async (req,res)=>{
    try {
        
    const {teamName} = req.params;
    const newMember = req.body;
    if (!teamName || newMember === undefined) {
        return res.status(400).json({ error: "Invalid input data" });
      }
    const teamRef = ref(database, `teams/${teamName}`);
    const teamSnapshot = await get(teamRef);
    if (!teamSnapshot.exists()) {
        return res.status(404).json({ error: "Team not found" });
      }
    const teamData = teamSnapshot.val();
    teamData.members.push(newMember);
    await update(teamRef,{members:teamData.members});
    return res.status(200).json({message:"Member added successfully",newMember})
    
        
    } catch (error) {
        console.error("Error adding member:", error);
        return res.status(500).json({ error: "Failed to delete member" });
    }
  
}
export { postTeams, getTeams, updateTeam, updateMember, updateTeamHead,deleteMember,addMember,getTeamHeads };
