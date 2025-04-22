import { Inning, ScoreCard, Team, Player, Delivery } from "../db/schema";
import mongoose from "mongoose";

interface PopulatedDelivery extends mongoose.Document {
  batsman: any;
  bowler: any;
  runs: number;
  deliveryType: string;
  isLegalBall: boolean;
  isWicket: boolean;
}

interface PopulatedInning extends mongoose.Document {
  deliveries: PopulatedDelivery[];
  totalRuns: number;
  totalWickets: number;
  totalBalls: number;
}

export const processDelivery = async (delivery: any) => {
  const {
    inning: inningId,
    batsman,
    bowler,
    runs,
    deliveryType,
    isLegalBall,
    isWicket
  } = delivery;

  const inning = await Inning.findById(inningId);
  if (!inning) throw new Error("Inning not found");
  if (!inning.extras) throw new Error("Inning extras not found");

  const batsmanCard = await ScoreCard.findOne({ player: batsman, isBowler: false });
  const bowlerCard = await ScoreCard.findOne({ player: bowler, isBowler: true });

  if (!batsmanCard || !bowlerCard) throw new Error("ScoreCard not found for batsman or bowler");

  let extraType: "wide" | "noBall" | "bye" | "legBye" | null = null;
  let extraRuns = 0;
  let teamRuns = 0;
  let bowlerRuns = 0;
  let batsmanRuns = 0;

  switch (deliveryType) {
    case "normal":
    case "normal_with_overthrow":
      batsmanRuns = runs;
      teamRuns = runs;
      bowlerRuns = runs;
      batsmanCard.runs += runs;
      batsmanCard.ballsFaced += 1;
      if (runs === 4) batsmanCard.fours += 1;
      if (runs === 6) batsmanCard.sixes += 1;
      break;

    case "bye":
    case "bye_with_overthrow":
      extraType = "bye";
      extraRuns = runs;
      teamRuns = runs;
      batsmanCard.ballsFaced += 1;
      break;

    case "legbye":
    case "legbye_with_overthrow":
      extraType = "legBye";
      extraRuns = runs;
      teamRuns = runs;
      batsmanCard.ballsFaced += 1;
      break;

    case "noball":
    case "noball_with_overthrow":
      extraType = "noBall";
      extraRuns = 1;
      teamRuns = runs + 1;
      bowlerRuns = runs + 1;
      batsmanCard.runs += runs;
      batsmanCard.ballsFaced += 1;
      break;

    case "noball_with_bye":
    case "noball_with_bye_and_overthrow":
      extraType = "noBall";
      extraRuns = 1;
      teamRuns = runs + 1;
      bowlerRuns = 1;
      batsmanCard.ballsFaced += 1;
      inning.extras.bye += runs;
      break;

    case "noball_with_legbye":
    case "noball_with_legbye_and_overthrow":
      extraType = "noBall";
      extraRuns = 1;
      teamRuns = runs + 1;
      bowlerRuns = 1;
      batsmanCard.ballsFaced += 1;
      inning.extras.legBye += runs;
      break;

    case "wide":
    case "wide_with_overthrow":
    case "wide_with_bye":
    case "wide_with_bye_and_overthrow":
    case "wide_with_legbye":
    case "wide_with_legbye_and_overthrow":
      extraType = "wide";
      extraRuns = runs;
      teamRuns = runs;
      bowlerRuns = runs;
      inning.extras.wide += runs;
      break;

    case "wicket":
      batsmanCard.ballsFaced += 1;
      inning.totalWickets += 1;
      break;

    default:
      throw new Error(`Unknown delivery type: ${deliveryType}`);
  }

  // Add additional extras if any
  if (extraType) {
    inning.extras[extraType] += extraRuns;
  }

  // Update inning and scorecards
  inning.totalRuns += teamRuns;
  if (isLegalBall) inning.totalBalls += 1;

  bowlerCard.runsConceded += bowlerRuns;
  if (isLegalBall) bowlerCard.oversBowled += 1 / 6;
  if (isWicket) bowlerCard.wicketsTaken += 1;

  // Save all changes
  await batsmanCard.save();
  await bowlerCard.save();
  await inning.save();
};

export const getInningDetails = async (inningId: string) => {
  try {
    const inning = await Inning.findById(inningId)
      .populate({
        path: 'deliveries',
        populate: [
          { path: 'batsman', model: Player },
          { path: 'bowler', model: Player }
        ]
      })
      .exec() as unknown as PopulatedInning;

    if (!inning) {
      throw new Error('Inning not found');
    }

    const totalScore = inning.totalRuns;
    const totalWickets = inning.totalWickets;
    const totalOvers = Math.floor(inning.totalBalls / 6) + (inning.totalBalls % 6) / 10;
    const runRate = (inning.totalBalls > 0) ? (inning.totalRuns / (inning.totalBalls / 6)).toFixed(2) : "0.00";
    
    const striker = inning.deliveries.length > 0 ? inning.deliveries[inning.deliveries.length - 1].batsman : null;
    const nonStriker = inning.deliveries.length > 1 ? inning.deliveries[inning.deliveries.length - 2].batsman : null;

    // Calculate striker and non-striker statistics
    const strikerData = striker ? {
      runs: striker.runs || 0,
      ballsFaced: striker.ballsFaced || 0,
      fours: striker.fours || 0,
      sixes: striker.sixes || 0,
      strikeRate: (striker.ballsFaced > 0) ? ((striker.runs / striker.ballsFaced) * 100).toFixed(2) : "0.00",
    } : null;

    const nonStrikerData = nonStriker ? {
      runs: nonStriker.runs || 0,
      ballsFaced: nonStriker.ballsFaced || 0,
      fours: nonStriker.fours || 0,
      sixes: nonStriker.sixes || 0,
      strikeRate: (nonStriker.ballsFaced > 0) ? ((nonStriker.runs / nonStriker.ballsFaced) * 100).toFixed(2) : "0.00",
    } : null;

    // Get bowler statistics
    const bowlers = inning.deliveries.reduce((acc: any[], delivery) => {
      const bowler = delivery.bowler;
      const existingBowler = acc.find((b: any) => b.bowler._id.toString() === bowler._id.toString());

      if (existingBowler) {
        existingBowler.oversBowled += 1 / 6;
        existingBowler.runsConceded += delivery.runs;
        if (delivery.isWicket) existingBowler.wicketsTaken += 1;
      } else {
        acc.push({
          bowler: bowler,
          oversBowled: 1 / 6,
          runsConceded: delivery.runs,
          wicketsTaken: delivery.isWicket ? 1 : 0
        });
      }

      return acc;
    }, []);

    return {
      totalScore,
      totalWickets,
      totalOvers: totalOvers.toFixed(1),
      runRate,
      striker: strikerData,
      nonStriker: nonStrikerData,
      currentBowler: inning.deliveries.length > 0 ? inning.deliveries[inning.deliveries.length - 1].bowler : null,
      bowlers,
      deliveries: inning.deliveries.map(delivery => ({
        batsman: delivery.batsman.name,
        bowler: delivery.bowler.name,
        runs: delivery.runs,
        deliveryType: delivery.deliveryType,
        isWicket: delivery.isWicket
      }))
    };
  } catch (err) {
    console.error("Error fetching inning details:", err);
    throw err;
  }
};


