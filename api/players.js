const { MongoClient } = require('mongodb');

// Use the same MongoDB URI as your bot
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'tierlist_bot';

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env');
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DATABASE_NAME);
    cachedDb = db;
    return db;
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const db = await connectToDatabase();
        const users = await db.collection('users').find({}).toArray();

        // Format the MongoDB data to match the old player.json structure
        const formattedPlayers = users.map(user => {
            return {
                name: user.minecraftName || user.username,
                region: user.region || "NA",
                tiers: {
                    sword: user.currentTiers.Sword || "-",
                    pot: user.currentTiers.DiaPot || "-",
                    nethpot: user.currentTiers.NethPot || "-",
                    axe: user.currentTiers.Axe || "-",
                    mace: user.currentTiers.Mace || "-",
                    crystal: user.currentTiers.Crystal || "-",
                    uhc: user.currentTiers.UHC || "-",
                    smp: user.currentTiers.SMP || "-",
                    diasmp: user.currentTiers.DiamondSMP || "-"
                }
            };
        });

        res.status(200).json(formattedPlayers);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch player data', details: error.message });
    }
};
