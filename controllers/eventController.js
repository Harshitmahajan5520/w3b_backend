// import { ref, get, remove, update, set } from "firebase/database";
// import cloudinary from "../config/cloudinary-config.js";
// import { database } from "../config/firebase-config.js";

// const createEvent = async (req, res) => {
//   const { title, description, date, formLink, formDeadline } = req.body;

//   if (!title || !description || !req.files || !date || !formLink || !formDeadline) {
//     return res.status(400).json({ message: "All fields are required, including image files" });
//   }

//   try {
//     const qrFile = req.files.qrCode?.[0];
//     const imageFiles = req.files.images || [];

//     if (!qrFile) {
//       return res.status(400).json({ message: "QR code image is required" });
//     }

//     const qrUploadResult = await cloudinary.uploader.upload(qrFile.path, { 
//       resource_type: "image" 
//     });

//     const uploadPromises = imageFiles.map((file) =>
//       cloudinary.uploader.upload(file.path, { resource_type: "image" })
//     );

//     const uploadResults = await Promise.all(uploadPromises);
//     const imageUrls = uploadResults.map((result) => result.secure_url);

//     const eventId = Date.now().toString();
//     const eventRef = ref(database, `events/${eventId}`);

//     await set(eventRef, {
//       title,
//       description,
//       imageUrls,
//       qrUrl: qrUploadResult.secure_url,
//       date,
//       formLink,
//       formDeadline,
//     });

//     res.status(201).json({
//       message: "Event created successfully",
//       eventId,
//     });
//   } catch (error) {
//     console.error("Error creating event: ", error);
//     res.status(500).json({ message: "Error creating event", details: error.message });
//   }
// };

// const getEvents = async (req, res) => {
//   const eventsRef = ref(database, "events");
//   try {
//     const snapshot = await get(eventsRef);
//     if (snapshot.exists()) {
//       const events = snapshot.val();
//       const currentDate = new Date().toISOString();

//       const filteredEvents = Object.keys(events).map((eventId) => {
//         const event = events[eventId];

//         if (new Date(event.formDeadline) > new Date(currentDate)) {
//           return { ...event, eventId };
//         } else {
//           const { formLink, ...eventWithoutFormLink } = event;
//           return { ...eventWithoutFormLink, eventId };
//         }
//       });

//       res.status(200).json(filteredEvents);
//     } else {
//       res.status(404).json({ message: "No events found" });
//     }
//   } catch (error) {
//     console.error("Error getting events: ", error);
//     res.status(500).json({ message: "Error getting events", details: error.message });
//   }
// };

// const deleteEvent = async (req, res) => {
//   const { eventId } = req.params;

//   if (!eventId) {
//     return res.status(400).json({ message: "Event ID is required" });
//   }

//   const eventRefToDelete = ref(database, `events/${eventId}`);

//   try {
//     const snapshot = await get(eventRefToDelete);

//     if (snapshot.exists()) {
//       await remove(eventRefToDelete);
//       res.status(200).json({ message: "Event deleted successfully" });
//     } else {
//       res.status(404).json({ message: "Event not found" });
//     }
//   } catch (error) {
//     console.error("Error deleting event: ", error);
//     res.status(500).json({ message: "Error deleting event", details: error.message });
//   }
// };

// const updateEvent = async (req, res) => {
//   const { eventId } = req.params;
//   const updatedData = { ...req.body };

//   if (!eventId) {
//     return res.status(400).json({ message: "Event ID is required" });
//   }

//   try {
//     if (req.files) {
//       if (req.files.qrCode?.[0]) {
//         const qrUploadResult = await cloudinary.uploader.upload(req.files.qrCode[0].path, { 
//           resource_type: "image" 
//         });
//         updatedData.qrUrl = qrUploadResult.secure_url;
//       }

//       if (req.files.images?.length > 0) {
//         const uploadPromises = req.files.images.map((file) =>
//           cloudinary.uploader.upload(file.path, { resource_type: "image" })
//         );
//         const uploadResults = await Promise.all(uploadPromises);
//         updatedData.imageUrls = uploadResults.map((result) => result.secure_url);
//       }
//     }

