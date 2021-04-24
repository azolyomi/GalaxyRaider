const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const find = require("../staff_commands/find");
const fs = require('fs');
const path = require('path');
const cron = require("node-cron");
const GENERAL = require("../app");
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;
const { type } = require("os");

cron.schedule("0 0 * * SUN", () => {
    var guildIDs = CONSTANTS.bot.guilds.map(guild => guild.id).filter(id => CONFIG.SystemConfig.servers[id] && CONFIG.SystemConfig.servers[id].quotaEnabled);
    console.log("[QUOTA TRIGGERING] => Beginning quota guild loop");
    guildIDs.forEach(async id => {
        console.log("[QUOTA TRIGGERING] => in quota loop for guild: " + id);
        let channel = await createQuotaChannel(id);
        executeQuotaInChannel(id, channel.id);
    })
});

function setQuotaValue(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return `You must be a premium server to use quota commands.`;
    let newQuota = parseInt(args.shift());
    if (isNaN(newQuota)) return `You must enter a value to set the quota to. You entered ${newQuota}`;

    CONFIG.SystemConfig.servers[msg.guildID].quotaValue = newQuota;
    CONFIG.updateConfig(msg.guildID);

    CONSTANTS.bot.createMessage(msg.channel.id, `Successfully set the quota value to ${newQuota}`);
}

exports.setQuotaValue = setQuotaValue;

function toggleQuota(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return `You must be a premium server to use quota commands.`;

    CONFIG.SystemConfig.servers[msg.guildID].quotaEnabled = !(CONFIG.SystemConfig.servers[msg.guildID].quotaEnabled);
    CONFIG.updateConfig(msg.guildID);

    CONSTANTS.bot.createMessage(msg.channel.id, `Successfully \`${CONFIG.SystemConfig.servers[msg.guildID].quotaEnabled?"enabled":"disabled"}\` the weekly quota.`);
}
exports.toggleQuota = toggleQuota;

function editQuotaRole(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return `You must be a premium server to use quota commands.`;
    else if (!(msg.roleMentions.length > 0)) return "You must mention at least one role.";
    let acceptabletypes = ["enable", "override", "disable", "nooverride"];
    let type = args[0];
    if (!acceptabletypes.includes(type)) return `You must input an acceptable type to edit. Valid types are \`[${acceptabletypes.join(", ")}]\``
    if (type === "enable") {
        msg.roleMentions.forEach(id => {
            if (!CONFIG.SystemConfig.servers[msg.guildID].quotaEnabledRoles.includes(id)) CONFIG.SystemConfig.servers[msg.guildID].quotaEnabledRoles.push(id);
        })
        CONFIG.updateConfig(msg.guildID);
        return `Successfully enabled quota for the roles ${msg.roleMentions.map(id => `<@&${id}>`).join(", ")}.`;
    }
    else if (type === "override") {
        msg.roleMentions.forEach(id => {
            if (!CONFIG.SystemConfig.servers[msg.guildID].quotaOverrideRoles.includes(id)) CONFIG.SystemConfig.servers[msg.guildID].quotaOverrideRoles.push(id);
        })
        CONFIG.updateConfig(msg.guildID);
        return `Successfully added quota override to the roles ${msg.roleMentions.map(id => `<@&${id}>`).join(", ")}.`;
    }
    else if (type === "disable") {
        CONFIG.SystemConfig.servers[msg.guildID].quotaEnabledRoles = CONFIG.SystemConfig.servers[msg.guildID].quotaEnabledRoles.filter(id => !(msg.roleMentions.includes(id)));
        CONFIG.updateConfig(msg.guildID);
        return `Successfully disabled quota for the roles ${msg.roleMentions.map(id => `<@&${id}>`).join(", ")}.`;
    }
    else if (type === "nooverride") {
        CONFIG.SystemConfig.servers[msg.guildID].quotaOverrideRoles = CONFIG.SystemConfig.servers[msg.guildID].quotaOverrideRoles.filter(id => !(msg.roleMentions.includes(id)));
        CONFIG.updateConfig(msg.guildID);
        return `Successfully disabled quota override for the roles ${msg.roleMentions.map(id => `<@&${id}>`).join(", ")}.`;
    }
    
}

exports.editQuotaRole = editQuotaRole;
exports.editQuotaRoleHelpCommand =
`EditQuotaRole Command

**Usage**: .quotarole <type> <@roles>

**<type>**: One of \`[enable, disable, override, nooverride]\`. Specifies what to do with the mentioned quota roles.
\`enable\`: enables quota for these roles.
\`disable\`: disables quota for these roles.
\`override\`: allows this role to override quota.
\`nooverride\`: disallows this role to override quota.

**<@roles>**: A list of mentioned roles.`;

// function removeQuotaRole(msg, args) {
//     if (!CONFIG.SystemConfig.servers[msg.guildID]) {
//         return "Server is not configurated yet. Type \`.config\` to configurate it.";
//     }
//     else if (!(msg.roleMentions.length > 0)) return "You must mention at least one role.";
//     CONFIG.SystemConfig.servers[msg.guildID].quotaEnabledRoles = CONFIG.SystemConfig.servers[msg.guildID].quotaEnabledRoles.filter(id => !(msg.roleMentions.includes(id)));
//     CONFIG.updateConfig(msg.guildID);

//     CONSTANTS.bot.createMessage(msg.channel.id, `Successfully removed roles ${msg.roleMentions.map(id => `<@&${id}>`).join(", ")} from the quota.`);
// }

// exports.removeQuotaRole = removeQuotaRole;
// exports.removeQuotaRoleHelpCommand =
// `RemoveQuotaRole Command

// **Usage**: .removequotarole <@roles>

// **<@roles>**: A list of mentioned roles.`;

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
            if (++count >= membersWhoHaveQuota.length) {
                membersWhoFailedToMeetQuota = membersWhoFailedToMeetQuota.filter(object => !(object.member.roles.some(roleID => CONFIG.SystemConfig.servers[guildID].quotaOverrideRoles.includes(roleID))))
                membersWithoutDBEntry = membersWithoutDBEntry.filter(member => !(member.roles.some(roleID => CONFIG.SystemConfig.servers[guildID].quotaOverrideRoles.includes(roleID))))
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
                })
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
                dbo.collection("GalaxyRunLogs").updateMany({guildID: guildID},
                    [
                        {'$set': {
                            'previousCycle': `$currentCycle`,
                            'currentCycle': 0}
                        }
                    ]
                );
                db.close();
            }
        })
        
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




