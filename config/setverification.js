const CONFIG = require("../config/config");
const CONSTANTS = require("../config/constants");

function enableVerification(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";

    CONFIG.SystemConfig.servers[msg.guildID].verification.enabled = true;
    CONFIG.updateConfig(msg.guildID);
    return "Verification enabled.";
}

function disableVerification(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";

    CONFIG.SystemConfig.servers[msg.guildID].verification.enabled = false;
    CONFIG.updateConfig(msg.guildID);
    return "Verification disabled.";
}

function requirehiddenLoc(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";

    CONFIG.SystemConfig.servers[msg.guildID].verification.hiddenloc = true;
    CONFIG.updateConfig(msg.guildID);
    return "Hidden Location requirement enabled.";
}

function norequirehiddenLoc(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";

    CONFIG.SystemConfig.servers[msg.guildID].verification.hiddenloc = false;
    CONFIG.updateConfig(msg.guildID);
    return "Hidden Location requirement disabled.";
}

function setMinStars(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";
    let minstars = parseInt(args[0])
    if (isNaN(minstars) || minstars < 0 || minstars > 85) return `Star requirement must be an integer between 0 and 85 inclusive.`;
    CONFIG.SystemConfig.servers[msg.guildID].verification.minrank = minstars;
    CONFIG.updateConfig(msg.guildID);
    return `Star requirement set to ${minstars}`;
}

exports.disableVerification = disableVerification;
exports.enableVerification = enableVerification;
exports.requirehiddenLoc = requirehiddenLoc;
exports.norequirehiddenLoc = norequirehiddenLoc;
exports.setMinStars = setMinStars;




function verification(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";

    let server = CONFIG.SystemConfig.servers[msg.guildID];

    return {
        embed: {
            title: "Verification Information",
            description: 
            `**Verification Enabled**: \`${server.verification.enabled}\`
            **Verification Star Requirement**: \`${server.verification.minrank}\`
            **Verification Hidden Loc Required?**: \`${server.verification.hiddenloc}\`
            
            
            Subcommands:
            
            **${CONSTANTS.botPrefix}verification enable**: Enables bot auto-verification.
            **${CONSTANTS.botPrefix}verification disable**: Disables bot auto-verification.
            **${CONSTANTS.botPrefix}verification enablehiddenloc**: Enables requirement for hidden location during bot auto-verification.
            **${CONSTANTS.botPrefix}verification disablehiddenloc**: Disables requirement for hidden location during bot auto-verification.
            **${CONSTANTS.botPrefix}verification requirement <#>**: Sets the star requirement for auto-verification.`,
            color: 3145463,
        }
    }
}

exports.verification = verification;