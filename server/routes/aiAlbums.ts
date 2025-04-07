import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertAiAlbumSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

// GET an album by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const aiAlbum = await storage.getAiAlbumById(id);
    if (!aiAlbum) {
      return res.status(404).json({ error: "AI album not found" });
    }

    res.json(aiAlbum);
  } catch (error) {
    console.error(`Error getting AI album with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to retrieve AI album" });
  }
});

// GET albums by rapper ID
router.get("/rapper/:rapperId", async (req: Request, res: Response) => {
  try {
    const rapperId = parseInt(req.params.rapperId);
    if (isNaN(rapperId)) {
      return res.status(400).json({ error: "Invalid rapper ID format" });
    }

    const aiAlbums = await storage.getAiAlbumsByRapperId(rapperId);
    res.json(aiAlbums);
  } catch (error) {
    console.error(`Error getting AI albums for rapper ID ${req.params.rapperId}:`, error);
    res.status(500).json({ error: "Failed to retrieve AI albums" });
  }
});

// POST create a new AI album
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("Attempting to create AI album with data:", JSON.stringify(req.body));
    
    // Process the data to handle the date field properly
    const processedData = {
      ...req.body,
      releaseDate: req.body.releaseDate ? new Date(req.body.releaseDate) : new Date(),
      streams: req.body.streams ? (typeof req.body.streams === 'string' ? parseInt(req.body.streams, 10) : req.body.streams) : 0
    };
    
    console.log("Processed data:", JSON.stringify(processedData));
    const validatedData = insertAiAlbumSchema.parse(processedData);
    const newAiAlbum = await storage.createAiAlbum(validatedData);
    res.status(201).json(newAiAlbum);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = fromZodError(error);
      return res.status(400).json({ error: formattedError.message });
    }
    console.error("Error creating AI album:", error);
    res.status(500).json({ error: "Failed to create AI album" });
  }
});

// PATCH update an AI album
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const existingAlbum = await storage.getAiAlbumById(id);
    if (!existingAlbum) {
      return res.status(404).json({ error: "AI album not found" });
    }

    // Handle date fields properly
    const updates = { 
      ...req.body,
      releaseDate: req.body.releaseDate ? new Date(req.body.releaseDate) : undefined,
      updatedAt: new Date()
    };
    
    console.log("Updating AI album with data:", JSON.stringify(updates));
    const updatedAiAlbum = await storage.updateAiAlbum(id, updates);
    res.json(updatedAiAlbum);
  } catch (error) {
    console.error(`Error updating AI album with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update AI album" });
  }
});

export default router;