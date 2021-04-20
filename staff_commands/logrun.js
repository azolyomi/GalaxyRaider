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
    if (isNaN(numruns) || Math.abs(numruns) > 1000 || (Math.abs(numruns) > 20 && !msg.member.roles.some(id => CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(id)))) return `Number of runs should be an integer less than 20. (Moderators can log up to 1000). You put ${numruns}`;
    let userID = msg.author.id;
    if (msg.mentions.length > 0 && msg.member.roles.some(id => CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(id))) userID = msg.mentions[0].id;

    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = (await dbo.collection("GalaxyRunLogs").findOne({UID: userID, guildID: msg.guildID}));
        if (!(await foundEntry)) {
            let queryObject = {
                UID: userID,
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
                    `Successfully logged ${numruns} ${runtype}s for ${msg.mentions.length > 0?msg.mentions[0].mention:msg.member.mention}`,
                    color: 3145463
                }
            })

            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                embed: {
                    title: "Run Log",
                    description: 
                    `User ${msg.member.mention} successfully logged ${numruns} ${runtype}s for ${msg.mentions.length > 0?msg.mentions[0].mention:msg.member.mention}`,
                    color: 3145463
                }
            })
            db.close();
        }
        else {
            let queryObject = await foundEntry;
            if (isNaN(queryObject[runtype])) queryObject[runtype] = 0; // reset to 0
            if (isNaN(queryObject.runpoints)) queryObject.runpoints = 0; // reset to 0
            if (isNaN(queryObject.previousCycle)) queryObject.previousCycle = 0; // reset to 0
            if (isNaN(queryObject.currentCycle)) queryObject.currentCycle = 0; // reset to 0

            if (queryObject[runtype] < Math.abs(numruns) && numruns < 0) {
                numruns = 0 - queryObject[runtype];
            }
            queryObject[runtype] += numruns;

            queryObject.runpoints += (numruns * CONFIG.SystemConfig.servers[msg.guildID].runpoints[runtype]);
            queryObject.currentCycle += (numruns * CONFIG.SystemConfig.servers[msg.guildID].runpoints[runtype]);

            dbo.collection("GalaxyRunLogs").updateOne({UID: userID, guildID: msg.guildID}, {$set: queryObject});

            CONSTANTS.bot.createMessage(msg.channel.id, {
                embed: {
                    title: "Run Log",
                    description: 
                    `Successfully logged ${numruns} ${runtype}s for ${msg.mentions.length > 0?msg.mentions[0].mention:msg.member.mention}`,
                    color: 3145463
                }
            })

            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                embed: {
                    title: "Run Log",
                    description: 
                    `User ${msg.member.mention} successfully logged ${numruns} ${runtype}s for ${msg.mentions.length > 0?msg.mentions[0].mention:msg.member.mention}`,
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

async function resetruns(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else if (!(msg.mentions.length > 0)) return `Mention a user to run that command.`;
    let user = msg.mentions[0];

    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = (await dbo.collection("GalaxyRunLogs").findOne({UID: user.id, guildID: msg.guildID}));
        if (!(await foundEntry)) {
            CONSTANTS.bot.createMessage(msg.channel.id, "No entry in the run database for that user.");
            db.close();
        }
        else {
            let queryObject = await foundEntry;
            queryObject = {
                UID: queryObject.UID,
                guildID: queryObject.guildID,
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

            dbo.collection("GalaxyRunLogs").updateOne({UID: user.id, guildID: msg.guildID}, {$set: queryObject});

            CONSTANTS.bot.createMessage(msg.channel.id, `Success!`);
            db.close();
        }
    })
}

exports.resetruns = resetruns;
exports.resetRunsHelpCommand = 
`Used to reset runs for a staff member. This will reset all runs and current/previous/alltime points for that user. Be cautious.

**Usage**: \`${CONSTANTS.botPrefix}resetruns <@user>\`

**<@user>** A mentioned user. To mention a user, do <@userID>`;

