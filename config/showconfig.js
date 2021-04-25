const CONSTANTS = require("./constants");
const CONFIG = require("./config");
const RAIDCONSTANTS = require("../raiding_functions/RAIDCONSTANTS");

function showConfigDefault(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**Guild Name**: \`${server.guildName}\`
            **Guild ID**: \`${server._id}\`
            **Premium**: ${server.premium?(server.premium == true?RAIDCONSTANTS.checkEmoji:RAIDCONSTANTS.redXEmoji):RAIDCONSTANTS.redXEmoji}

            **Log Channel**: <#${CONFIG.SystemConfig.servers[msg.guildID].logchannel}>
            **Suspended Role**: <@&${CONFIG.SystemConfig.servers[msg.guildID].suspendrole}>
            **Staff Roles**: [${server.staffroles.length} entries...] (do \`.showconfig staffroles\` for more)
            **Mod Roles**" [${server.modroles.length} entries...] (do \`.showconfig modroles\` for more)
            **Security Roles**: [${server.securityroles.length} entries...] (do \`.showconfig securityroles\` for more)
            **AFK Access**: (do \`.showconfig afkaccess\` for more)

            **Raid Leader Run Logging Points**: (do \`.showconfig runpoints\` for more)

            **Verification Enabled**: \`${server.verification.enabled}\`
            **Verification Star Requirement**: \`${server.verification.minrank}\`
            **Verification Hidden Loc Required?**: \`${server.verification.hiddenloc}\`

            **Member Roles**: [${server.nonstaff.memberaccess.length} entries...] (do \`.showconfig memberroles\` for more)
            **Veteran Roles**: [${server.nonstaff.vetaccess.length} entries...] (do \`.showconfig vetroles\` for more)
            **Booster Roles**: [${server.nonstaff.boosteraccess.length} entries...] (do \`.showconfig boosterroles\` for more)
            **Streaming Roles**: [${server.streamingperms.length} entries...] (do \`.showconfig streamingperms\` for more)
            **Ping Configuration**: (do \`.showconfig pings\` for more)
            **Configurated Channels**: (do \`.showconfig channels\` for more)
            **Item Logging Points**: (do \`.showconfig points\` for more)

            ${RAIDCONSTANTS.checkEmoji} **Premium Features**:

            **Weekly Quota Enabled?**: \`${server.quotaEnabled}\`
            **Quota Value**: \`${server.quotaValue}\`
            **Quota Enabled Roles**: (do \`.showconfig quotaenabledroles\` for more)
            **Quota Override Roles**: (do \`.showconfig quotaoverrideroles\` for more)

            **Auto Key Popper Role Configuration**: (do \`.showconfig keyroles\` for more)
            `,
            color: 3145463
        }
    }
}
exports.showConfigDefault = showConfigDefault;

function showConfigStaffRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**List of Staff Roles**:
            [${server.staffroles.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigStaffRoles = showConfigStaffRoles;

function showConfigModRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**List of Mod Roles**:
            [${server.modroles.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigModRoles = showConfigModRoles;

function showConfigSecurityRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**List of Security Roles**:
            [${server.securityroles.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigSecurityRoles = showConfigSecurityRoles;

async function showConfigAFKAccess(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    await CONSTANTS.bot.createMessage(msg.channel.id, {
        embed: {
            title: "Server Configuration",
            description: 
            `**AFK Access**:

            **Main Raiding**:
            Halls Configured Roles: [${server.afkaccess.halls.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Oryx Configured Roles: [${server.afkaccess.oryx.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Exaltation Dungeons Configured Roles: [${server.afkaccess.exaltation.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Miscellaneous Dungeons Configured Roles: [${server.afkaccess.misc.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463,
        }
    })
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**Veteran Raiding**:
            Halls Configured Roles: [${server.afkaccess.vethalls.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Oryx Configured Roles: [${server.afkaccess.vetoryx.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Exaltation Dungeons Configured Roles: [${server.afkaccess.vetexaltation.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Miscellaneous Dungeons Configured Roles: [${server.afkaccess.vetmisc.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            
            
            Denied Highreqs Roles: [${server.afkaccess.denyhighreqs.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]`,
            color: 3145463
        }
    }
}
exports.showConfigAFKAccess = showConfigAFKAccess;

function showConfigMemberRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**List of Member Roles**:
            [${server.nonstaff.memberaccess.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigMemberRoles = showConfigMemberRoles;

function showConfigVetRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**List of Veteran Roles**:
            [${server.nonstaff.vetaccess.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigVetRoles = showConfigVetRoles;

function showConfigBoosterRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**List of Booster Roles**:
            [${server.nonstaff.boosteraccess.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigBoosterRoles = showConfigBoosterRoles;

function showConfigChannels(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    return {
        embed: {
            title: "Server Configuration",
            description:
            `**Current Channels**

            **__Normal Raiding__**:
            Category ID: ${CONFIG.SystemConfig.servers[msg.guildID].channels.Main.RaidCategoryID}
            Raid Commands: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Main.RaidCommandsChannelID}>
            Raid Status: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Main.RaidStatusChannelID}>
            Active Raids: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Main.ActiveRaidsChannelID}>
            Location Channel: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Main.LocationChannelID}>
            Early Reactions Log Channel: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Main.EarlyReactionsLogChannelID}>

            
            **__Veteran Raiding__**:
            Category ID: ${CONFIG.SystemConfig.servers[msg.guildID].channels.Veteran.RaidCategoryID}
            Raid Commands: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Veteran.RaidCommandsChannelID}>
            Raid Status: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Veteran.RaidStatusChannelID}>
            Active Raids: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Veteran.ActiveRaidsChannelID}>
            Location Channel: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Veteran.LocationChannelID}>
            Early Reactions Log Channel: <#${CONFIG.SystemConfig.servers[msg.guildID].channels.Veteran.EarlyReactionsLogChannelID}>
            `,
            color: 3145463,
        }
    }
}

exports.showConfigChannels = showConfigChannels;

function showConfigLogItemPointValues(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    return {
        embed: {
            title: "Server Configuration",
            description:
            `**Current Item Point Values** (for item logging purposes)
            **Keys**: \`${CONFIG.SystemConfig.servers[msg.guildID].logItemPointValues.keys} points\`
            **Vials**: \`${CONFIG.SystemConfig.servers[msg.guildID].logItemPointValues.vials} points\`
            **Runes**: \`${CONFIG.SystemConfig.servers[msg.guildID].logItemPointValues.runes} points\``,
            color: 3145463
        }
    }
}

exports.showConfigLogItemPointValues = showConfigLogItemPointValues;

function showConfigRunPointValues(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    return {
        embed: {
            title: "Server Configuration",
            description:
            `**Current Run Point Values** (for run logging purposes)
            **Void**: \`${CONFIG.SystemConfig.servers[msg.guildID].runpoints.void} points\`
            **Cult**: \`${CONFIG.SystemConfig.servers[msg.guildID].runpoints.cult} points\`
            **Fullskip**: \`${CONFIG.SystemConfig.servers[msg.guildID].runpoints.fullskip} points\`
            **Shatters**: \`${CONFIG.SystemConfig.servers[msg.guildID].runpoints.shatters} points\`
            **Nest**: \`${CONFIG.SystemConfig.servers[msg.guildID].runpoints.nest} points\`
            **Fungal**: \`${CONFIG.SystemConfig.servers[msg.guildID].runpoints.fungal} points\`
            **O3**: \`${CONFIG.SystemConfig.servers[msg.guildID].runpoints.o3} points\`
            **Misc**: \`${CONFIG.SystemConfig.servers[msg.guildID].runpoints.misc} points\`
            `,
            color: 3145463
        }
    }
}

exports.showConfigRunPointValues = showConfigRunPointValues;


function showConfigQuotaEnabledRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**List of Quota-Enabled Roles**:
            [${server.quotaEnabledRoles.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigQuotaEnabledRoles = showConfigQuotaEnabledRoles;

function showConfigQuotaOverrideRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**List of Quota-Override Roles**:
            [${server.quotaOverrideRoles.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigQuotaOverrideRoles = showConfigQuotaOverrideRoles;

function showConfigStreamingRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**List of roles with Streaming permissions**:
            [${server.streamingperms.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigStreamingRoles = showConfigStreamingRoles;

function showConfigPing(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**Ping Role Configuration**:

            Void Ping: [${server.pings.void.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Cult Ping: [${server.pings.cult.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Shatters Ping: [${server.pings.shatters.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Nest Ping: [${server.pings.nest.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Fungal Ping: [${server.pings.fungal.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Oryx 3 Ping: [${server.pings.oryx3.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            Misc Ping: [${server.pings.misc.map((roleid, index) => {
                return `<@&${roleid}>`
            }).join(", ")}]
            `,
            color: 3145463
        }
    }
}
exports.showConfigPing = showConfigPing;


function showConfigKeyRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "There is no config entry for this server in the database. Type \`.config\` and try again.";
    let server = CONFIG.SystemConfig.servers[msg.guildID];
    return {
        embed: {
            title: "Server Configuration",
            description: 
            `**Key Role Configuration**:

            **Novice Tier**: ${server.keypoproles.novice.enabled?`<@&${server.keypoproles.novice.id}>\n**Required Points**: \`${server.keypoproles.novice.points}\``:`\`disabled\``}

            **Apprentice Tier**: ${server.keypoproles.apprentice.enabled?`<@&${server.keypoproles.apprentice.id}>\n**Required Points**: \`${server.keypoproles.apprentice.points}\``:`\`disabled\``}

            **Adept Tier**: ${server.keypoproles.adept.enabled?`<@&${server.keypoproles.adept.id}>\n**Required Points**: \`${server.keypoproles.adept.points}\``:`\`disabled\``}

            **Master Tier**: ${server.keypoproles.master.enabled?`<@&${server.keypoproles.master.id}>\n**Required Points**: \`${server.keypoproles.master.points}\``:`\`disabled\``}
            `,
            color: 3145463
        }
    }
}
exports.showConfigKeyRoles = showConfigKeyRoles;
