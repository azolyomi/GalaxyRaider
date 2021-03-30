const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const find = require("../staff_commands/find");
const fs = require('fs');
const path = require('path');
const cron = require("node-cron");
const GENERAL = require("../app");
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

// var task = cron.schedule("0 0 * * SUN", () => {
//     var guildIDs = CONSTANTS.bot.guilds.map(guild => guild.id).filter(id => CONFIG.SystemConfig.servers[id].quotaEnabled);
//     guildIDs.forEach(async id => {
        // let channel = await createQuotaChannel(id);
//         executeQuotaInChannel(id, channel.id);
//     })
// });
function setQuotaValue(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    let newQuota = parseInt(args.shift());
    if (isNaN(newQuota)) return `You must enter a value to set the quota to. You entered ${newQuota}`;

    CONFIG.SystemConfig.servers[msg.guildID].quotaValue = newQuota;
    CONFIG.updateConfig(msg.guildID);

    CONSTANTS.bot.createMessage(msg.channel.id, `Successfully set the quota value to ${newQuota}`);
}

exports.setQuotaValue = setQuotaValue;
exports.setQuotaHelpCommand =
`SetQuota Command

**Usage**: .setquota <value>

**<value>**: An integer number of points.`;

function addQuotaRole(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else if (!(msg.roleMentions.length > 0)) return "You must mention at least one role.";
    msg.roleMentions.forEach(id => {
        CONFIG.SystemConfig.servers[msg.guildID].quotaEnabledRoles.push(id);
    })
    CONFIG.updateConfig(msg.guildID);

    CONSTANTS.bot.createMessage(msg.channel.id, `Successfully added roles ${msg.roleMentions.map(id => `<@&${id}>`).join(", ")} to the quota.`);
}

exports.addQuotaRole = addQuotaRole;
exports.addQuotaRoleHelpCommand =
`AddQuotaRole Command

**Usage**: .addquotarole <@roles>

**<@roles>**: A list of mentioned roles.`;

function removeQuotaRole(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else if (!(msg.roleMentions.length > 0)) return "You must mention at least one role.";
    CONFIG.SystemConfig.servers[msg.guildID].quotaEnabledRoles = CONFIG.SystemConfig.servers[msg.guildID].quotaEnabledRoles.filter(id => !(msg.roleMentions.includes(id)));
    CONFIG.updateConfig(msg.guildID);

    CONSTANTS.bot.createMessage(msg.channel.id, `Successfully removed roles ${msg.roleMentions.map(id => `<@&${id}>`).join(", ")} from the quota.`);
}

exports.removeQuotaRole = removeQuotaRole;
exports.removeQuotaRoleHelpCommand =
`RemoveQuotaRole Command

**Usage**: .removequotarole <@roles>

**<@roles>**: A list of mentioned roles.`;

async function executeQuotaInChannel(guildID, quotaChannelID) {
    let guildMembers = await (await CONSTANTS.bot.getRESTGuild(guildID)).fetchMembers();
    let membersWhoHaveQuota = guildMembers.filter(member => member.roles.some(roleID => CONFIG.SystemConfig.servers[guildID].quotaEnabledRoles.includes(roleID)));
    let membersWhoFailedToMeetQuota = [];
    let membersWithoutDBEntry = [];
    MongoClient.connect(process.env.DBURL, function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        var count = 0;
        membersWhoHaveQuota.forEach(async member => {
            let foundEntry = await dbo.collection("GalaxyRunLogs").findOne({UID: member.id, guildID: guildID});
            if (!foundEntry) membersWithoutDBEntry.push(member);
            else if (foundEntry.currentCycle < CONFIG.SystemConfig.servers[guildID].quotaValue) {
                    // didn't meet quota value in current cycle
                    membersWhoFailedToMeetQuota.push({
                        member: member,
                        points: foundEntry.currentCycle
                    });
            }
            count++;
            if (count === membersWhoHaveQuota.length) {
                membersWhoFailedToMeetQuota.forEach(object => {
                    CONSTANTS.bot.createMessage(quotaChannelID, {
                        embed: {
                            title: "User Failed to Meet Quota",
                            description: 
                            `The user <@${object.member.id}> failed to meet quota.
                            They had \`${object.points}\` points this week.`,
                            color: 3145463,
                        }
                    });
                    membersWithoutDBEntry.forEach(member => {
                        CONSTANTS.bot.createMessage(quotaChannelID, {
                            embed: {
                                title: "User Hasn't Led Runs",
                                description: 
                                `The user <@${member.id}> has a role which is configured for quota, but has not led any runs this week.`,
                                color: 3145463,
                            }
                        });
                    })
                })
            }
        })
        dbo.collection("GalaxyRunLogs").updateMany({guildID: guildID},
            [
                {'$set': {
                    'previousCycle': '$currentCycle',
                    'currentCycle': 0}
                }
            ]
        );
        db.close();
    })
}
exports.executeQuotaFromDiscordCommand = async function(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return `Server hasn't been configurated yet. Type \`.config\` to configure.`;
    let channel = await createQuotaChannel(msg.guildID);
    executeQuotaInChannel(msg.guildID, channel.id);
}

async function createQuotaChannel(guildID) {
    let overwrites = [{
        id: guildID,
        type: 0,
        allow: 0,
        deny: 1024
    }];
    CONFIG.SystemConfig.servers[guildID].modroles.forEach(id => {
        overwrites.push({
            id: id,
            type: 0,
            allow: 523344,
            deny: 0
        })
    })
    let channel = await CONSTANTS.bot.createChannel(guildID, `Quota-${new Date().toUTCString()}`, 0, {
        permissionOverwrites: overwrites
    });
    return channel;
}




