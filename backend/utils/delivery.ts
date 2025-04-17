import { Inning, ScoreCard, Team, Player, Delivery } from "../db/schema";
import mongoose from "mongoose";

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

export const getInningDetails = async (inningId: any) => {
    const inning = await Inning.findById(inningId)
        .populate<{ battingTeam: { name: string, players: mongoose.Types.ObjectId[] } }>('battingTeam')
        .populate<{ bowlingTeam: { name: string, players: mongoose.Types.ObjectId[] } }>('bowlingTeam')
        .populate<{ deliveries: { batsman: mongoose.Types.ObjectId, bowler: mongoose.Types.ObjectId }[] }>('deliveries');

    if (!inning) throw new Error("Inning not found");
    if (!inning.battingTeam) throw new Error("Batting team not found");
    if (!inning.bowlingTeam) throw new Error("Bowling team not found");
    if (!inning.deliveries) throw new Error("Deliveries not found");

    // Get all scorecards for this inning
    const scoreCards = await ScoreCard.find({
        player: { 
            $in: [...inning.battingTeam.players, ...inning.bowlingTeam.players]
        }
    }).populate<{ player: { _id: mongoose.Types.ObjectId, name: string } }>('player');

    // Get batsmen details
    const batsmenCards = scoreCards.filter(card => !card.isBowler);
    const bowlerCards = scoreCards.filter(card => card.isBowler);

    // Get current batsmen (last two unique batsmen from deliveries)
    const uniqueBatsmen = [...new Set(inning.deliveries
        .map(d => d.batsman.toString())
        .reverse()
    )].slice(0, 2);

    const [striker, nonStriker] = uniqueBatsmen.map(batsmanId => {
        const card = batsmenCards.find(c => c.player._id.toString() === batsmanId);
        return {
            name: card?.player.name,
            runs: card?.runs || 0,
            ballsFaced: card?.ballsFaced || 0,
            fours: card?.fours || 0,
            sixes: card?.sixes || 0,
            strikeRate: card ? ((card.runs / card.ballsFaced) * 100).toFixed(2) : "0.00"
        };
    });

    // Get current bowler (last bowler from deliveries)
    const currentBowlerId = inning.deliveries[inning.deliveries.length - 1]?.bowler;
    const currentBowlerCard = bowlerCards.find(c => 
        c.player._id.toString() === currentBowlerId?.toString()
    );

    return {
        totalScore: inning.totalRuns,
        totalWickets: inning.totalWickets,
        totalOvers: Math.floor(inning.totalBalls / 6) + (inning.totalBalls % 6) / 10,
        runRate: ((inning.totalRuns / inning.totalBalls) * 6).toFixed(2),
        extras: inning.extras,
        
        striker,
        nonStriker,
        
        currentBowler: currentBowlerCard ? {
            name: currentBowlerCard.player.name,
            overs: currentBowlerCard.oversBowled.toFixed(1),
            maidens: currentBowlerCard.maidens,
            runs: currentBowlerCard.runsConceded,
            wickets: currentBowlerCard.wicketsTaken,
            economy: ((currentBowlerCard.runsConceded / currentBowlerCard.oversBowled) * 6).toFixed(2)
        } : null,

        // All bowlers who bowled in this inning
        bowlers: bowlerCards.map(card => ({
            name: card.player.name,
            overs: card.oversBowled.toFixed(1),
            maidens: card.maidens,
            runs: card.runsConceded,
            wickets: card.wicketsTaken,
            economy: ((card.runsConceded / card.oversBowled) * 6).toFixed(2)
        })),

        // All batsmen who batted in this inning
        batsmen: batsmenCards.map(card => ({
            name: card.player.name,
            runs: card.runs,
            ballsFaced: card.ballsFaced,
            fours: card.fours,
            sixes: card.sixes,
            strikeRate: ((card.runs / card.ballsFaced) * 100).toFixed(2)
        }))
    };
}


