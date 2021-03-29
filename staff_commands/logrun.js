const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const find = require("../staff_commands/find");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

//.logrun void 3

async function logrun(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    let acceptabletypes = ["void", "cult", "fullskip", "shatters", "nest", "fungal", "o3", "misc"];
    let runtype = args.shift();
    if (!acceptabletypes.includes(runtype)) return `Dungeontype must be one of \`[${acceptabletypes.join(", ")}]\``;
    let numruns = parseInt(args.shift());
    if (isNaN(numruns) || Math.abs(numruns) > 20) return `Number of runs should be an integer less than 20. You put ${numruns}`;

    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = (await dbo.collection("GalaxyRunLogs").findOne({UID: msg.author.id, guildID: msg.guildID}));
        if (!foundEntry) {
            let queryObject = {
                UID: msg.author.id,
                guildID: msg.guildID,
                void: 0,
                cult: 0,
                fullskip: 0,
                shatters: 0,
                nest: 0,
                fungal: 0,
                o3: 0,
                misc: 0,
                runpoints: 0,
                previousCycle: 0,
                currentCycle: 0
            }
            if (numruns > 0) {
                queryObject[runtype] = numruns;
                queryObject.runpoints = (numruns * CONFIG.SystemConfig.servers[msg.guildID].runpoints[runtype]);
                queryObject.currentCycle = (numruns * CONFIG.SystemConfig.servers[msg.guildID].runpoints[runtype]);
            }

            dbo.collection("GalaxyRunLogs").insertOne(queryObject);

                CONSTANTS.bot.createMessage(msg.channel.id, {
                    embed: {
                        title: "Run Log",
                        description: 
                        `Successfully logged ${numruns} ${runtype}s for ${msg.member.mention}`,
                        color: 3145463
                    }
                })

                CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                    embed: {
                        title: "Run Log",
                        description: 
                        `User ${msg.member.mention} successfully logged ${numruns} ${runtype}s`,
                        color: 3145463
                    }
                })
                db.close();
        }
        else {
            let queryObject = await foundEntry;

            if (queryObject[runtype] < Math.abs(numruns) && numruns < 0) {
                numruns = 0 - queryObject[runtype];
            }
            queryObject[runtype] += numruns;

            queryObject.runpoints += (numruns * CONFIG.SystemConfig.servers[msg.guildID].runpoints[runtype]);
            queryObject.currentCycle += (numruns * CONFIG.SystemConfig.servers[msg.guildID].runpoints[runtype]);

            dbo.collection("GalaxyRunLogs").updateOne({UID: msg.author.id, guildID: msg.guildID}, {$set: queryObject});

            CONSTANTS.bot.createMessage(msg.channel.id, {
                embed: {
                    title: "Run Log",
                    description: 
                    `Successfully logged ${numruns} ${runtype}s for ${msg.member.mention}`,
                    color: 3145463
                }
            })

            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                embed: {
                    title: "Run Log",
                    description: 
                    `User ${msg.member.mention} successfully logged ${numruns} ${runtype}s for ${msg.member.mention}`,
                    color: 3145463
                }
            })
            db.close();
        }

    })
}

exports.logrun = logrun;

exports.helpMessage = 
`Log Run Command
Used to log runs for a leader. Doing this automatically updates the user's points. The number of points per logtype can be configured by an administrator.

**Usage**: \`.logrun <type> <number> \`

**<type>**: The type of run to log, one of \`[void, cult, fullskip, shatters, nest, fungal, o3, misc]\`

**<number>**: The number of items to log (positive or negative). Cannot exceed 20.

**Example**: \`.logrun void 3\` -> Logs 3 void runs.`;

