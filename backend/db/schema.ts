import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    name: String,
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }]
});


const playerSchema = new mongoose.Schema({
    name: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    role: { type: String, enum: ["batsman", "bowler", "allrounder", "wicketkeeper"] }
});

const inningSchema = new mongoose.Schema({
    battingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    bowlingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    deliveries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Delivery" }],
    totalRuns: { type: Number, default: 0 },
    totalWickets: { type: Number, default: 0 },
    totalBalls: { type: Number, default: 0 },
    extras: {
        wide: { type: Number, default: 0 },
        noBall: { type: Number, default: 0 },
        bye: { type: Number, default: 0 },
        legBye: { type: Number, default: 0 }
    }
});

const deliverySchema = new mongoose.Schema({
    inning: { type: mongoose.Schema.Types.ObjectId, ref: "Inning" },
    batsman: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    runs: { type: Number, default: 0 },
    extras: {
        type: String,
        run: { type: Number, default: 0 }
    },
    deliveryType: {
        type: String,
        enum: [
            "normal", "normal_with_overthrow", "bye", "bye_with_overthrow", "legbye", "legbye_with_overthrow",
            "noball", "noball_with_overthrow", "noball_with_bye", "noball_with_bye_and_overthrow",
            "noball_with_legbye", "noball_with_legbye_and_overthrow",
            "wide", "wide_with_overthrow", "wide_with_bye", "wide_with_bye_and_overthrow",
            "wide_with_legbye", "wide_with_legbye_and_overthrow",
            "wicket"
        ]
    },
    isLegalBall: { type: Boolean, default: true },
    isWicket: { type: Boolean, default: false },
    wicketType: { type: String, enum: ["bowled", "caught", "runout", "lbw", "hitwicket", "stumped", null], default: null },
    createdAt: { type: Date, default: Date.now }
});


const scoreCardSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    isBowler: { type: Boolean, default: false },
    runs: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    oversBowled: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    wicketsTaken: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 }
});

const Team = mongoose.model("Team", teamSchema);
const Player = mongoose.model("Player", playerSchema);
const Inning = mongoose.model("Inning", inningSchema);
const Delivery = mongoose.model("Delivery", deliverySchema);
const ScoreCard = mongoose.model("ScoreCard", scoreCardSchema);

export {
    Team,
    Player,
    Inning,
    Delivery,
    ScoreCard
};

    