// Main Application Logic - Central TierList with Tier Columns

class CentralTierListApp {
    constructor() {
        this.currentGamemode = null;
        this.searchTerm = '';
        this.allPlayersSorted = []; // store overall ranking
        this.init();
    }

    getMedalClass(rank) {
    if (rank === 1) return "medal-gold";
    if (rank === 2) return "medal-silver";
    if (rank === 3) return "medal-bronze";
    return "";
}


    init() {
        this.currentGamemode = 'gm_overall';
        
        // Precompute overall ranking
        this.allPlayersSorted = DataAPI.getDatabase().players
            .slice() // clone array
            .sort((a, b) => b.overallPoints - a.overallPoints);

        this.renderGamemodeTabs();
        this.renderRankings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderRankings();
            });
        }
    }
    
    renderGamemodeTabs() {
        const tabsContainer = document.getElementById('gamemodeTabs');
        if (!tabsContainer) return;
        
        const gamemodes = DataAPI.getGamemodes();
        
       tabsContainer.innerHTML = gamemodes.map(gamemode => `
    <button 
        class="gamemode-tab ${gamemode.id === this.currentGamemode ? 'active' : ''}"
        data-gamemode="${gamemode.id}"
        onclick="app.switchGamemode('${gamemode.id}')"
    >
        <img src="icons/${gamemode.id}.svg" class="gamemode-tab-icon">
        ${this.escapeHtml(gamemode.name)}
    </button>
`).join('');

// Reworking those svgs into icons and adding alt text would be a good idea for 
// accessibility and maintainability. You can create simple icon files (e.g., 
// `gm_overall.png`, `gm_duels.png`, etc.) and place them in an `icons` directory.
//  Then, update the `renderGamemodeTabs` method to use these icons instead of 
// inline SVGs. This will also allow you to easily update the icons in the 
// future without modifying the JavaScript code.

const GAMEMODE_ICONS = {
  gm_sword: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M2 21L12 3l10 18H2z" stroke="currentColor" stroke-width="2"/></svg>`,
  gm_axe: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 21l9-18 9 18H3z" stroke="currentColor" stroke-width="2"/></svg>`,
  gm_pot: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/></svg>`,
  gm_nethpot: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" stroke="currentColor" stroke-width="2"/></svg>`,
  gm_mace: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2"/></svg>`,
  gm_crystal: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" stroke-width="2"/></svg>`,
  gm_uhc: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M2 12h20" stroke="currentColor" stroke-width="2"/></svg>`,
  gm_smp: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/></svg>`
};

function renderGamemodeTabs() {
  const container = document.getElementById('gamemodeTabs');
  const gamemodes = DataAPI.getGamemodes();

  container.innerHTML = gamemodes.map(gm => `
    <button 
      class="gamemode-tab ${gm.id === app.currentGamemode ? 'active' : ''}"
      onclick="app.switchGamemode('${gm.id}')"
    >
      <span class="gamemode-icon">${GAMEMODE_ICONS[gm.id] || ''}</span>
      <span class="gamemode-label">${gm.name}</span>
    </button>
  `).join('');
}

    }
    
    switchGamemode(gamemodeId) {
        this.currentGamemode = gamemodeId;
        this.searchTerm = '';
        
        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Re-render
        this.renderGamemodeTabs();
        this.renderRankings();
    }

renderRankings() {
    const container = document.getElementById('rankingsContainer');
    if (!container) return;

    if (this.currentGamemode === 'gm_overall') {
        let players = this.allPlayersSorted;

        // Only filter, don’t recalc points
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            players = players.filter(p => p.displayName.toLowerCase().includes(term));
        }

        this.renderOverallRankings(container, players);
    } else {
        this.renderGamemodeWithTiers(container);
    }
}
    
   renderOverallRankings(container, players) {
    if (players.length === 0) {
        container.innerHTML = this.renderEmptyState(
            this.searchTerm ? 'No players found matching your search' : 'No players ranked yet'
        );
        return;
    }

  const headerHTML = `
    <div class="rankings-header overall-header">
        <div>Rank</div>
        <div>Player</div>
        <div>Region</div>
        <div>Total</div>
    </div>
`;
    const bodyHTML = `
        <div class="rankings-body">
            ${players.map((player, index) => this.renderOverallRow(player, index + 1)).join('')}
        </div>
    `;

    container.innerHTML = `
        <div class="rankings-table overall-table">
            ${headerHTML}
            ${bodyHTML}
        </div>
    `;
}

    
 renderOverallRow(player, rank) {
    const rankTitle = this.getRankTitle(player.overallPoints);

    return `
      <div class="overall-card ${this.getMedalClass(rank)}"
     onclick="app.showPlayerStats('${player.id}')">

            <div class="overall-rank">#${rank}</div>

            <div class="overall-player">
                <div class="overall-name">
                    ${this.escapeHtml(player.displayName)}
                </div>
               <div class="overall-subtitle ${rankTitle.class}">
    ${rankTitle.title} (${player.overallPoints} pts)
</div>

            </div>

            <div class="overall-region ${player.region}">
                ${player.region}
            </div>

            <div class="overall-score">
                ${player.overallPoints}
            </div>

        </div>
    `;
}
// Add helper function
getRankTitle(points) {
    if (points >= 400) return { title: "Combat Grandmaster", class: "rank-grandmaster" };
    if (points >= 250) return { title: "Combat Master", class: "rank-master" };
    if (points >= 100) return { title: "Combat Ace", class: "rank-ace" };
    if (points >= 50) return { title: "Combat Specialist", class: "rank-specialist" };
    if (points >= 20) return { title: "Combat Cadet", class: "rank-cadet" };
    if (points >= 10) return { title: "Combat Novice", class: "rank-novice" };
    return { title: "Rookie", class: "rank-rookie" };
}


 renderGamemodeWithTiers(container) {
    const players = DataAPI.searchPlayers(this.currentGamemode, this.searchTerm);

    if (players.length === 0) {
        container.innerHTML = this.renderEmptyState(
            this.searchTerm
                ? 'No players found matching your search'
                : 'No players in this gamemode yet'
        );
        return;
    }

    const tierMap = {};

    players.forEach(player => {
        const ranking = player.gamemodeRankings[this.currentGamemode];
        if (!ranking) return;

        // Extract tier number (1–5)
        const tierNumber = ranking.tierId.slice(-1);

        // Extract level (HT / LT)
        const level = ranking.tierId.startsWith("ht") ? "HT" : "LT";

        if (!tierMap[tierNumber]) tierMap[tierNumber] = [];

        tierMap[tierNumber].push({
            ...player,
            level
        });
    });

    // Sort tier numbers 1 → 5
    const sortedTiers = Object.keys(tierMap)
        .map(Number)
        .sort((a, b) => a - b);

    container.innerHTML = `
        <div class="tier-columns-container">
            ${sortedTiers.map(tier =>
                this.renderTierColumn(tier, tierMap[tier])
            ).join('')}
        </div>
    `;
}

  renderTierColumn(tierNumber, players) {

    // Sort HT first, then LT
    players.sort((a, b) => {
        if (a.level === b.level) return 0;
        return a.level === "HT" ? -1 : 1;
    });

    return `
        <div class="tier-column">
            <div class="tier-column-header">
                <div class="tier-title">TIER ${tierNumber}</div>
            </div>
            <div class="tier-column-body">
                ${players.map(player => this.renderTierPlayerRow(player)).join('')}
            </div>
        </div>
    `;
}

renderTierPlayerRow(player) {
    return `
        <div 
            class="player-row ${player.level === "HT" ? "high-tier" : "low-tier"}"
            onclick="app.showPlayerStats('${player.id}')"
        >
            <div class="tier-indicator"></div>

            <div class="player-content">
                <span class="player-name">
                    ${this.escapeHtml(player.displayName)}
                </span>
            </div>

            <div class="tier-badge">
                ${player.level}
            </div>
        </div>
    `;
}
    
    renderEmptyState(message) {
        return `
            <div class="empty-state">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <div class="empty-state-title">${this.escapeHtml(message)}</div>
                <div class="empty-state-text">
                    ${this.searchTerm ? 'Try adjusting your search' : 'Players will appear here once they are ranked'}
                </div>
            </div>
        `;
    }
    
    // Utility: Escape HTML to prevent XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize app when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new CentralTierListApp();
    });
} else {
    app = new CentralTierListApp();
}

// Export for debugging
window.app = app;
window.DataAPI = DataAPI;

// Add method to show player stats
CentralTierListApp.prototype.showPlayerStats = function(playerId) {
    const player = DataAPI.getDatabase().players.find(p => p.id === playerId);
    if (!player) return;

    const rank = this.allPlayersSorted.findIndex(p => p.id === player.id) + 1;

    const modal = document.createElement('div');
    modal.classList.add('player-modal');

    modal.innerHTML = `
        <div class="player-modal-content">

            <button class="player-modal-close" 
                onclick="this.parentElement.parentElement.remove()">✕</button>

            <div class="profile-header">
                <div class="profile-name">
                    ${this.escapeHtml(player.displayName)}
                </div>
              ${(() => {
    const rt = this.getRankTitle(player.overallPoints);
    return `<div class="profile-rank ${rt.class}">${rt.title}</div>`;
})()}

            </div>

            <div class="profile-stats">
                <div class="stat-card">
                    <div class="stat-label">Rank</div>
                    <div class="stat-value">#${rank}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Points</div>
                    <div class="stat-value">${player.overallPoints}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Region</div>
                    <div class="stat-value">${player.region}</div>
                </div>
            </div>

            <div class="profile-gamemodes">
                ${Object.entries(player.gamemodeRankings).map(([gmId, ranking]) => `
                    <div class="profile-gm-card">
                        <img src="icons/${gmId}.svg" class="profile-gm-icon">
                        <div class="profile-gm-tier">${ranking.tierName}</div>
                        <div class="profile-gm-points">${ranking.points} pts</div>
                    </div>
                `).join('')}
            </div>

        </div>
    `;

    document.body.appendChild(modal);
};
