// Mock Data Generator - Central TierList Style with JSON Loading

const GAMEMODES = [
    { id: 'gm_overall', name: 'Overall', isOverall: true },
    { id: 'gm_sword', name: 'Sword' },
    { id: 'gm_pot', name: ' Pot ' },
    { id: 'gm_nethpot', name: 'Neth OP' },
    { id: 'gm_axe', name: 'Axe' },
    { id: 'gm_mace', name: 'Mace' },
    { id: 'gm_crystal', name: 'Crystal' },
    { id: 'gm_uhc', name: 'UHC' },
    { id: 'gm_smp', name: 'SMP' },
    { id: 'gm_diasmp', name: 'Diamond SMP' }
];

const TIER_TEMPLATES = [
    { id: 'ht1', name: 'HT1', fullName: 'High Tier 1', order: 1, points: 60 },
    { id: 'lt1', name: 'LT1', fullName: 'Low Tier 1', order: 2, points: 45 },
    { id: 'ht2', name: 'HT2', fullName: 'High Tier 2', order: 3, points: 30 },
    { id: 'lt2', name: 'LT2', fullName: 'Low Tier 2', order: 4, points: 20 },
    { id: 'ht3', name: 'HT3', fullName: 'High Tier 3', order: 5, points: 15 },
    { id: 'lt3', name: 'LT3', fullName: 'Low Tier 3', order: 6, points: 6 },
    { id: 'ht4', name: 'HT4', fullName: 'High Tier 4', order: 7, points: 4 },
    { id: 'lt4', name: 'LT4', fullName: 'Low Tier 4', order: 8, points: 3 },
    { id: 'ht5', name: 'HT5', fullName: 'High Tier 5', order: 9, points: 2 },
    { id: 'lt5', name: 'LT5', fullName: 'Low Tier 5', order: 10, points: 1 }
];

const REGIONS = ['NA', 'EU', 'AS', 'SA', 'OCE'];

// Storage for loaded player data
let REAL_PLAYERS_DATA = [];

