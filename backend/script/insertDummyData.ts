import mongoose from "mongoose";
import { Team, Player, Inning, Delivery, ScoreCard } from "../db/schema.js";

const MONGODB_URI = "mongodb+srv://agrawalkush2020:1N8SL2gWRrlfhAny@cluster0.8hx4y0s.mongodb.net/";
const runSeed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // Step 1: Wipe all collections
  await Promise.all([
    Team.deleteMany(),
    Player.deleteMany(),
    Inning.deleteMany(),
    Delivery.deleteMany(),
    ScoreCard.deleteMany()
  ]);
  console.log("🧹 Cleared all collections");

  // Step 2: Create Teams
  const teamA = await Team.create({ name: "Team A" });
  const teamB = await Team.create({ name: "Team B" });
  
  // Step 3: Create Players
  const createPlayers = async (team: mongoose.Document, namePrefix: string) => {
    const roles = ["batsman", "bowler", "allrounder", "wicketkeeper"];
    const players = [];

    for (let i = 1; i <= 11; i++) {
      const role = roles[i % roles.length];
      const player = await Player.create({
        name: `${namePrefix} Player ${i}`,
        team: team._id,
        role
      });
      players.push(player);
    }

    await Team.findByIdAndUpdate(team._id, { 
      players: players.map(p => p._id) 
    });
    return players;
  };

  const teamAPlayers = await createPlayers(teamA, "A");
  const teamBPlayers = await createPlayers(teamB, "B");

  // Step 4: First Inning (Team A batting)
  const firstInning = new Inning({
    battingTeam: teamA._id,
    bowlingTeam: teamB._id,
    totalRuns: 168,
    totalWickets: 7,
    totalBalls: 120, // 20 overs
    extras: {
      wide: 4,
      noBall: 2,
      bye: 1,
      legBye: 3
    }
  });
  await firstInning.save();

  // Add dummy scorecards for first inning
  for (let i = 0; i < 5; i++) {
    await new ScoreCard({
      player: teamAPlayers[i]._id,
      isBowler: false,
      runs: 30 + i * 10,
      ballsFaced: 20,
      fours: 3,
      sixes: 2
    }).save();
  }
  for (let i = 0; i < 3; i++) {
    await new ScoreCard({
      player: teamBPlayers[i]._id,
      isBowler: true,
      oversBowled: 4,
      runsConceded: 30,
      wicketsTaken: 1,
      maidens: 0
    }).save();
  }

  // Step 5: Second Inning (Team B batting)
  const secondInning = new Inning({
    battingTeam: teamB._id,
    bowlingTeam: teamA._id,
    totalRuns: 23,
    totalWickets: 1,
    totalBalls: 18,
    extras: {
      wide: 1,
      noBall: 0,
      bye: 0,
      legBye: 0
    }
  });
  await secondInning.save();

  const secondInningDeliveries = [
    {
      inning: secondInning._id,
      batsman: teamBPlayers[0]._id,
      bowler: teamAPlayers[0]._id,
      runs: 4,
      deliveryType: "normal",
      isLegalBall: true,
      isWicket: false
    },
    {
      inning: secondInning._id,
      batsman: teamBPlayers[0]._id,
      bowler: teamAPlayers[0]._id,
      runs: 0,
      deliveryType: "wide",
      isLegalBall: false,
      isWicket: false
    },
    {
      inning: secondInning._id,
      batsman: teamBPlayers[1]._id,
      bowler: teamAPlayers[0]._id,
      runs: 2,
      deliveryType: "legbye",
      isLegalBall: true,
      isWicket: false
    },
    {
      inning: secondInning._id,
      batsman: teamBPlayers[2]._id,
      bowler: teamAPlayers[0]._id,
      runs: 0,
      deliveryType: "wicket",
      isLegalBall: true,
      isWicket: true,
      wicketType: "bowled"
    }
  ];

  for (const d of secondInningDeliveries) {
    await new Delivery({ ...d }).save();
  }

  console.log("✅ Seeded full first inning and sample second inning");
  process.exit();
};

runSeed().catch((err) => {
  console.error("❌ Error running seed script:", err);
  process.exit(1);
});
