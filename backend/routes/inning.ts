import { Router, Request, Response, RequestHandler } from 'express';
import { Inning } from '../db/schema';
import { getInningDetails } from '../utils/delivery';

const router = Router();

router.get("/", (async (_req: Request, res: Response) => {
  try {
    const innings = await Inning.find().sort({ createdAt: 1 });
    if (!innings || innings.length === 0) {
      return res.status(404).json({ error: "No innings found" });
    }

    const currentInning = innings[innings.length - 1];
    const previousInning = innings.length > 1 ? innings[innings.length - 2] : null;

    const currentInningData = await getInningDetails(currentInning._id);

    return res.status(200).json({
      currentInning: currentInningData,
      firstInningTotal: previousInning ? previousInning.totalRuns : null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inning details" });
  }
}) as RequestHandler);

export default router;