// Load player data from JSON file
async function loadPlayerData() {
    try {
        const response = await fetch('player.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        REAL_PLAYERS_DATA = await response.json();
        console.log(`✅ Loaded ${REAL_PLAYERS_DATA.length} players from player.json`);
        return true;
    } catch (error) {
        console.error('❌ Failed to load player.json:', error);
        console.log('ℹ️  Using fallback dummy data instead');
        return false;
    }
}

// Generate tiers for all gamemodes (excluding overall)
function generateTiers() {
    const tiers = [];
    GAMEMODES.forEach(gamemode => {
        if (gamemode.isOverall) return; // Skip overall
        
        TIER_TEMPLATES.forEach(template => {
            tiers.push({
                id: `${gamemode.id}_${template.id}`,
                name: template.name,
                fullName: template.fullName,
                order: template.order,
                points: template.points,
                gamemodeId: gamemode.id
            });
        });
    });
    return tiers;
}

// Get random tier (for fallback dummy data)
function getRandomTier() {
    return TIER_TEMPLATES[Math.floor(Math.random() * TIER_TEMPLATES.length)];
}

// Get random region (for fallback dummy data)
function getRandomRegion() {
    return REGIONS[Math.floor(Math.random() * REGIONS.length)];
}

// Generate players from JSON data
function generatePlayersFromJSON() {
    if (REAL_PLAYERS_DATA.length === 0) {
        console.warn('⚠️  No player data loaded from JSON');
        return [];
    }
    
    const tierPoints = {
        'HT1': 60, 'LT1': 45, 'HT2': 30, 'LT2': 20,
        'HT3': 15, 'LT3': 6, 'HT4': 4, 'LT4': 3,
        'HT5': 2, 'LT5': 1
    };
    
    const players = REAL_PLAYERS_DATA.map((playerData, index) => {
        const gamemodeRankings = {};
        let overallPoints = 0;
        
        // Map JSON tiers to gamemode rankings
        Object.entries(playerData.tiers).forEach(([gamemode, tier]) => {
            const gmId = `gm_${gamemode}`;
            const tierId = tier.toLowerCase();
            const points = (tier !== "-") ? (tierPoints[tier.toUpperCase()] || 0) : 0;
            
            gamemodeRankings[gmId] = {
                tierId: tierId,
                tierName: tier.toUpperCase(),
                points: points
            };
            
            overallPoints += points;
        });
        
        return {
            id: `player_${index + 1}`,
            displayName: playerData.name,
            region: playerData.region,
            gamemodeRankings: gamemodeRankings,
            overallPoints: overallPoints
        };
    });
    
    console.log(`✅ Generated ${players.length} player records`);
    return players;
}

// Fallback: Generate dummy players (if JSON fails to load)
function generateDummyPlayers() {
    const playerCount = 150;
    const players = [];
    const nonOverallGamemodes = GAMEMODES.filter(gm => !gm.isOverall);
    
    for (let i = 1; i <= playerCount; i++) {
        const playerNumber = String(i).padStart(4, '0');
        const player = {
            id: `player_${i}`,
            displayName: `Player_${playerNumber}`,
            region: getRandomRegion(),
            gamemodeRankings: {}
        };
        
        // Assign random tier for each gamemode
        nonOverallGamemodes.forEach(gamemode => {
            const tier = getRandomTier();
            player.gamemodeRankings[gamemode.id] = {
                tierId: tier.id,
                tierName: tier.name,
                points: tier.points
            };
        });
        
        // Calculate overall points
        player.overallPoints = Object.values(player.gamemodeRankings)
            .reduce((sum, ranking) => sum + ranking.points, 0);
        
        players.push(player);
    }
    
    console.log(`⚠️  Generated ${players.length} dummy players (fallback mode)`);
    return players;
}

// Create initial database with empty players
const DATABASE = {
    gamemodes: GAMEMODES,
    tiers: generateTiers(),
    players: [] // Will be populated after JSON loads
};

// Initialize data loading
loadPlayerData().then((success) => {
    if (success && REAL_PLAYERS_DATA.length > 0) {
        DATABASE.players = generatePlayersFromJSON();
    } else {
        DATABASE.players = generateDummyPlayers();
    }
    
    // Trigger app initialization/refresh if app is already loaded
    if (window.app) {
        console.log('🔄 Refreshing app with new data...');
        window.app.allPlayersSorted = DATABASE.players
            .slice()
            .sort((a, b) => b.overallPoints - a.overallPoints);
        window.app.renderRankings();
    }
    
    console.log('=== Central TierList Database Ready ===');
    console.log(`Gamemodes: ${GAMEMODES.length} (including Overall)`);
    console.log(`Total players: ${DATABASE.players.length}`);
    console.log('========================================');
});

// Helper functions for data access
const DataAPI = {
    getGamemodes: () => DATABASE.gamemodes,
    
    getTiersByGamemode: (gamemodeId) => {
        return DATABASE.tiers
            .filter(tier => tier.gamemodeId === gamemodeId)
            .sort((a, b) => a.order - b.order);
    },
    
    // Get players for a specific gamemode (not overall)
    getPlayersByGamemode: (gamemodeId) => {
        if (gamemodeId === 'gm_overall') {
            // Return all players sorted by overall points
            return [...DATABASE.players].sort((a, b) => b.overallPoints - a.overallPoints);
        }
        
        // Return players sorted by tier order for this gamemode
        return [...DATABASE.players].sort((a, b) => {
            const tierA = TIER_TEMPLATES.find(t => t.id === a.gamemodeRankings[gamemodeId].tierId);
            const tierB = TIER_TEMPLATES.find(t => t.id === b.gamemodeRankings[gamemodeId].tierId);
            return tierA.order - tierB.order;
        });
    },
    
    // Get players by tier for a specific gamemode
    getPlayersByTier: (gamemodeId, tierId) => {
        return DATABASE.players.filter(player => {
            return player.gamemodeRankings[gamemodeId]?.tierId === tierId;
        });
    },

    searchPlayers: (gamemodeId, searchTerm) => {
        let filteredPlayers = DATABASE.players;

        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            filteredPlayers = DATABASE.players.filter(player => 
                player.displayName.toLowerCase().includes(term)
            );
        }

        if (gamemodeId === 'gm_overall') {
            // Sort by pre-calculated overallPoints instead of recalculating
            return filteredPlayers.sort((a, b) => b.overallPoints - a.overallPoints);
        }

        // For specific gamemode, filter out unranked players and sort by tier
        return [...filteredPlayers]
            .filter(player => player.gamemodeRankings[gamemodeId].tierId !== "-")
            .sort((a, b) => {
                const tierA = TIER_TEMPLATES.find(t => t.id === a.gamemodeRankings[gamemodeId].tierId);
                const tierB = TIER_TEMPLATES.find(t => t.id === b.gamemodeRankings[gamemodeId].tierId);
                return tierA.order - tierB.order;
            });
    },
    
    getDatabase: () => DATABASE
};