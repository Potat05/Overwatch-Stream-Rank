
const https = require('https');
const Blob = require('buffer').Blob;
const fs = require('fs');



/**
 * @typedef {Object} PROFILE  
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

                profile.exists = !/heading">Page Not Found</.test(str);
                profile.url = profile_url;
                if(!profile.exists) {
                    return resolve(profile);
                }
                profile.private = !!str.match(/Profile-player--private/);
                profile.battletag = battletag;
                profile.name = str.match(/Profile-player--name">(.+?)</)?.[1];
                profile.portrait = str.match(/Profile-player--portrait.+?src="(.+?)"/s)?.[1];
                profile.title = str.match(/Profile-player--title">(.+?)</)?.[1];
                profile.banner = null; // Not here????
                profile.endorsement = parseInt(str.match(/Profile-player--endorsement.+?img\/pages\/career\/icons\/endorsement\/(\d)/s)?.[1]);

                if(!profile.private) {
                    profile.rank = {};

                    profile.rank.tank = str.match(/role\/tank.+?icons\/rank\/(\w+-\d)/s)?.[1];
                    profile.rank.damage = str.match(/role\/offense.+?icons\/rank\/(\w+-\d)/s)?.[1];
                    profile.rank.support = str.match(/role\/support.+?icons\/rank\/(\w+-\d)/s)?.[1];

                    if(parseStats) {
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
                    }
                }


                resolve(profile);

            }).catch(reason => {
                reject(reason);
            });
        });
    }

}



module.exports = owapi;