//     const eventRefToUpdate = ref(database, `events/${eventId}`);
//     const snapshot = await get(eventRefToUpdate);

//     if (snapshot.exists()) {
//       await update(eventRefToUpdate, updatedData);
//       res.status(200).json({ message: "Event updated successfully" });
//     } else {
//       res.status(404).json({ message: "Event not found" });
//     }
//   } catch (error) {
//     console.error("Error updating event: ", error);
//     res.status(500).json({ message: "Error updating event", details: error.message });
//   }
// };

// export { createEvent, getEvents, deleteEvent, updateEvent };
import { ref, get, remove, update, set } from "firebase/database";
import cloudinary from "../config/cloudinary-config.js";
import { database } from "../config/firebase-config.js";

const createEvent = async (req, res) => {
  try {
    const { title, description, date, formLink, formDeadline } = req.body;

    if (!title || !description || !date || !formLink || !formDeadline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files || !req.files.qrCode || !req.files.qrCode[0]) {
      return res.status(400).json({ message: "QR code image is required" });
    }

    // Upload QR code
    const qrUploadResult = await cloudinary.uploader.upload(req.files.qrCode[0].path, {
      folder: 'events/qr',
      resource_type: "auto"
    });

    // Upload additional images if they exist
    let imageUrls = [];
    if (req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: 'events/images',
          resource_type: "auto"
        })
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    const eventId = Date.now().toString();
    const eventRef = ref(database, `events/${eventId}`);

    const eventData = {
      title,
      description,
      imageUrls,
      qrUrl: qrUploadResult.secure_url,
      date,
      formLink,
      formDeadline,
      createdAt: new Date().toISOString()
    };

    await set(eventRef, eventData);

    res.status(201).json({
      message: "Event created successfully",
      eventId,
      event: eventData
    });
  } catch (error) {
    console.error("Error creating event: ", error);
    res.status(500).json({ 
      message: "Error creating event", 
      error: error.message || "Internal server error" 
    });
  }
};

const getEvents = async (req, res) => {
  try {
    const eventsRef = ref(database, "events");
    const snapshot = await get(eventsRef);
    
    if (!snapshot.exists()) {
      return res.status(200).json([]);
    }

    const events = snapshot.val();
    const currentDate = new Date().toISOString();
    const eventsList = Object.entries(events).map(([eventId, event]) => {
      if (new Date(event.formDeadline) > new Date(currentDate)) {
        return { ...event, eventId };
      }
      const { formLink, ...eventWithoutFormLink } = event;
      return { ...eventWithoutFormLink, eventId };
    });

    res.status(200).json(eventsList);
  } catch (error) {
    console.error("Error getting events: ", error);
    res.status(500).json({ 
      message: "Error getting events", 
      error: error.message || "Internal server error" 
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const eventRef = ref(database, `events/${eventId}`);
    const snapshot = await get(eventRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Event not found" });
    }

    await remove(eventRef);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event: ", error);
    res.status(500).json({ 
      message: "Error deleting event", 
      error: error.message || "Internal server error" 
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updatedData = { ...req.body };

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const eventRef = ref(database, `events/${eventId}`);
    const snapshot = await get(eventRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Handle file uploads if present
    if (req.files) {
      if (req.files.qrCode?.[0]) {
        const qrUploadResult = await cloudinary.uploader.upload(
          req.files.qrCode[0].path,
          { 
            folder: 'events/qr',
            resource_type: "auto"
          }
        );
        updatedData.qrUrl = qrUploadResult.secure_url;
      }

      if (req.files.images?.length > 0) {
        const uploadPromises = req.files.images.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: 'events/images',
            resource_type: "auto"
          })
        );
        const uploadResults = await Promise.all(uploadPromises);
        updatedData.imageUrls = uploadResults.map((result) => result.secure_url);
      }
    }

    updatedData.updatedAt = new Date().toISOString();
    await update(eventRef, updatedData);

    res.status(200).json({
      message: "Event updated successfully",
      eventId,
      updatedData
    });
  } catch (error) {
    console.error("Error updating event: ", error);
    res.status(500).json({ 
      message: "Error updating event", 
      error: error.message || "Internal server error" 
    });
  }
};

export { createEvent, getEvents, deleteEvent, updateEvent };
