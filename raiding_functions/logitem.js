const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const find = require("../staff_commands/find");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

async function logitem(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "You first have to configurate the server. Type \`.instructions\` for help.";

    let acceptableLogTypes = ["key", "vial", "rune"]
    let inputLogType = args.shift();
    if (!acceptableLogTypes.includes(inputLogType)) return `That is not a valid log type. Log type must be one of \`[${acceptableLogTypes.join(", ")}]\``;

    let numItems = parseInt(args.shift());
    if (isNaN(numItems) || Math.abs(numItems) > 500 || (Math.abs(numItems) > 20 && !msg.member.roles.some(id => CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(id)))) return `The number of items to log must be an integer less than 20. (Moderators can log up to 500)`;

    let found = await find.find(msg, args);
    if (!found) return;
    else if (found.length > 1) {
        let allMemberMentionsString;
        for (const member of found) {
            if (!allMemberMentionsString) allMemberMentionsString = member.mention;
            else allMemberMentionsString += ", " + member.mention; 
        }
        return {
            embed: {
                title: "User Not Found, But Similar Members Include:",
                description: allMemberMentionsString,
                color: 3145463
            }
        }
    }
    else {
        // found.length === 1;
        MongoClient.connect(process.env.DBURL, async function(err, db) {
            if (err) throw (err);
            var dbo = db.db("GalaxyRaiderDB");
            let foundEntry = (await dbo.collection("GalaxyItemLogs").findOne({UID: found[0].id, guildID: msg.guildID}));
            if (!(await foundEntry)) {
                let queryObject = {
                    UID: found[0].id,
                    guildID: msg.guildID,
                    keys: 0,
                    vials: 0,
                    runes: 0,
                    points: 0
                }
                if (numItems > 0) {
                    queryObject[`${inputLogType}s`] = numItems;
                    queryObject.points = (numItems * CONFIG.SystemConfig.servers[msg.guildID].logItemPointValues[`${inputLogType}s`]);
                }
                dbo.collection("GalaxyItemLogs").insertOne(queryObject);

                CONSTANTS.bot.createMessage(msg.channel.id, {
                    embed: {
                        title: "Item Log",
                        description: 
                        `Successfully logged ${numItems} ${inputLogType}s for ${found[0].mention}`,
                        color: 3145463
                    }
                }).catch(() => {})

                CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                    embed: {
                        title: "Item Log",
                        description: 
                        `User ${msg.member.mention} successfully logged ${numItems} ${inputLogType}s for ${found[0].mention}`,
                        color: 3145463
                    }
                }).catch(() => {})

                if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.enabled && queryObject.points >= CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.points) {
                    found[0].addRole(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.id).catch(e => {
                        console.log("> [AUTO KEY POPPER ROLE ADDITION FAILURE]" + e);
                        CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                            embed: {
                                title: "Error with Auto-Key Popper Role Assignment",
                                description: `Failed to give ${found[0].mention} the <@&${CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.id}> role`,
                                color: 0xff0000
                            }
                        }).catch(() => {})
                    });
                }
                else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.enabled && queryObject.points >= CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.points) {
                    found[0].addRole(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.id).catch(e => {
                        console.log("> [AUTO KEY POPPER ROLE ADDITION FAILURE]" + e);
                        CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                            embed: {
                                title: "Error with Auto-Key Popper Role Assignment",
                                description: `Failed to give ${found[0].mention} the <@&${CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.id}> role`,
                                color: 0xff0000
                            }
                        }).catch(() => {})
                    });
                }
                else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.enabled && queryObject.points >= CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.points) {
                    found[0].addRole(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.id).catch(e => {
                        console.log("> [AUTO KEY POPPER ROLE ADDITION FAILURE]" + e);
                        CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                            embed: {
                                title: "Error with Auto-Key Popper Role Assignment",
                                description: `Failed to give ${found[0].mention} the <@&${CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.id}> role`,
                                color: 0xff0000
                            }
                        }).catch(() => {})
                    });
                }
                else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.enabled && queryObject.points >= CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.points) {
                    found[0].addRole(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.id).catch(e => {
                        console.log("> [AUTO KEY POPPER ROLE ADDITION FAILURE]" + e);
                        CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                            embed: {
                                title: "Error with Auto-Key Popper Role Assignment",
                                description: `Failed to give ${found[0].mention} the <@&${CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.id}> role`,
                                color: 0xff0000
                            }
                        }).catch(() => {})
                    });
                }
                db.close();
            }
            else {
                let queryObject = await foundEntry;

                if (isNaN(queryObject[`${inputLogType}s`])) queryObject[`${inputLogType}s`] = 0; // reset to 0
                if (isNaN(queryObject.points)) queryObject.points = 0; // reset to 0
                
                if (queryObject[`${inputLogType}s`] < Math.abs(numItems) && numItems < 0) {
                    numItems = 0 - queryObject[`${inputLogType}s`];
                }
                queryObject[`${inputLogType}s`] += numItems;

                queryObject.points += (numItems * CONFIG.SystemConfig.servers[msg.guildID].logItemPointValues[`${inputLogType}s`]);

                dbo.collection("GalaxyItemLogs").updateOne({UID: found[0].id, guildID: msg.guildID}, {$set: queryObject});

                CONSTANTS.bot.createMessage(msg.channel.id, {
                    embed: {
                        title: "Item Log",
                        description: 
                        `Successfully logged ${numItems} ${inputLogType}s for ${found[0].mention}`,
                        color: 3145463
                    }
                }).catch(() => {});

                CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                    embed: {
                        title: "Item Log",
                        description: 
                        `User ${msg.member.mention} successfully logged ${numItems} ${inputLogType}s for ${found[0].mention}`,
                        color: 3145463
                    }
                }).catch(()=>{});

                if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.enabled && queryObject.points >= CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.points) {
                    if (!found[0].roles.includes(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.id)) found[0].addRole(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.id).catch(e => {
                        console.log("> [AUTO KEY POPPER ROLE ADDITION FAILURE]" + e);
                        CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                            embed: {
                                title: "Error with Auto-Key Popper Role Assignment",
                                description: `Failed to give ${found[0].mention} the <@&${CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.id}> role`,
                                color: 0xff0000
                            }
                        }).catch(() => {})
                    });
                }
                else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.enabled && queryObject.points >= CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.points) {
                    if (!found[0].roles.includes(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.id)) found[0].addRole(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.id).catch(e => {
                        console.log("> [AUTO KEY POPPER ROLE ADDITION FAILURE]" + e);
                        CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                            embed: {
                                title: "Error with Auto-Key Popper Role Assignment",
                                description: `Failed to give ${found[0].mention} the <@&${CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.id}> role`,
                                color: 0xff0000
                            }
                        }).catch(() => {})
                    });
                }
                else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.enabled && queryObject.points >= CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.points) {
                    if (!found[0].roles.includes(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.id)) found[0].addRole(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.id).catch(e => {
                        console.log("> [AUTO KEY POPPER ROLE ADDITION FAILURE]" + e);
                        CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                            embed: {
                                title: "Error with Auto-Key Popper Role Assignment",
                                description: `Failed to give ${found[0].mention} the <@&${CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.id}> role`,
                                color: 0xff0000
                            }
                        }).catch(() => {})
                    });
                }
                else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.enabled && queryObject.points >= CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.points) {
                    if (!found[0].roles.includes(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.id)) found[0].addRole(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.id).catch(e => {
                        console.log("> [AUTO KEY POPPER ROLE ADDITION FAILURE]" + e);
                        CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                            embed: {
                                title: "Error with Auto-Key Popper Role Assignment",
                                description: `Failed to give ${found[0].mention} the <@&${CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.id}> role`,
                                color: 0xff0000
                            }
                        }).catch(() => {})
                    });
                }
                db.close();
            }
        })
    }
}

