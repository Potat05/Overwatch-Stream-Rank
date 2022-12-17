
/**
 * @typedef {object} RANK  
 * @property {string} name - Rank name.  
 * @property {string} icon - Icon location.  
 * @property {number} value - Value.  
 * @property {number} competitivePoints - Competitve points gain at end of season.  
 */

/**
 * @typedef {object} PROFILE  
 * @property {boolean} exists - If profile exists.  
 * @property {string} url - Profile URL.  
 * @property {boolean} private - If profile is private.  
 * @property {string} battletag - Battle tag.  
 * @property {string} name - Name.  
 * @property {string} portrait - Portrait URL.  
 * @property {string} title - Title.  
 * @property {string} banner - Banner URL. (DOES NOT EXIST CURRENTLY.)  
 * @property {number} endorsement - Endorsement leve.  
 * @property {object} rank - Ranks for each role.  
 * @property {string} [rank.tank] - Tank role rank.  
 * @property {string} [rank.damage] - Damage role rank.  
 * @property {string} [rank.support] - Support role rank.  
 * @property {object} stats - Stats for mode.  
 * @property {object} [stats.quickPlay] - Quickplay mode.  
 * @property {object} [stats.competitive] - Competitive mode.  
 */





(async function() {

    const PROFILE_UPDATE_RATE_MINUTES = 61;



    /** @type {RANK[]} */
    const RANKS = await (await fetch('/api/ranks')).json();



    const url = new URL(location.href);
    const battletag = url.searchParams.get('battletag');
    const getRankType = url.searchParams.get('getranktype') ?? 'highest';



    if(battletag == null) {
        document.body.innerHTML = 'Must include your battletag in search parameters!';
        return;
    }
    if(!battletag.includes('#')) {
        document.body.innerHTML = `Battle tag string must be escaped! (Replace '#' with '%23')`;
        return;
    }



    async function updateIcon() {
        const apiUrl = new URL('/api/profile', location.origin);
        apiUrl.searchParams.set('battletag', battletag);
        apiUrl.searchParams.set('stats', false);

        /** @type {PROFILE} */
        const profile = await (await fetch(apiUrl.href)).json();
        console.debug(profile);
        
        if(!profile.exists) return;
        if(profile.private) return;

        // For testing cause profiles dont have rank displayed for now?????
        // profile.rank.tank = 'DiamondTier-4';
        // profile.rank.damage = 'SilverTier-5';
        // profile.rank.support = 'MasterTier-3';

        // Hasn't placed, don't show rank.
        if(Object.keys(profile.rank).length == 0) return;

        const rank = getProfileRank(profile, getRankType);

        const iconContainer = document.querySelector('#role-rank-icon-container');
        while(iconContainer.firstChild) {
            iconContainer.removeChild(iconContainer.firstChild);
        }

        const img = document.createElement('img');
        img.id = 'role-rank-icon';
        img.src = getRank(rank).icon;
        iconContainer.appendChild(img);
    }



    updateIcon();
    setInterval(updateIcon, 1000 * 60 * PROFILE_UPDATE_RATE_MINUTES);





    function getRank(value) {
        if(RANKS[value]) return RANKS[value];
        for(let key in RANKS) {
            if(RANKS[key].value == value) return RANKS[key];
        }
    }
    
    function getProfileRank(profile, getType='highest') {
        switch(getType.toLowerCase()) {

            case 'tank': {
                return profile.rank.tank;
                break; }

            case 'damage':
            case 'dmg':
            case 'dps': {
                return profile.rank.damage;
                break; }

            case 'support':
            case 'healer': {
                return profile.rank.support;
                break; }

            case 'average': 
            case 'avg': {
                let avg = 0;
                let numRanks = 0;
                for(let key in profile.rank) {
                    if(profile.rank[key] == undefined) continue;
                    avg += getRank(profile.rank[key]).value;
                    numRanks++;
                }
                avg = Math.round(avg / numRanks);
                return getRank(avg).name;
                break; }

            case 'highest': {
                let highest = 0;
                for(let key in profile.rank) {
                    if(profile.rank[key] == undefined) continue;
                    const rInd = getRank(profile.rank[key]).value;
                    if(rInd > highest) {
                        highest = rInd;
                    }
                }
                return getRank(highest).name;
                break; }

            default: {
                throw new Error('getProfileRank: Invalid getType.');
                break; }
            
        }
    }



})();
