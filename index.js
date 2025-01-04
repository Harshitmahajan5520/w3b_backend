import express from "express";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";
import teamsRoute from "./routes/teamsRoute.js";
import galleryRoute from "./routes/gallaryRoutes.js";
import constRoute from "./routes/constRoutes.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true, limit: "16kb" })); 
app.use(cors()); 


app.use("/api/events", eventRoutes);
app.use("/api/teams", teamsRoute);
app.use("/api/gallery", galleryRoute);
app.use("/api/constants", constRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
