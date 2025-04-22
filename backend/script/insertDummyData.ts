import mongoose from "mongoose";
import { Team, Player, Inning, Delivery, ScoreCard } from "../db/schema";  // Importing the models

// Connect to the MongoDB database
mongoose.connect('mongodb+srv://agrawalkush2020:1N8SL2gWRrlfhAny@cluster0.8hx4y0s.mongodb.net/', {
}).then(() => {
    console.log("Connected to MongoDB!");
}).catch(err => {
    console.log("MongoDB connection error:", err);
});

// Data for teams, players, and innings
const teams = [
    { name: "Team A" },
    { name: "Team B" }
];

const players = [
    { name: "Player 1", role: "batsman" },
    { name: "Player 2", role: "bowler" },
    { name: "Player 3", role: "allrounder" },
    { name: "Player 4", role: "wicketkeeper" },
    { name: "Player 5", role: "batsman" },
    { name: "Player 6", role: "bowler" },
    { name: "Player 7", role: "batsman" },
    { name: "Player 8", role: "bowler" },
    { name: "Player 9", role: "allrounder" },
    { name: "Player 10", role: "wicketkeeper" }
];

const deliveries = [
    { batsman: "Player 1", bowler: "Player 2", runs: 4, deliveryType: "normal" },
    { batsman: "Player 1", bowler: "Player 2", runs: 6, deliveryType: "normal" },
    { batsman: "Player 2", bowler: "Player 3", runs: 1, deliveryType: "normal" },
    { batsman: "Player 3", bowler: "Player 2", runs: 0, deliveryType: "normal" },
    // Add more deliveries for the second inning
];

async function createData() {
    try {
        // Empty collections before inserting new data
        await Team.deleteMany({});
        await Player.deleteMany({});
        await Inning.deleteMany({});
        await Delivery.deleteMany({});
        await ScoreCard.deleteMany({});

        console.log("Collections emptied successfully!");

        // Create teams
        const [teamA, teamB] = await Team.create(teams);

        // Create players and associate them with teams
        const playersData = players.map(player => ({
            ...player,
            team: player.name.includes("Player 1") || player.name.includes("Player 2") ? teamA._id : teamB._id
        }));

        const createdPlayers = await Player.create(playersData);

        // Create innings for both teams
        const firstInning = new Inning({
            battingTeam: teamA._id,
            bowlingTeam: teamB._id,
            deliveries: [],
            totalRuns: 0,
            totalWickets: 0,
            totalBalls: 0
        });

        // Add deliveries for the first inning
        for (let i = 0; i < 6; i++) {  // Hardcoding 6 overs for the first inning
            const deliveryData = deliveries[i % deliveries.length];  // Reuse deliveries for simplicity
            const delivery = new Delivery({
                inning: firstInning._id,
                batsman: createdPlayers[i % 10]._id,  // Alternate players for batsman
                bowler: createdPlayers[(i + 1) % 10]._id,  // Alternate players for bowler
                runs: deliveryData.runs,
                deliveryType: deliveryData.deliveryType,
                isLegalBall: true,
                isWicket: false
            });

            await delivery.save();
            firstInning.deliveries.push(delivery._id);
            firstInning.totalRuns += delivery.runs;
            firstInning.totalBalls++;
        }

        await firstInning.save();

        // Create scorecards for first inning
        for (const player of createdPlayers) {
            await ScoreCard.create({
                player: player._id,
                isBowler: player.role === "bowler",
                runs: player.role === "batsman" ? 0 : undefined,
                ballsFaced: player.role === "batsman" ? 10 : 0, // Hardcoded balls faced
                oversBowled: player.role === "bowler" ? 2 : 0, // Hardcoded overs bowled
                wicketsTaken: player.role === "bowler" ? 1 : 0, // Hardcoded wickets taken
                runsConceded: player.role === "bowler" ? 12 : 0, // Hardcoded runs conceded
                maidens: player.role === "bowler" ? 1 : 0, // Hardcoded maidens
            });
        }

        // Second Inning (10 overs)
        const secondInning = new Inning({
            battingTeam: teamB._id,
            bowlingTeam: teamA._id,
            deliveries: [],
            totalRuns: 0,
            totalWickets: 0,
            totalBalls: 0
        });

        // Add deliveries for the second inning (10 overs)
        for (let i = 0; i < 60; i++) {  // Hardcoding 10 overs for the second inning
            const deliveryData = deliveries[i % deliveries.length];  // Reuse deliveries for simplicity
            const delivery = new Delivery({
                inning: secondInning._id,
                batsman: createdPlayers[i % 10]._id,  // Alternate players for batsman
                bowler: createdPlayers[(i + 1) % 10]._id,  // Alternate players for bowler
                runs: deliveryData.runs,
                deliveryType: deliveryData.deliveryType,
                isLegalBall: true,
                isWicket: false
            });

            await delivery.save();
            secondInning.deliveries.push(delivery._id);
            secondInning.totalRuns += delivery.runs;
            secondInning.totalBalls++;
        }

        await secondInning.save();

        console.log("Data created successfully!");

    } catch (error) {
        console.error("Error creating data:", error);
    }
}

// Run the script
createData();
