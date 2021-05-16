const CONFIG = require("../config/config");
const CONSTANTS = require("../config/constants");
const request = require("request");
require("dotenv").config();
const Eris = require("eris");
var MongoClient = require("mongodb").MongoClient;

async function verify(message, args) {
    var msg = message;
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Reach out to an administrator and tell them to configurate the server first.";
    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) {
            console.error("> [Verify Error] Threw within the first connect. " + err);
            throw err;
        }
        var dbo = db.db("GalaxyRaiderDB");

        let entry = await dbo.collection("GalaxySuspensions").findOne({UID: msg.member.id, guildID: msg.guildID});
        if ((await entry) && (await entry).currentlySuspended) {
            db.close();
            try {
                msg.member.addRole(CONFIG.SystemConfig.servers[msg.guildID].suspendrole);
                let pmChannel = await CONSTANTS.bot.getDMChannel(msg.author.id);
                CONSTANTS.bot.createMessage(pmChannel.id, {
                    embed: {
                        title: "Failure",
                        description: 
                        `You tried to re-verify while you were still suspended.
                                
                        Please wait until you are unsuspended to re-verify.`,
                        color: 0xff0000
                    }
                });
                return;
            }
            catch (e) {}
        }
        else {
            db.close();
            let dmChannel = await CONSTANTS.bot.getDMChannel(msg.author.id);
            let collector = new Eris.MessageCollector(dmChannel, {
                timeout: 300000,
                count: 1,
                filter: function(filterMsg) {
                    return filterMsg.author.id == msg.author.id;
                }
            })
            collector.run();

            let threedigitcode = Math.floor(Math.random()*(900)+100);
            let threelettername = msg.guild.name.substring(0, 3);
            let code = `${threelettername}${threedigitcode}`;

            let verifymsg = await CONSTANTS.bot.createMessage(dmChannel.id, {
                embed: {
                    author: {
                        name: `${msg.guild.name} Verification`,
                        icon_url: msg.guild.iconURL,
                    },
                    description: 
                    `**How To Verify**
\`\`\`md
1. Make sure your realmeye matches the server-specific requirements below.
2. Put the code 

#       ${code}         #

in your realmeye description.
3. Type your ingame name here EXACTLY as it appears in-game (case-sensitive).
\`\`\`
                    
                    
                    **__Server-Specific Verification Requirements:__**
                    `,
                    fields: [
                        {
                            name: "Stars Required:",
                            value: 
                            "```css\n" + CONFIG.SystemConfig.servers[msg.guildID].verification.minrank + "```",
                            inline: true,
                        },
                        {
                            name: "Hidden Location Required:",
                            value:
                            "```css\n" + CONFIG.SystemConfig.servers[msg.guildID].verification.hiddenloc + "```",
                            inline: true,
                        }
                    ],
                    color: 0x5b1c80,
                }
            }).catch((err) => {
                console.error("> [VERIFY DM FAILED] Couldn't DM user " + msg.author.id + ".\n > Error: " + err);
                return {err: err};
            });

            if (verifymsg.err) return;

            let hasCollected = false;

            collector.on("collect", async(dmmsg) => {
                hasCollected = true;
                let ign = dmmsg.content;
                CONSTANTS.bot.createMessage(dmChannel.id, {
                    embed: {
                        description: 
                        `Working...`,
                        color: 0x5b1c80,
                    }
                });
                request('https://nightfirec.at/realmeye-api/?player=' + ign + "&filter=desc1+desc2+desc3+player_last_seen+rank", {json: true}, async (err, res, body) => {
                    if (err) {
                        try {
                            await CONSTANTS.bot.createMessage(dmChannel.id, `Something went wrong with that operation.`);
                            await CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, `Something went wrong with that operation.`);
                        }
                        catch(e) {}
                        return console.log(err);
                    }

                    if (body.error) {
                        await CONSTANTS.bot.createMessage(dmChannel.id, {
                            embed: {
                                title: "Failure",
                                description: 
                                `Name \`${ign}\` not found with Realmeye API.
                                
                                Please re-verify with a correct ingame name. 
                                
                                If this was the correct name, Realmeye cannot see you -- please head over to your server's Manual Verify section.`,
                                color: 0xff0000
                            }
                        });
                        return;
                    }
                    else if (CONFIG.SystemConfig.servers[msg.guildID].verification.hiddenloc && body.player_last_seen != "hidden") { // check if server config requires hidden loc
                        CONSTANTS.bot.createMessage(dmChannel.id, {
                            embed: {
                                title: "Failure",
                                description:
                                `Last Location: \`${body.player_last_seen}\`
                                
                                Please set your Realmeye location to private and re-verify.`,
                                color: 0xff0000
                            }
                        });
                        return;
                    }
                    else if (body.rank < CONFIG.SystemConfig.servers[msg.guildID].verification.minrank) {
                        await CONSTANTS.bot.createMessage(dmChannel.id, { // check if server config requires rank
                            embed: {
                                title: "Failure",
                                description: 
                                `Stars: \`${body.rank}\`
                                
                                Please make sure you meet the star requirements for this server.
                                
                                Star requirement: \`${CONFIG.SystemConfig.servers[msg.guildID].verification.minrank}\``,
                                color: 0xff0000
                            }
                        });
                        return;
                    }
                    else if (!(body.desc1.includes(code) || body.desc2.includes(code) || body.desc3.includes(code))) {
                        await CONSTANTS.bot.createMessage(dmChannel.id, { 
                            embed: {
                                title: "Failure",
                                description: 
                                `Either you didn't put the correct code in your realmeye description, or you accidentally put the wrong in-game name.
                                
                                Please re-verify with the correct code and IGN.`,
                                color: 0xff0000
                            }
                        });
                        return;
                    }
                    else {
                        let hasFailed = false;
                        await msg.member.edit({
                            nick: `${ign}`
                        }).catch(async () => {
                            await CONSTANTS.bot.createMessage(dmChannel.id, { // check if server config requires rank
                                embed: {
                                    title: "Partial Failure",
                                    description: 
                                    `I found you on Realmeye and you meet verification requirements, but I couldn't edit your nickname!`,
                                    color: 0xff0000
                                }
                            }).catch(() => console.log("> [VERIFY ERR] Failed to create a dm message in verify nick editing"));
                            await CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                                embed: {
                                    title: `Auto-Verification Failure`,
                                    description: 
                                    `**User** ${msg.member.mention} just tried to verify under the IGN \`${ign}\`.
                                    **UID**: ${msg.member.id}
                                    
                                    However, unfortunately, I could not edit their nickname (likely because one of their roles is higher than my highest or they are administrator).`,
                                    color: 0xff0000,
                                    footer: {
                                        text: `${new Date().toUTCString()}`
                                    }
                                }
                            }).catch(() => console.log("> [VERIFY ERR] Failed to create a log message in verify nick editing"));
                            hasFailed = true;
                        });
                        await CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.forEach(async id => {
                            await msg.member.addRole(id).catch(async () => {
                                await CONSTANTS.bot.createMessage(dmChannel.id, { // check if server config requires rank
                                    embed: {
                                        title: "Partial Failure",
                                        description: 
                                        `I found you on Realmeye and you meet verification requirements, but I couldn't edit your roles!`,
                                        color: 0xff0000
                                    }
                                }).catch(() => console.log("> [VERIFY ERR] Failed to create dm message in verify role addition"));
                                await CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                                    embed: {
                                        title: `Auto-Verification Failure`,
                                        description: 
                                        `**User** ${msg.member.mention} just tried to verify under the IGN \`${ign}\`.
                                        **UID**: ${msg.member.id}
                                        
                                        However, unfortunately, I could not edit their roles (likely because one of their roles is higher than my highest).`,
                                        color: 0xff0000,
                                        footer: {
                                            text: `${new Date().toUTCString()}`
                                        }
                                    }
                                }).catch(() => console.log("> [VERIFY ERR] Failed to create a log message in verify role addition"));
                                hasFailed = true;
                            });
                        });
                        if (!hasFailed) {
                            await CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                                embed: {
                                    title: `Auto-Verification`,
                                    description: 
                                    `**User** ${msg.member.mention} just successfully verified under the IGN \`${ign}\`
                                    **UID**: ${msg.member.id}`,
                                    color: 0x5b1c80,
                                    footer: {
                                        text: `${new Date().toUTCString()}`
                                    }
                                }
                            }).catch(() => {
                                console.log("> [VERIFY ERR] Failed to create auto-verification success log message");
                            })
                            await CONSTANTS.bot.createMessage(dmChannel.id, {
                                embed: {
                                    title: "Success!",
                                    description:
                                    `Successfully verified under the IGN \`[${ign}]\``,
                                    color: 0x00ff00,
                                }
                            }).catch(() => {
                                console.log("> [VERIFY ERR] Failed to create auto-verification success dm message");
                            });
                        }
                    }
                })
            })

            setTimeout(() => {
                if (!hasCollected) CONSTANTS.bot.createMessage(dmChannel.id, `[Error]: 5 minutes have passed -- process **timed out**. Please rerun the \`.verify\` command.`);
            }, 300000);
        }
        
    })
    
}

exports.verify = verify;

//${CONFIG.SystemConfig.servers[msg.guildID].verification.minrank}
//${CONFIG.SystemConfig.servers[msg.guildID].verification.hiddenloc}

// add to server config:
/**
verification: {
    minrank: #,
    hiddenloc: bool,
}
 */
