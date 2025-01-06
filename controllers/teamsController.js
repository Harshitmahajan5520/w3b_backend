import { ref, set, get, update, push } from "firebase/database";
import { database } from "../config/firebase-config.js";
import cloudinary from "../config/cloudinary-config.js";
const postTeams = async (req, res) => {
  try {
    const { teamName, teamHead, members, teamDescription } = req.body;
    if (
      !teamName ||
      !teamHead ||
      !members ||
      !Array.isArray(members) ||
      !teamDescription
    ) {
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
      teamDescription,
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
const postTeam = async (req, res) => {
  try {
    const { teamName, teamHead, teamDescription } = req.body;
    if (!teamName || !teamHead || !teamDescription) {
      return res
        .status(400)
        .json({ error: "Invalid input data for team or team head" });
    }

    const teamHeadImage = req.files?.teamHeadImage?.[0] || null;
    if (!teamHeadImage) {
      return res.status(400).json({ error: "Team head image is required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(
      teamHeadImage.path,
      {
        resource_type: "image",
      }
    );
    if (!uploadResponse) {
      return res
        .status(500)
        .json({ error: "Failed to upload team head image" });
    }
    // Save the team details
    const teamData = {
      teamName,
      teamHeadDetails: {
        name: teamHead,
        profilePic: uploadResponse.url && uploadResponse.url, // Assuming the profilePic is uploaded to Cloudinary
      },
      teamDescription,
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
const postMembers = async (req, res) => {
  try {
    const { teamName, memberName } = req.body;
    if (!teamName || !memberName) {
      return res.status(400).json({ error: "Invalid input data" });
    }
    // Save members' details

    const memberImage = req.files?.memberImage?.[0];
    if (!memberImage) {
      return res.status(400).json({ error: "Member image is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(memberImage.path, {
      resource_type: "image",
    });
    if (!uploadResponse) {
      return res.status(500).json({ error: "Failed to upload member image" });
    }
    const membersData = {
      name: memberName,
      profilePic: uploadResponse.url && uploadResponse.url, // Assuming the profilePic is uploaded to Cloudinary
    };

    const membersRef = ref(database, `teams/${teamName}/members`);
    const newMemberRef = push(membersRef); // Generates a unique key
    await set(newMemberRef, membersData);

    return res.status(201).json({ message: "Members data saved successfully" });
  } catch (error) {
    console.error("Error posting members data:", error);
    return res.status(500).json({ error: "Failed to save members data" });
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



const updateMember = async (req, res) => {
  try {
    const { teamName, memberId } = req.params;
    const { memberName } = req.body;
    console.log(memberName);
    if (!teamName || !memberId || !memberName) {
      return res.status(400).json({ error: "Invalid input data" });
    }
    let profilePath = "";

    const memberImage = req.files?.memberImage?.[0];
    if (memberImage) {
      const uploadResponse = await cloudinary.uploader.upload(
        memberImage.path,
        {
          resource_type: "image",
        }
      );

      if (!uploadResponse) {
        return res.status(500).json({ error: "Failed to upload member image" });
      }

      profilePath = uploadResponse.url;
    }

    const memberRef = ref(database, `teams/${teamName}/members/${memberId}`);
    await update(memberRef, { name: memberName, profilePic: profilePath });

    return res.status(200).json({
      message: "Member updated successfully",
      updatedMember: memberName,
    });
  } catch (error) {
    console.error("Error updating member data:", error);
    return res.status(500).json({ error: "Failed to update member data" });
  }
};

const updateTeamHead = async (req, res) => {
  try {
    const { teamName } = req.params;
    const { teamHead } = req.body;

    console.log(teamName, teamHead);

    // Validate input
    if (!teamName) {
      return res.status(400).json({ error: "Team name is required" });
    }

    // Reference the specific team in the database
    const teamRef = ref(database, `teams/${teamName}`);
    const teamSnapshot = await get(teamRef);

    if (!teamSnapshot.exists()) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamData = teamSnapshot.val();
    const currentTeamHead = teamData.teamHead || {};

    // Initialize the update object with the existing data
    const updatedHeadDetails = {
      name: currentTeamHead.name,
      profilePic: currentTeamHead.profilePic,
    };

    // Update name if provided
    if (teamHead) {
      updatedHeadDetails.name = teamHead;
    }

    // Handle image upload if provided
    const teamHeadImage = req.files?.teamHeadImage?.[0] || null;
    if (teamHeadImage) {
      const uploadResponse = await cloudinary.uploader.upload(
        teamHeadImage.path,
        {
          resource_type: "image",
        }
      );
      if (!uploadResponse) {
        return res
          .status(500)
          .json({ error: "Failed to upload team head image" });
      }
      updatedHeadDetails.profilePic = uploadResponse.url;
    }

    // Update the team's teamHead field
    await update(teamRef, { teamHead: updatedHeadDetails });

    return res.status(200).json({
      message: "Team head updated successfully",
      updatedTeamHead: updatedHeadDetails,
    });
  } catch (error) {
    console.error("Error updating team head data:", error);
    return res.status(500).json({ error: "Failed to update team head data" });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { teamName, memberId } = req.params;

    // Validation
    if (!teamName || memberId === undefined) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Reference to the specific team in the database
    const teamRef = ref(database, `teams/${teamName}`);
    const teamSnapshot = await get(teamRef);

    if (!teamSnapshot.exists()) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamData = teamSnapshot.val();
    console.log(teamData.members);
    if (!teamData.members || !teamData.members[memberId]) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Delete the member from the members object
    delete teamData.members[memberId];
    // Check if the member index exists in the team
    if (!teamData.members) {
      return res.status(404).json({ error: "Member not found" });
    }
    Object.keys(teamData.members).forEach((key) => {});

    // Update the team's data in Firebase
    await update(teamRef, { members: teamData.members });

    return res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    return res.status(500).json({ error: "Failed to delete member" });
  }
};

// const addMember = async (req, res) => {
//   try {
//     const { teamName } = req.params;
//     const newMember = req.body;
//     if (!teamName || newMember === undefined) {
//       return res.status(400).json({ error: "Invalid input data" });
//     }
//     const teamRef = ref(database, `teams/${teamName}`);
//     const teamSnapshot = await get(teamRef);
//     if (!teamSnapshot.exists()) {
//       return res.status(404).json({ error: "Team not found" });
//     }
//     const teamData = teamSnapshot.val();
//     teamData.members.push(newMember);
//     await update(teamRef, { members: teamData.members });
//     return res
//       .status(200)
//       .json({ message: "Member added successfully", newMember });
//   } catch (error) {
//     console.error("Error adding member:", error);
//     return res.status(500).json({ error: "Failed to delete member" });
//   }
// };
export {
  postTeams,
  getTeams,
  updateMember,
  updateTeamHead,
  deleteMember,
  getTeamHeads,
  postTeam,
  postMembers,
};
