import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { 
  insertAiRapperSchema, 
  insertAiSongSchema, 
  insertAiAlbumSchema, 
  insertChartHistorySchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

// GET all AI rappers
router.get("/", async (_req: Request, res: Response) => {
  try {
    const aiRappers = await storage.getAllAiRappers();
    res.json(aiRappers);
  } catch (error) {
    console.error("Error getting all AI rappers:", error);
    res.status(500).json({ error: "Failed to retrieve AI rappers" });
  }
});

// GET active AI rappers
router.get("/active", async (_req: Request, res: Response) => {
  try {
    const activeAiRappers = await storage.getActiveAiRappers();
    res.json(activeAiRappers);
  } catch (error) {
    console.error("Error getting active AI rappers:", error);
    res.status(500).json({ error: "Failed to retrieve active AI rappers" });
  }
});

// GET an AI rapper by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const aiRapper = await storage.getAiRapperById(id);
    if (!aiRapper) {
      return res.status(404).json({ error: "AI rapper not found" });
    }

    res.json(aiRapper);
  } catch (error) {
    console.error(`Error getting AI rapper with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to retrieve AI rapper" });
  }
});

// POST create a new AI rapper
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = insertAiRapperSchema.parse(req.body);
    const newAiRapper = await storage.createAiRapper(validatedData);
    res.status(201).json(newAiRapper);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = fromZodError(error);
      return res.status(400).json({ error: formattedError.message });
    }
    console.error("Error creating AI rapper:", error);
    res.status(500).json({ error: "Failed to create AI rapper" });
  }
});

// PATCH update an AI rapper
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const existingRapper = await storage.getAiRapperById(id);
    if (!existingRapper) {
      return res.status(404).json({ error: "AI rapper not found" });
    }

    const updatedAiRapper = await storage.updateAiRapper(id, req.body);
    res.json(updatedAiRapper);
  } catch (error) {
    console.error(`Error updating AI rapper with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update AI rapper" });
  }
});

export default router;