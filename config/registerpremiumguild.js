const CONFIG = require("./config");

function registerPremiumGuildCommand(msg, args) {
    if (args[0]) return registerPremiumGuild(args[0]);
    else return registerPremiumGuild(msg.guildID);
}

function registerPremiumGuild(id) {
    if (!CONFIG.SystemConfig.servers[id]) return `That's not a guild that I've been configurated in! Ensure the ID is correct.`;
    else {
        CONFIG.SystemConfig.servers[id].premium = true;
        CONFIG.updateConfig(id);
        return `Success! Registered guild ID \`${id}\` as a premium guild!`;
    }
}

exports.registerPremiumGuildCommand = registerPremiumGuildCommand

function unregisterPremiumGuildCommand(msg, args) {
    if (args[0]) return unregisterPremiumGuild(args[0]);
    else return unregisterPremiumGuild(msg.guildID);
}

function unregisterPremiumGuild(id) {
    if (!CONFIG.SystemConfig.servers[id]) return `That's not a guild that I've been configurated in! Ensure the ID is correct.`;
    else {
        CONFIG.SystemConfig.servers[id].premium = false;
        CONFIG.updateConfig(id);
        return `Success! Unregistered guild ID \`${id}\` from being a premium guild!`;
    }
}

exports.unregisterPremiumGuildCommand = unregisterPremiumGuildCommand;

