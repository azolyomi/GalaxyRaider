const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const find = require("../staff_commands/find");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

async function logrun(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    
    let acceptabletypes = ["void", "cult", "fullskip", "shatters", "nest", "fungal", "steamworks", "o3", "misc"];
    let runtype = args.shift();
    if (!acceptabletypes.includes(runtype)) return `Dungeontype must be one of \`[${acceptabletypes.join(", ")}]\``;
    let numruns = parseInt(args.shift());
    if (isNaN(numruns) || Math.abs(numruns) > 1000 || numruns == 0 ||(Math.abs(numruns) > 20 && !msg.member.roles.some(id => CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(id)))) return `Number of runs should be a nonzero integer less than 20. (Moderators can log up to 1000). You put \`${numruns}\``;
    let memberToLogFor = msg.member;
    if (msg.mentions.length > 0 && msg.member.roles.some(id => CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(id))) {
        memberToLogFor = msg.mentions[0];
    }
    logrun_programmatically(memberToLogFor, msg.channel.id, msg.guildID, runtype, numruns, msg.member);
}

async function logrun_programmatically(memberToLogFor, channelID, guildID, runtype, numruns, memberLogging = memberToLogFor) {
    MongoClient.connect(process.env.DBURL, {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = (await dbo.collection("GalaxyRunLogs").findOne({UID: memberToLogFor.id, guildID: guildID}));
        if (!(await foundEntry)) {
            let queryObject = {
                UID: memberToLogFor.id,
                guildID: guildID,
                void: 0,
                cult: 0,
                fullskip: 0,
                shatters: 0,
                nest: 0,
                fungal: 0,
                steamworks: 0,
                o3: 0,
                misc: 0,
                runpoints: 0,
                previousCycle: 0,
                currentCycle: 0
            }
            if (numruns > 0) {
                queryObject[runtype] = numruns;
                queryObject.runpoints = (numruns * CONFIG.SystemConfig.servers[guildID].runpoints[runtype]);
                queryObject.currentCycle = (numruns * CONFIG.SystemConfig.servers[guildID].runpoints[runtype]);
            }
    
            await dbo.collection("GalaxyRunLogs").insertOne(queryObject);
    
            CONSTANTS.bot.createMessage(channelID, {
                embed: {
                    title: "Run Log",
                    description: 
                    `Successfully logged ${numruns} ${runtype}s for ${memberToLogFor.mention}`,
                    color: 3145463
                }
            })
    
            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[guildID].logchannel, {
                embed: {
                    title: "Run Log",
                    description: 
                    `User ${memberLogging.mention} successfully logged ${numruns} ${runtype}s for ${memberToLogFor.mention}`,
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
    
            queryObject.runpoints += (numruns * CONFIG.SystemConfig.servers[guildID].runpoints[runtype]);
            queryObject.currentCycle += (numruns * CONFIG.SystemConfig.servers[guildID].runpoints[runtype]);
    
            await dbo.collection("GalaxyRunLogs").updateOne({UID: memberToLogFor.id, guildID: guildID}, {$set: queryObject});
    
            CONSTANTS.bot.createMessage(channelID, {
                embed: {
                    title: "Run Log",
                    description: 
                    `Successfully logged ${numruns} ${runtype}s for ${memberToLogFor.mention}`,
                    color: 3145463
                }
            })
    
            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[guildID].logchannel, {
                embed: {
                    title: "Run Log",
                    description: 
                    `User ${memberLogging.mention} successfully logged ${numruns} ${runtype}s for ${memberToLogFor.mention}`,
                    color: 3145463
                }
            })
            db.close();
        }
    })
}

exports.logrun = logrun;
exports.logrun_programmatically = logrun_programmatically;

exports.helpMessage = 
`Log Run Command
Used to log runs for a leader. Doing this automatically updates the user's points. The number of points per logtype can be configured by an administrator.

**Usage**: \`.logrun <type> <number> \`

**<type>**: The type of run to log, one of \`[void, cult, fullskip, shatters, nest, fungal, steamworks, o3, misc]\`

**<number>**: The number of items to log (positive or negative). Cannot exceed 20.

**Example**: \`.logrun void 3\` -> Logs 3 void runs.`;

async function resetruns(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else if (!(msg.mentions.length > 0)) return `Mention a user to run that command.`;
    let user = msg.mentions[0];

    MongoClient.connect(process.env.DBURL, {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = (await dbo.collection("GalaxyRunLogs").findOne({UID: user.id, guildID: msg.guildID}));
        if (!(await foundEntry)) {
            CONSTANTS.bot.createMessage(msg.channelID, "No entry in the run database for that user.");
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
                steamworks: 0,
                o3: 0,
                misc: 0,
                runpoints: 0,
                previousCycle: 0,
                currentCycle: 0
            }

            await dbo.collection("GalaxyRunLogs").updateOne({UID: user.id, guildID: msg.guildID}, {$set: queryObject});

            CONSTANTS.bot.createMessage(msg.channelID, `Success!`);
            db.close();
        }
    })
}

exports.resetruns = resetruns;
exports.resetRunsHelpCommand = 
`Used to reset runs for a staff member. This will reset all runs and current/previous/alltime points for that user. Be cautious.

**Usage**: \`${CONSTANTS.botPrefix}resetruns <@user>\`

**<@user>** A mentioned user. To mention a user, do <@userID>`;