exports.logitem = logitem;


exports.helpMessage = 
`Log Item Command
Used to log keys/runes/vials for a user. Doing this automatically updates the user's points. The number of points per logtype can be configured by an administrator.

**Usage**: \`.log <item> <number> <user>\`

**<item>**: The type of item to log, one of \`[key, vial, rune]\`

**<number>**: The number of items to log (positive or negative). Cannot exceed 20.

**<user>**: A username/nickname/id/mention that references the user somehow.

**Example**: \`.log key 3 theurul\` -> Logs 3 keys for the user with username 'theurul'. If you do not specify an ID, ensure this is the correct user!`;


async function resetitems(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else if (!(msg.mentions.length > 0)) return `Mention a user to run that command.`;
    let user = msg.mentions[0];

    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = (await dbo.collection("GalaxyItemLogs").findOne({UID: user.id, guildID: msg.guildID}));
        if (!(await foundEntry)) {
            CONSTANTS.bot.createMessage(msg.channel.id, "No entry in the item database for that user.");
            db.close();
        }
        else {
            let queryObject = await foundEntry;
            queryObject = {
                UID: queryObject.UID,
                guildID: queryObject.guildID,
                keys: 0,
                vials: 0,
                runes: 0,
                points: 0
            }

            dbo.collection("GalaxyItemLogs").updateOne({UID: user.id, guildID: msg.guildID}, {$set: queryObject});

            CONSTANTS.bot.createMessage(msg.channel.id, `Success!`);
            db.close();
        }
    })
}

exports.resetitems = resetitems;
exports.resetItemsHelpCommand = 
`Used to reset items for a member. This will wipe all keys/vials/runes/points for that member. Be cautious.

**Usage**: \`${CONSTANTS.botPrefix}resetitems <@user>\`

**<@user>** A mentioned user. To mention a user, do <@userID>`;

//Structure:
