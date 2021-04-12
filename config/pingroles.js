const CONSTANTS = require("./constants");
const CONFIG = require("./config");
const RAIDCONSTANTS = require("../raiding_functions/RAIDCONSTANTS");

function addPingRole(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!(msg.roleMentions.length > 0)) return "You need to mention at least one role for that!";

    let pingtype = args[0]
    let acceptablepingtypes = ["void", "cult", "shatters", "nest", "fungal", "oryx3", "misc"];

    if (!acceptablepingtypes.includes(pingtype)) return `You must specify which type of run this role will be pinged for. Acceptable types: \`${acceptablepingtypes.join(", ")}\``;

    msg.roleMentions.forEach(id => {
        if (!CONFIG.SystemConfig.servers[msg.guildID].pings[pingtype].includes(id)) CONFIG.SystemConfig.servers[msg.guildID].pings[pingtype].push(id);
    })

    CONFIG.updateConfig(msg.guildID);
    return `Successfully added ${msg.roleMentions.map(id => `<@&${id}>`).join(", ")} to the bot's list of \`${pingtype}\` pinged roles.`;
}

function deletePingRole(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!(msg.roleMentions.length > 0)) return "You need to mention at least one role for that!";

    let pingtype = args[0]
    let acceptablepingtypes = ["void", "cult", "shatters", "nest", "fungal", "oryx3", "misc"];

    if (!acceptablepingtypes.includes(pingtype)) return `You must specify which type of run this role will have the ping removed for. Acceptable types: \`${acceptablepingtypes.join(", ")}\``;

    msg.roleMentions.forEach(id => {
        CONFIG.SystemConfig.servers[msg.guildID].pings[pingtype] = CONFIG.SystemConfig.servers[msg.guildID].pings[pingtype].filter(roleid => roleid != id);
    })

    CONFIG.updateConfig(msg.guildID);
    return `Successfully removed ${msg.roleMentions.map(id => `<@&${id}>`).join(", ")} from the bot's list of \`${pingtype}\` pinged roles.`;
}

exports.addPingRole = addPingRole;
exports.deletePingRole = deletePingRole;

exports.helpCommand = 
`Ping Role Command
Used to either \`add\` or \`remove\` a role from a ping type.

Available ping types: \`${["void", "cult", "shatters", "nest", "fungal", "oryx3", "misc"].join(", ")}\`

Use the command \`.pingrole add <pingtype> <@roles>\` to enable pings in that \`<pingtype>\` for mentioned \`<@roles>\`
Use the command \`.pingrole remove <pingtype> <@roles>\` to disable pings in that \`<pingtype>\` for mentioned \`<@roles>\``;

function pingReacted(msg, member, emoji, added) {
    if (RAIDCONSTANTS.whitebagEmoji.includes(emoji.id)) {
        CONFIG.SystemConfig.servers[msg.guildID].pings.void.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
        CONFIG.SystemConfig.servers[msg.guildID].pings.cult.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
        CONFIG.SystemConfig.servers[msg.guildID].pings.shatters.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
        CONFIG.SystemConfig.servers[msg.guildID].pings.nest.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
        CONFIG.SystemConfig.servers[msg.guildID].pings.fungal.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
        CONFIG.SystemConfig.servers[msg.guildID].pings.oryx3.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
        CONFIG.SystemConfig.servers[msg.guildID].pings.misc.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
    }
    else if (RAIDCONSTANTS.voidEmoji.includes(emoji.id)) {
        CONFIG.SystemConfig.servers[msg.guildID].pings.void.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
    }
    else if (RAIDCONSTANTS.malusEmoji.includes(emoji.id)) {
        CONFIG.SystemConfig.servers[msg.guildID].pings.cult.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
    }
    else if (RAIDCONSTANTS.shattersPortalEmoji.includes(emoji.id)) {
        CONFIG.SystemConfig.servers[msg.guildID].pings.shatters.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
    }
    else if (RAIDCONSTANTS.nestPortalEmoji.includes(emoji.id)) {
        CONFIG.SystemConfig.servers[msg.guildID].pings.nest.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
    }
    else if (RAIDCONSTANTS.fungalPortalEmoji.includes(emoji.id)) {
        CONFIG.SystemConfig.servers[msg.guildID].pings.fungal.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
    }
    else if (RAIDCONSTANTS.sanctuaryPortalEmoji.includes(emoji.id)) {
        CONFIG.SystemConfig.servers[msg.guildID].pings.oryx3.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
    }
    else if (RAIDCONSTANTS.legendarykeyEmoji.includes(emoji.id)) {
        CONFIG.SystemConfig.servers[msg.guildID].pings.misc.forEach(async id => {
            try {
                added?member.addRole(id, "ping assignment"):(await CONSTANTS.bot.getRESTGuildMember(msg.guildID, member)).removeRole(id, "ping assignment");
            }
            catch(e) {}
        })
    }
}
exports.pingReacted = pingReacted;

