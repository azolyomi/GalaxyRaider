const CONFIG = require("../config/config");

function togglePostRaidPanel(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return "You must be a premium server to use this feature."

    CONFIG.SystemConfig.servers[msg.guildID].postraidpanelenabled = !CONFIG.SystemConfig.servers[msg.guildID].postraidpanelenabled;
    CONFIG.updateConfig(msg.guildID);
    return {
        embed: {
            title: "Success!",
            description: `Post-Raid Logging is now \`${CONFIG.SystemConfig.servers[msg.guildID].postraidpanelenabled?"enabled":"disabled"}\``,
            color: 3145463
        }
    }
}

exports.togglePostRaidPanel = togglePostRaidPanel;

exports.helpMessage = 
`Toggle Post-Raid Panel Command
Used to toggel whether post-raid run logging is enabled.`;