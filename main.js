
const RANKS = [
    'BronzeTier-5',
    'BronzeTier-4',
    'BronzeTier-3',
    'BronzeTier-2',
    'BronzeTier-1',
    'SilverTier-5',
    'SilverTier-4',
    'SilverTier-3',
    'SilverTier-2',
    'SilverTier-1',
    'GoldTier-5',
    'GoldTier-4',
    'GoldTier-3',
    'GoldTier-2',
    'GoldTier-1',
    'PlatinumTier-5',
    'PlatinumTier-4',
    'PlatinumTier-3',
    'PlatinumTier-2',
    'PlatinumTier-1',
    'DiamondTier-5',
    'DiamondTier-4',
    'DiamondTier-3',
    'DiamondTier-2',
    'DiamondTier-1',
    'MasterTier-5',
    'MasterTier-4',
    'MasterTier-3',
    'MasterTier-2',
    'MasterTier-1',
    'GrandmasterTier-5',
    'GrandmasterTier-4',
    'GrandmasterTier-3',
    'GrandmasterTier-2',
    'GrandmasterTier-1'
];



/**
 * @typedef {Object} SETTINGS  
 * @property {string} battletag - Battle tag.  
 * @property {"tank"|"damage"|"support"|"average"|"highest"} rank_role - What role to display. 
 * @property {number} port - Port number of the server.  
 * @property {number} profile_updaterate_minutes - Update rate in minutes.  
 */

/**
 * @typedef {Object} PROFILE  
 * @property {string} battletag - Battle tag.  
 * @property {object} rank - Ranks for each role.  
 * @property {string} [rank.tank] - Tank role rank.  
 * @property {string} [rank.damage] - Damage role rank.  
 * @property {string} [rank.support] - Support role rank.  
 */



/**
 * Fetch settings  
 * @returns {Promise<SETTINGS>}  
 */
async function fetch_settings() {
    const settings_url = './settings.json';
    console.debug(`Fetching settings "${settings_url}"`);
    return await (await fetch(settings_url)).json();
}

/**
 * Fetch profile  
 * @param {SETTINGS} settings  
 * @returns {Promise<PROFILE>}
 */
async function fetch_profile(settings) {
    if(settings == undefined) return;

    const profile_url = `http://127.0.0.1:${settings.port}/profile/${settings.battletag.replace('#', '-')}/`;
    console.debug(`Fetching profile "${profile_url}"`);

    return await (await fetch(profile_url)).json();
}

/**
 * Displays profile  
 * @param {SETTINGS} settings  
 * @param {PROFILE} profile    
 */
function display_profile(settings, profile) {

    let icon = null;

    // Please ignore this. I'm too lazy to clean it up.
    switch(settings.rank_role.toLowerCase()) {
        case 'tank': {
            icon = profile.rank.tank;
            break; }
        case 'damage': {
            icon = profile.rank.damage;
            break; }
        case 'support': {
            icon = profile.rank.support;
            break; }
        case 'average': {
            let avg = 0;
            let numRanks = 0;
            for(let key in profile.rank) {
                if(profile.rank[key] == undefined) continue;
                avg += RANKS.indexOf(profile.rank[key]);
                numRanks++;
            }
            avg = Math.round(avg / numRanks);
            icon = RANKS[avg];
            break; }
        case 'highest': {
            let highest = 0;
            for(let key in profile.rank) {
                if(profile.rank[key] == undefined) continue;
                const rInd = RANKS.indexOf(profile.rank[key]);
                if(rInd > highest) {
                    highest = rInd;
                }
            }
            icon = RANKS[highest];
            break; }
        default: {
            throw new Error('display_profile: Invalid "rank_role" in settings!');
            break; }
    }



    const iconContainer = document.querySelector('#role-rank-icon-container');
    while(iconContainer.firstChild) {
        iconContainer.removeChild(iconContainer.firstChild);
    }

    const img = document.createElement('img');
    img.id = 'role-rank-icon';
    img.src = `./resource/${icon}.png`;
    iconContainer.appendChild(img);
}

/**
 * Fetch and display profile.  
 * @param {SETTINGS} settings  
 */
async function fetch_display_profile(settings) {
    const profile = await fetch_profile(settings);
    console.log(profile);
    display_profile(settings, profile);
}



(async function() {

    const settings = await fetch_settings();

    function update() {
        console.debug('Update.');

        fetch_display_profile(settings);
    }

    update();
    setInterval(update, 1000 * 60 * settings.profile_updaterate_minutes);

})();
