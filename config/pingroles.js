const CONSTANTS = require("./constants");
const CONFIG = require("./config");

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