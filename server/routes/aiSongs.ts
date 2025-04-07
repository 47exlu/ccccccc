import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertAiSongSchema } from "@shared/schema";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

// GET a song by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const aiSong = await storage.getAiSongById(id);
    if (!aiSong) {
      return res.status(404).json({ error: "AI song not found" });
    }

    res.json(aiSong);
  } catch (error) {
    console.error(`Error getting AI song with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to retrieve AI song" });
  }
});

// GET songs by rapper ID
router.get("/rapper/:rapperId", async (req: Request, res: Response) => {
  try {
    const rapperId = parseInt(req.params.rapperId);
    if (isNaN(rapperId)) {
      return res.status(400).json({ error: "Invalid rapper ID format" });
    }

    const aiSongs = await storage.getAiSongsByRapperId(rapperId);
    res.json(aiSongs);
  } catch (error) {
    console.error(`Error getting AI songs for rapper ID ${req.params.rapperId}:`, error);
    res.status(500).json({ error: "Failed to retrieve AI songs" });
  }
});

// POST create a new AI song
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("Attempting to create AI song with data:", JSON.stringify(req.body));
    
    // Process the data to handle the date field properly
    const processedData = {
      ...req.body,
      releaseDate: req.body.releaseDate ? new Date(req.body.releaseDate) : new Date(),
      streams: req.body.streams ? (typeof req.body.streams === 'string' ? parseInt(req.body.streams, 10) : req.body.streams) : 0
    };
    
    console.log("Processed data:", JSON.stringify(processedData));
    const validatedData = insertAiSongSchema.parse(processedData);
    console.log("Validated data:", JSON.stringify(validatedData));
    const newAiSong = await storage.createAiSong(validatedData);
    res.status(201).json(newAiSong);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = fromZodError(error);
      return res.status(400).json({ error: formattedError.message });
    }
    console.error("Error creating AI song:", error);
    res.status(500).json({ error: "Failed to create AI song" });
  }
});

// PATCH update an AI song
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const existingSong = await storage.getAiSongById(id);
    if (!existingSong) {
      return res.status(404).json({ error: "AI song not found" });
    }

    // Handle date fields properly
    const updates = { 
      ...req.body,
      releaseDate: req.body.releaseDate ? new Date(req.body.releaseDate) : undefined,
      updatedAt: new Date()
    };
    
    console.log("Updating AI song with data:", JSON.stringify(updates));
    const updatedAiSong = await storage.updateAiSong(id, updates);
    res.json(updatedAiSong);
  } catch (error) {
    console.error(`Error updating AI song with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update AI song" });
  }
});

export default router;