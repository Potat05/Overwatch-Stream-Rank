
const https = require('https');
const Blob = require('buffer').Blob;
const fs = require('fs');



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



/**
 * Fetches all data from url  
 * @param {string} url  
 * @returns {Promise<Blob>}  
 */
async function fetchAllData(url) {

    return new Promise((resolve, reject) => {
        https.get(url, res => {

            res.on('error', err => reject(err));

            /** @type {ArrayBuffer[]} */
            let data = [];
            
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {

                // const buffer = new ArrayBuffer(data.reduce((len, buf) => len + buf.byteLength, 0));

                // data.reduce((offset, buf) => {
                //     new Uint8Array(buffer).set(buf, offset);
                //     return offset + buf.byteLength;
                // }, 0);

                // resolve(buffer);

                resolve(new Blob(data));

            });

        });
    });

}



const owapi = {

    /**
     * Gets user profile  
     * @param {string} battletag  
     * @param {boolean} parseStats  
     * @returns {Promise<PROFILE|null>}  
     */
    profile: async (battletag, parseStats=true) => {


        function parseProfile(str, profile={}) {
            profile.exists = !/heading">Page Not Found</.test(str);
            if(!profile.exists) {
                return profile;
            }
            profile.private = !!str.match(/Profile-player--private/);
            profile.name = str.match(/Profile-player--name">(.+?)</)?.[1];
            profile.portrait = str.match(/Profile-player--portrait.+?src="(.+?)"/s)?.[1];
            profile.title = str.match(/Profile-player--title">(.+?)</)?.[1];
            profile.banner = null; // Not here????
            profile.endorsement = parseInt(str.match(/Profile-player--endorsement.+?img\/pages\/career\/icons\/endorsement\/(\d)/s)?.[1]);

            return profile;
        }

        function parseProfileRank(str, profile={}) {
            profile.rank = {};

            profile.rank.tank = str.match(/role\/tank.+?icons\/rank\/(\w+-\d)/s)?.[1];
            profile.rank.damage = str.match(/role\/offense.+?icons\/rank\/(\w+-\d)/s)?.[1];
            profile.rank.support = str.match(/role\/support.+?icons\/rank\/(\w+-\d)/s)?.[1];

            return profile;
        }

        function parseProfileStats(str, profile={}) {
            profile.stats = {};
    
            for(const mode of ['quickPlay', 'competitive']) {
                profile.stats[mode] = {};
                
                const modeStr = str.match(new RegExp(`stats ${mode}-view.*?">.+?</blz-section>`, 's'))?.[0];

                const heroes = modeStr.match(/<option value="\d+" option-id=".+?">.+?<\/option>/g).map(oStr => {
                    return oStr.match(/option-id="(.+?)"/)?.[1];
                });

                for(let i in heroes) {
                    profile.stats[mode][heroes[i]] = {};

                    const heroStatsStr = modeStr.match(new RegExp(`stats-container option-${i}.+?">(.+?)</span>`, 's'))?.[0];

                    heroStatsStr.match(/<div class="stat-item">.+?<\/div>/gs).forEach(stat => {
                        const match = stat.match(/"name">(.+?)<.+?"value">(.+?)</);

                        const key = match?.[1];
                        let value = match?.[2];
                        if([':', '%'].every(char => !value.includes(char))) {
                            value = parseFloat(value);
                        }

                        profile.stats[mode][heroes[i]][key] = value;
                    });

                }
            }

            return profile;
        }


        return new Promise((resolve, reject) => {

            if(typeof battletag != 'string' || !battletag.includes('#')) return resolve(null);

            const profile_url = `https://overwatch.blizzard.com/en-us/career/${battletag.replace('#', '-')}/`;

            // console.debug(`owapi.profile: Fetching profile: "${profile_url}"`);
    
            fetchAllData(profile_url).then(async blob => {

                const str = await blob.text();

                // fs.writeFile('./test.html', str, undefined, err => {
                //     if(err) console.error(err);
                // });

                const profile = {};
                profile.url = profile_url;

                parseProfile(str, profile);

                if(profile.exists) {
                    profile.battletag = battletag;

                    if(!profile.private) {
                        parseProfileRank(str, profile);

                        if(parseStats) {
                            parseProfileStats(str, profile);
                        }
                    }
                }

                resolve(profile);

            }).catch(reason => {
                reject(reason);
            });
        });
    },



    ranks: {
        'BronzeTier-5': {
            name: 'BronzeTier-5',
            icon: '/resource/BronzeTier-5.png',
            value: 0,
            competitvePoints: 65
        },

        'BronzeTier-4': {
            name: 'BronzeTier-4',
            icon: '/resource/BronzeTier-4.png',
            value: 1,
            competitivePoints: 65
        },

        'BronzeTier-3': {
            name: 'BronzeTier-3',
            icon: '/resource/BronzeTier-3.png',
            value: 2,
            competitivePoints: 65
        },

        'BronzeTier-2': {
            name: 'BronzeTier-2',
            icon: '/resource/BronzeTier-2.png',
            value: 3,
            competitivePoints: 65
        },

        'BronzeTier-1': {
            name: 'BronzeTier-1',
            icon: '/resource/BronzeTier-1.png',
            value: 4,
            competitivePoints: 65
        },

        'SilverTier-5': {
            name: 'SilverTier-5',
            icon: '/resource/SilverTier-5.png',
            value: 5,
            competitivePoints: 125
        },

        'SilverTier-4': {
            name: 'SilverTier-4',
            icon: '/resource/SilverTier-4.png',
            value: 6,
            competitivePoints: 125
        },

        'SilverTier-3': {
            name: 'SilverTier-3',
            icon: '/resource/SilverTier-3.png',
            value: 7,
            competitivePoints: 125
        },

        'SilverTier-2': {
            name: 'SilverTier-2',
            icon: '/resource/SilverTier-2.png',
            value: 8,
            competitivePoints: 125
        },

        'SilverTier-1': {
            name: 'SilverTier-1',
            icon: '/resource/SilverTier-1.png',
            value: 9,
            competitivePoints: 125
        },

        'GoldTier-5': {
            name: 'GoldTier-5',
            icon: '/resource/GoldTier-5.png',
            value: 10,
            competitivePoints: 256
        },

        'GoldTier-4': {
            name: 'GoldTier-4',
            icon: '/resource/GoldTier-4.png',
            value: 11,
            competitivePoints: 250
        },

        'GoldTier-3': {
            name: 'GoldTier-3',
            icon: '/resource/GoldTier-3.png',
            value: 12,
            competitivePoints: 250
        },

        'GoldTier-2': {
            name: 'GoldTier-2',
            icon: '/resource/GoldTier-2.png',
            value: 13,
            competitivePoints: 250
        },

        'GoldTier-1': {
            name: 'GoldTier-1',
            icon: '/resource/GoldTier-1.png',
            value: 14,
            competitivePoints: 250
        },

        'PlatinumTier-5': {
            name: 'PlatinumTier-5',
            icon: '/resource/PlatinumTier-5.png',
            value: 15,
            competitivePoints: 500
        },

        'PlatinumTier-4': {
            name: 'PlatinumTier-4',
            icon: '/resource/PlatinumTier-4.png',
            value: 16,
            competitivePoints: 500
        },

        'PlatinumTier-3': {
            name: 'PlatinumTier-3',
            icon: '/resource/PlatinumTier-3.png',
            value: 17,
            competitivePoints: 500
        },

        'PlatinumTier-2': {
            name: 'PlatinumTier-2',
            icon: '/resource/PlatinumTier-2.png',
            value: 18,
            competitivePoints: 500
        },

        'PlatinumTier-1': {
            name: 'PlatinumTier-1',
            icon: '/resource/PlatinumTier-1.png',
            value: 19,
            competitivePoints: 500
        },

        'DiamondTier-5': {
            name: 'DiamondTier-5',
            icon: '/resource/DiamondTier-5.png',
            value: 20,
            competitivePoints: 750
        },

        'DiamondTier-4': {
            name: 'DiamondTier-4',
            icon: '/resource/DiamondTier-4.png',
            value: 21,
            competitivePoints: 750
        },

        'DiamondTier-3': {
            name: 'DiamondTier-3',
            icon: '/resource/DiamondTier-3.png',
            value: 22,
            competitivePoints: 750
        },

        'DiamondTier-2': {
            name: 'DiamondTier-2',
            icon: '/resource/DiamondTier-2.png',
            value: 23,
            competitivePoints: 750
        },

        'DiamondTier-1': {
            name: 'DiamondTier-1',
            icon: '/resource/DiamondTier-1.png',
            value: 24,
            competitivePoints: 750
        },

        'MasterTier-5': {
            name: 'MasterTier-5',
            icon: '/resource/MasterTier-5.png',
            value: 25,
            competitivePoints: 1200
        },

        'MasterTier-4': {
            name: 'MasterTier-4',
            icon: '/resource/MasterTier-4.png',
            value: 26,
            competitivePoints: 1200
        },

        'MasterTier-3': {
            name: 'MasterTier-3',
            icon: '/resource/MasterTier-3.png',
            value: 27,
            competitivePoints: 1200
        },

        'MasterTier-2': {
            name: 'MasterTier-2',
            icon: '/resource/MasterTier-2.png',
            value: 28,
            competitivePoints: 1200
        },

        'MasterTier-1': {
            name: 'MasterTier-1',
            icon: '/resource/MasterTier-1.png',
            value: 29,
            competitivePoints: 1200
        },

        'GrandmasterTier-5': {
            name: 'GrandmasterTier-5',
            icon: '/resource/GrandmasterTier-5.png',
            value: 30,
            competitivePoints: 1750
        },

        'GrandmasterTier-4': {
            name: 'GrandmasterTier-4',
            icon: '/resource/GrandmasterTier-4.png',
            value: 31,
            competitivePoints: 1750
        },

        'GrandmasterTier-3': {
            name: 'GrandmasterTier-3',
            icon: '/resource/GrandmasterTier-3.png',
            value: 32,
            competitivePoints: 1750
        },

        'GrandmasterTier-2': {
            name: 'GrandmasterTier-2',
            icon: '/resource/GrandmasterTier-2.png',
            value: 33,
            competitivePoints: 1750
        },

        'GrandmasterTier-1': {
            name: 'GrandmasterTier-1',
            icon: '/resource/GrandmasterTier-1.png',
            value: 34,
            competitivePoints: 1750
        }
    }

}



module.exports = owapi;
