const CONFIG = require("./config");

function deleteGuildConfigFromDiscord(msg, args) {
    let guildID = args[0];
    return deleteGuildConfig(guildID);
}

function deleteGuildConfig(guildID) {
    if (!CONFIG.SystemConfig.servers[guildID]) return "That guild ID does not exist in the database.";
    else {
        delete CONFIG.SystemConfig.servers[guildID];
        CONFIG.updateConfig(guildID);
        return `Successfully deleted ${guildID} from the bot's config database.`;
    }
}

exports.deleteGuildConfig = deleteGuildConfig;
exports.deleteGuildConfigFromDiscord = deleteGuildConfigFromDiscord;