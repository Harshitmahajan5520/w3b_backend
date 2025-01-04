import { ref, get, remove, update, set } from "firebase/database";
import { database } from "../config/firebase-config.js";

const addConstant = async (req, res) => {
  const { section, title, description } = req.body;
  if (!title || !description || !section) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const constantRef = ref(database, `constants/${section}/${title}`);

  try {
    await set(constantRef, {
      title,
      description,
    });

    res.status(201).json({
      message: "Constant added successfully",
      title,
    });
  } catch (error) {
    console.error("Error adding constant: ", error);
    res.status(500).json({ message: "Error adding constant" });
  }
};

const getConstants = async (req, res) => {
  const constantsRef = ref(database, "constants");
  try {
    const snapshot = await get(constantsRef);
    if (snapshot.exists()) {
      const consts = snapshot;
      res.status(200).json(consts);
    } else {
      res.status(404).json({ message: "No constants found" });
    }
  } catch (error) {
    console.error("Error getting constants: ", error);
    res.status(500).json({ message: "Error getting constants" });
  }
};

const deleteConstant = async (req, res) => {
  const { section, title } = req.params;

  console.log(req.params);

  if (!title || !section) {
    return res.status(400).json({ message: "title & section is required" });
  }

  const constantRefToDelete = ref(database, `constants/${section}/${title}`);

  try {
    const snapshot = await get(constantRefToDelete);

    if (snapshot.exists()) {
      await remove(constantRefToDelete);
      res.status(200).json({ message: "Title deleted successfully" });
    } else {
      res.status(404).json({ message: "Title not found" });
    }
  } catch (error) {
    console.error("Error deleting title: ", error);
    res.status(500).json({ message: "Error deleting title" });
  }
};

const updateConstant = async (req, res) => {
  let { section, title } = req.params;
  const data = req.body; 

  if (!section || !title) {
    return res
      .status(400)
      .json({ message: "Section & Title both are required" });
  }

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ message: "No data provided to update" });
  }

  let constantRefToUpdate = ref(database, `constants/${section}/${title}`);

  try {
    const snapshot = await get(constantRefToUpdate);

    if (snapshot.exists()) {
      await remove(constantRefToUpdate);
      title = data.title;
      let description = data.description;
      console.log(constantRefToUpdate);

      constantRefToUpdate = ref(database, `constants/${section}/${title}`);

      console.log(constantRefToUpdate);

      await set(constantRefToUpdate, {
        title,
        description,
      });

      res.status(200).json({ message: "Title updated successfully" });
    } else {
      res.status(404).json({ message: "Title not found" });
    }
  } catch (error) {
    console.error("Error updating Title: ", error);
    res.status(500).json({ message: "Error updating Title" });
  }
};

export { addConstant, getConstants, deleteConstant, updateConstant };
