import { Router, Request, Response, RequestHandler } from "express";
import { Delivery, Inning } from "../db/schema";
import { processDelivery, getInningDetails } from "../utils/delivery";

const router = Router();

router.post("/", (async (req: Request, res: Response) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();

    // Update inning + player stats
    await processDelivery(delivery);

    // Get all innings
    const innings = await Inning.find().sort({ createdAt: 1 });

    // Identify current and first innings
    const currentInning = innings[innings.length - 1];
    const firstInning = innings[0];

    // Get full details for current inning
    const currentInningData = await getInningDetails(currentInning._id);

    // Create summary for first inning
    const overs =
      Math.floor(firstInning.totalBalls / 6) +
      (firstInning.totalBalls % 6) / 10;

    const firstInningSummary = {
      totalScore: firstInning.totalRuns,
      totalWickets: firstInning.totalWickets,
      totalOvers: overs.toFixed(1),
    };

    return res.status(201).json({
      delivery,
      currentInning: currentInningData,
      firstInningSummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record delivery" });
  }
}) as RequestHandler);

export default router;
