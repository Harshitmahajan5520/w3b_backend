import { ref, push, get, query, orderByChild, update, remove } from "firebase/database";
import cloudinary from "../config/cloudinary-config.js";
import { database } from "../config/firebase-config.js";


export const createGalleryEntry = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file, index) => {
      return cloudinary.uploader.upload(file.path, {
        resource_type: "image",
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    const galleryRef = ref(database, "gallery");
    const newEntry = {
      imageUrls,
      date: new Date().toISOString(),
    };
    await push(galleryRef, newEntry);

    res.status(200).json(newEntry);
  } catch (error) {
    console.error("Error creating gallery entry:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const getGallery = async (req, res) => {
  try {
    const galleryRef = ref(database, "gallery");
    const snapshot = await get(query(galleryRef, orderByChild("date")));

    if (snapshot.exists()) {
      const galleryData = snapshot.val();
      const sortedGallery = Object.keys(galleryData)
        .map((id) => ({ id, ...galleryData[id] }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      res.status(200).json(sortedGallery);
    } else {
      res.status(404).json({ message: "No gallery entries found" });
    }
  } catch (error) {
    console.error("Error fetching gallery entries:", error);
    res.status(500).json({ message: "Error fetching gallery entries", details: error.message });
  }
};


export const updateGallery = async (req, res) => {
  const { id } = req.params;
  const { imageUrls, date } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Gallery ID is required" });
  }

  if (!imageUrls && !date) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  const galleryRef = ref(database, `gallery/${id}`);

  try {
    const updates = {};
    if (imageUrls) updates.imageUrls = imageUrls;
    if (date) updates.date = date;

    await update(galleryRef, updates);

    res.status(200).json({ message: "Gallery entry updated successfully" });
  } catch (error) {
    console.error("Error updating gallery entry:", error);
    res.status(500).json({ message: "Error updating gallery entry", details: error.message });
  }
};

export const deleteGallery = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Gallery ID is required" });
  }

  const galleryRef = ref(database, `gallery/${id}`);

  try {
    await remove(galleryRef);
    res.status(200).json({ message: "Gallery entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery entry:", error);
    res.status(500).json({ message: "Error deleting gallery entry", details: error.message });
  }
};
