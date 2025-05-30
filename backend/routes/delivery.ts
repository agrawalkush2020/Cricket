import { Router, Request, Response, RequestHandler } from "express";
import { Delivery, Inning } from "../db/schema";
import { processDelivery, getInningDetails } from "../utils/delivery";

const router = Router();

router.post("/", (async (req: Request, res: Response) => {
  try {
    const delivery = new Delivery(req.body);
    console.log(delivery);
    await delivery.save();
 
    await processDelivery(delivery);
 
    const innings = await Inning.find().sort({ createdAt: 1 });
 
    const currentInning = innings[innings.length - 1];
    const firstInning = innings[0];
 
    const currentInningData = await getInningDetails(currentInning._id.toString());
 
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
