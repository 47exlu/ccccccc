import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertChartHistorySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

// GET chart history by type
router.get("/:chartType", async (req: Request, res: Response) => {
  try {
    const { chartType } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    if (!["hot100", "billboard200", "artistRankings"].includes(chartType)) {
      return res.status(400).json({ error: "Invalid chart type. Must be 'hot100', 'billboard200', or 'artistRankings'" });
    }

    const chartHistory = await storage.getChartHistoryByType(chartType, limit);
    res.json(chartHistory);
  } catch (error) {
    console.error(`Error getting chart history for type ${req.params.chartType}:`, error);
    res.status(500).json({ error: "Failed to retrieve chart history" });
  }
});

// GET latest charts
router.get("/latest/all", async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    const latestCharts = await storage.getLatestChartsByDate(today);
    res.json(latestCharts);
  } catch (error) {
    console.error("Error getting latest charts:", error);
    res.status(500).json({ error: "Failed to retrieve latest charts" });
  }
});

// POST create a new chart entry
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = insertChartHistorySchema.parse(req.body);
    const newChartEntry = await storage.createChartEntry(validatedData);
    res.status(201).json(newChartEntry);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = fromZodError(error);
      return res.status(400).json({ error: formattedError.message });
    }
    console.error("Error creating chart entry:", error);
    res.status(500).json({ error: "Failed to create chart entry" });
  }
});

export default router;