async function setupPingMessage(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    
    let pingmessagedescription = 
    `**__Important Information__**
    **All AFK checks will ping @here.**
    If you want to **only be pinged for selected runs**, you have to turn off the @here pings and only enable role pings. (Right click server -> notification settings -> disable @everyone and @here, but enable role pings)
    If the role you reacted with is not given to you within a few minutes, **unreact and re-react to it**. 
    If you want to disable pings for a certain run type, **unreact from it.**
    
    React with the ${RAIDCONSTANTS.whitebagEmoji} if you would like to be pinged for \`all\` runs.\n`;
    let pingreactions = [RAIDCONSTANTS.whitebagReaction];

    if (CONFIG.SystemConfig.servers[msg.guildID].pings.void.length > 0) {
        pingmessagedescription += `React with the ${RAIDCONSTANTS.voidEmoji} if you would like to be pinged for \`void\` runs.\n`;
        pingreactions.push(RAIDCONSTANTS.voidReaction);
    }
    if (CONFIG.SystemConfig.servers[msg.guildID].pings.cult.length > 0) {
        pingmessagedescription += `React with the ${RAIDCONSTANTS.malusEmoji} if you would like to be pinged for \`cult\` runs.\n`;
        pingreactions.push(RAIDCONSTANTS.malusReaction);
    }
    if (CONFIG.SystemConfig.servers[msg.guildID].pings.shatters.length > 0) {
        pingmessagedescription += `React with the ${RAIDCONSTANTS.shattersPortalEmoji} if you would like to be pinged for \`shatters\` runs.\n`;
        pingreactions.push(RAIDCONSTANTS.shattersPortalReaction);
    }
    if (CONFIG.SystemConfig.servers[msg.guildID].pings.nest.length > 0) {
        pingmessagedescription += `React with the ${RAIDCONSTANTS.nestPortalEmoji} if you would like to be pinged for \`nest\` runs.\n`;
        pingreactions.push(RAIDCONSTANTS.nestPortalReaction);
    }
    if (CONFIG.SystemConfig.servers[msg.guildID].pings.fungal.length > 0) {
        pingmessagedescription += `React with the ${RAIDCONSTANTS.fungalPortalEmoji} if you would like to be pinged for \`fungal cavern\` runs.\n`;
        pingreactions.push(RAIDCONSTANTS.fungalPortalReaction);
    }
    if (CONFIG.SystemConfig.servers[msg.guildID].pings.oryx3.length > 0) {
        pingmessagedescription += `React with the ${RAIDCONSTANTS.sanctuaryPortalEmoji} if you would like to be pinged for \`oryx 3\` runs.\n`;
        pingreactions.push(RAIDCONSTANTS.sanctuaryPortalReaction);
    }
    if (CONFIG.SystemConfig.servers[msg.guildID].pings.misc.length > 0) {
        pingmessagedescription += `React with the ${RAIDCONSTANTS.legendarykeyEmoji} if you would like to be pinged for \`miscellaneous\` runs.\n`;
        pingreactions.push(RAIDCONSTANTS.legendarykeyReaction);
    }

    let pingmessage = await CONSTANTS.bot.createMessage(msg.channel.id, {
        embed: {
            title: "Ping Assignment",
            description: pingmessagedescription,
            color: 0x0000CD,
        }
    });

    pingreactions.forEach(reaction => {
        pingmessage.addReaction(reaction);
    })

    CONFIG.SystemConfig.servers[msg.guildID].pings.pingmessageid = pingmessage.id;
    CONFIG.updateConfig(msg.guildID);
    return `Success!`;
}

exports.setupPingMessage = setupPingMessage

exports.setupPingMessageHelpCommand = 
`Setup Ping Message Command

Used to create a bot message with reactions that assigns ping roles to users who react to their icons.
_Note: You must first setup the ping roles before running this command. Do \`.help pingrole\` for more information._

This command will:

**1**: Create a ping assignment message (only adds reactions for ping types you have configured)
**2**: Adds all necessary reactions to the message
**3**: Stores this message in the bot database.

If the ping message/channel is ever deleted, you must re-run this command.`;

exports.pingmessagedeleted = function(message) {
    delete CONFIG.SystemConfig.servers[message.guildID].pings.pingmessageid;
    CONFIG.updateConfig(message.guildID);
}