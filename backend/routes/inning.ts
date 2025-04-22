import { Router, Request, Response, RequestHandler } from 'express';
import { Inning, Team } from '../db/schema';
import { getInningDetails } from '../utils/delivery';
import mongoose from 'mongoose';

interface PopulatedInning extends mongoose.Document {
  battingTeam: mongoose.Types.ObjectId;
  bowlingTeam: mongoose.Types.ObjectId;
}

const router = Router();

router.get("/", (async (_req: Request, res: Response) => {
  try {
    const innings = await Inning.find().sort({ createdAt: 1 });

    if (innings.length === 0) {
      return res.status(404).json({ error: "No innings found" });
    }

    const currentInning = innings[innings.length - 1];
    const firstInning = innings[0];

    // Get full details for current inning
    const currentInningData = await getInningDetails(currentInning._id.toString());

    // Prepare summary for first inning
    const overs =
      Math.floor(firstInning.totalBalls / 6) +
      (firstInning.totalBalls % 6) / 10;

    const firstInningSummary = {
      totalScore: firstInning.totalRuns,
      totalWickets: firstInning.totalWickets,
      totalOvers: overs.toFixed(1),
    };

    // Populate teams before accessing them
    const populatedCurrentInning = await currentInning.populate('battingTeam bowlingTeam') as PopulatedInning;
    const battingTeam = await Team.findById(populatedCurrentInning.battingTeam).populate('players');
    const bowlingTeam = await Team.findById(populatedCurrentInning.bowlingTeam).populate('players');

    return res.status(200).json({
      currentInning: currentInningData,
      firstInningSummary,
      battingTeam,
      bowlingTeam
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inning details" });
  }
}) as RequestHandler);

export default router;
