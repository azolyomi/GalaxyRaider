const CONSTANTS = require('./config/constants');
const CONFIG = require('./config/config');
const accessRole = require('./config/accessRole');
const initialize = require("./config/initializeServerProperties");
const afk_check = require("./raiding_functions/afk");
const headcount = require("./raiding_functions/hc");
const makevc = require("./raiding_functions/makevc");
const showconfig = require("./config/showconfig");
const instructions = require("./config/instructions");
const find = require("./staff_commands/find");
const accessChannel = require('./config/accessChannel');
const say = require("./staff_commands/say");
const deleteGuildConfig = require("./config/deleteGuildConfig");
const suspend = require("./staff_commands/suspend");
const suspendlist = require("./staff_commands/suspendlist");
const log = require("./raiding_functions/logitem");
const changereqsheet = require("./raiding_functions/changereqsheet");
const getinfo = require("./staff_commands/getinfo");
const setpoints = require("./config/setpoints");
const leaderboard = require("./staff_commands/leaderboard");
const manualverify = require("./staff_commands/manualverify");

const leaveguild = require("./config/leaveguild");

CONSTANTS.bot.registerCommand("ping", function(msg, args) {
    return {
        embed: {
            title: "Pong!",
            timestamp: new Date().toISOString(),
        }
    }
}, {
    aliases: ["pingy", "online"],
    argsRequired: false,
    description: `Ping Command. Checks if bot is online.`,
})

CONSTANTS.bot.registerCommand("instructions", instructions.showInstructions, {
    aliases: ["setup", "howto"],
    argsRequired: false,
    description: `Detailed instructions for bot setup. [Your average help guide :)]`,
    requirements: {
        permissions: {
            "administrator": true,
        }
    }
    
})



//SEPARATOR: <LEADING>

CONSTANTS.bot.registerCommand("makevc", makevc.execute, {
    aliases: ["mkvc", "makevoice", "makevoicechannel"],
    argsRequired: true,
    description: `Make Voice Channel Command. Use this when you are chaining, and don't want to ping for a new AFK.`,
    fullDescription: makevc.COMMAND_MkVcFullDescription
})

CONSTANTS.bot.registerCommand("afk", afk_check.executeRegular, {
    aliases: ["afkcheck", "startafk"],
    argsRequired: true,
    description: `AFK Check Command.`,
    fullDescription: afk_check.COMMAND_AFKCheckFullDescription,
})

CONSTANTS.bot.registerCommand("vetafk", afk_check.executeVeteran, {
    aliases: ["vafkcheck", "vafk"],
    argsRequired: true,
    description: `AFK Check Command.`,
    fullDescription: afk_check.COMMAND_AFKCheckFullDescription,
    permissionMessage: "You need to have a \`Veteran Leader Role\` that is configured with the bot!"
})

CONSTANTS.bot.registerCommand("headcount", headcount.executeRegular, {
    aliases: ["hc"],
    argsRequired: true,
    description: `Headcount Command.`,
    fullDescription: headcount.COMMAND_HeadcountFullDescription,
})

CONSTANTS.bot.registerCommand("vetheadcount", headcount.executeVeteran, {
    aliases: ["vhc", "vethc"],
    argsRequired: true,
    fullDescription: headcount.COMMAND_BalerHeadcountFullDescription,
    permissionMessage: "You need to have a \`Veteran Leading Role\` configured with the bot!!"
})

//SEPARATOR: <CONFIG>

CONSTANTS.bot.registerCommand("config", initialize.execute, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Initial configuration of server."
})

CONSTANTS.bot.registerCommand("reconfig", initialize.reconfig, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: 
    `Reconfiguration of server, only use this for full bot reset.

    Note: DOING THIS WILL DELETE ALL PREVIOUS BOT-CREATED CHANNELS AND ALL ASSIGNED STAFF ROLES.
    To avoid deletion of desired staff roles, first unregister them with \`.removeAccessRole all <@roles>\``
})

const showconfigcommand = CONSTANTS.bot.registerCommand("showconfig", showconfig.showConfigDefault, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current configuration of server.",
})

showconfigcommand.registerSubcommand("staffroles", showconfig.showConfigStaffRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Staff roles configurated in bot server.",
    aliases: ["staff", "sr"],
})

showconfigcommand.registerSubcommand("modroles", showconfig.showConfigModRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Moderator roles configurated in bot server.",
    aliases: ["admin", "mod"],
})

showconfigcommand.registerSubcommand("securityroles", showconfig.showConfigSecurityRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Security roles configurated in bot server.",
    aliases: ["security"],
})

showconfigcommand.registerSubcommand("memberroles", showconfig.showConfigMemberRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Member roles configurated in bot server.",
    aliases: ["member"],
})

showconfigcommand.registerSubcommand("vetroles", showconfig.showConfigVetRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Veteran roles configurated in bot server.",
    aliases: ["vet"],
})

showconfigcommand.registerSubcommand("boosterroles", showconfig.showConfigBoosterRoles, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Booster roles configurated in bot server.",
    aliases: ["booster"],
})

showconfigcommand.registerSubcommand("afkaccess", showconfig.showConfigAFKAccess, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current AFK Access setup configurated in bot server.",
    aliases: ["aa", "afk", "leaders", "rl"],
})

showconfigcommand.registerSubcommand("channels", showconfig.showConfigChannels, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Channels setup configurated in bot server.",
    aliases: ["c", "channel"],
})

showconfigcommand.registerSubcommand("points", showconfig.showConfigLogItemPointValues, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: "Print current Point Values configurated in bot server (for item logging purposes)",
    aliases: ["pts", "dotlog"],
})

CONSTANTS.bot.registerCommand("changereqsheet", changereqsheet.changereqsheet, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: changereqsheet.helpMessage,
    aliases: ["crs", "changereqs"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("setpoints", setpoints.setPoints, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    }, 
    caseInsensitive: true,
    fullDescription: setpoints.helpMessage,
    aliases: ["setpts"],
    argsRequired: true
})




//SEPARATOR: <ACCESS>

const accessRoleCommand = CONSTANTS.bot.registerCommand("accessRole", accessRole.accessStaff, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["roleAccess"],
    fullDescription: accessRole.accessHelp,
    argsRequired: true,
});

const removeAccessRoleCommand = CONSTANTS.bot.registerCommand("removeAccessRole", accessRole.removeAccessStaff, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["removeRoleAccess"],
    fullDescription: accessRole.removeAccessHelp,
    argsRequired: true,
});

accessRoleCommand.registerSubcommand("member", accessRole.accessMember, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["m"],
    fullDescription: accessRole.accessMemberHelp,
    argsRequired: true,
});

removeAccessRoleCommand.registerSubcommand("member", accessRole.removeAccessMember, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["m"],
    fullDescription: accessRole.removeAccessMemberHelp,
    argsRequired: true,
});

accessRoleCommand.registerSubcommand("vet", accessRole.accessVet, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["veteran", "v", "vet"],
    fullDescription: accessRole.accessVeteranHelp,
    argsRequired: true,
});

removeAccessRoleCommand.registerSubcommand("vet", accessRole.removeAccessVet, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["veteran", "v", "vet"],
    fullDescription: accessRole.removeAccessVeteranHelp,
    argsRequired: true
});

accessRoleCommand.registerSubcommand("booster", accessRole.accessBooster, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["b", "booster", "boost"],
    fullDescription: accessRole.accessBoosterHelp,
    argsRequired: true
});

removeAccessRoleCommand.registerSubcommand("booster", accessRole.removeAccessBooster, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["b", "booster", "boost"],
    fullDescription: accessRole.removeAccessBoosterHelp,
    argsRequired: true
});

const changeChannelCommand = CONSTANTS.bot.registerCommand("changeChannel", accessChannel.changeChannel, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["cc", "accessChannel"],
    fullDescription: accessChannel.helpMessage,
    argsRequired: true
})

CONSTANTS.bot.registerCommand('setSuspendRole', accessRole.setSuspendRole, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["setsuspend", "setsuspensionrole"],
    fullDescription: 
    `Set Suspend Role Command. 
    This role is used to interface with \`.suspend\` and \`.unsuspend\` commands.
    
    **Usage**: \`.setsuspendrole <@role>\`
    
    **<@role>**: A mention of the role to set as the Suspended role.`,
    argsRequired: true
})

CONSTANTS.bot.registerCommand('setLogChannel', accessChannel.setLogChannel, {
    requirements: {
        permissions: {
            "administrator": true,
        }
    },
    caseInsensitive: true,
    aliases: ["setlog", "setlogs"],
    fullDescription: 
    `Set Log Channel Command. 
    This channel is where all server-related bot logs are sent.
    
    **Usage**: \`.setlogchannel <#channel>\`
    
    **<#channel>**: A mention of the channel to set as the log channel. To mention a channel, type <#channelID>.`,
    argsRequired: true
})

//SEPARATOR: <RESET>

// CONSTANTS.bot.registerCommand("reset", async function(msg, args) {
//     let guildID = msg.guildID;
//     let channels = await CONSTANTS.bot.getRESTGuildChannels(guildID);

//     channels.forEach(function(channel, index) {
//         if (channel.id != 820808926471651348) {
//             CONSTANTS.bot.deleteChannel(channel.id);
//             setTimeout(() => {}, 50);
//         }
//     })

//     setTimeout(() => {
//         CONSTANTS.bot.createChannel(guildID, "test-commands");
//     }, 1000);

//     let roles = await(CONSTANTS.bot.getRESTGuildRoles(guildID));

//     roles.forEach(function(role, index) {
//         if (role.name.includes("Bot") || role.name.includes("Suspended")) CONSTANTS.bot.deleteRole(guildID, role.id);
//     })
// }, {
//     requirements: {
//         permissions: {
//             "administrator": true,
//         }
//     }
// })

//SEPARATOR: <MODERATION>

CONSTANTS.bot.registerCommand("find", find.execute, {
    aliases: ["finduser", "getuser", "fetchuser"],
    argsRequired: true,
    description: `Find Command. For more info, do ${CONSTANTS.botPrefix}help find`,
    fullDescription: find.COMMAND_FindFullDescription,
})


const saycommand = CONSTANTS.bot.registerCommand("say", (msg, args) => {
    if (args.length === 0) return "Specify a message";
    const text = args.join(" ");
    return text;
}, {
    description: "Make the bot say something!",
    fullDescription: "The bot will say whatever the user puts after the command label",
    usage: "<text>",
    deleteCommand: true,
    caseInsensitive: true,
    argsRequired: true,
});

saycommand.registerSubcommand("-e", say.dashe, {
    caseInsensitive: true,
    deleteCommand: true,
    description: "Say some embedded text!",
    fullDescription: 
        `**Usage**: \`${CONSTANTS.botPrefix}say -e <message>\` OR \`${CONSTANTS.botPrefix}say -e ?flags\`.
        **Flags:** usage: \`-<flag>:"<parameter>"\`.
                **title**: specify the title of the embed message. \`-title:"..."\`
                **description**: specify the description of the embed message. \`-description:"..."\`
                **color**: specify the color of the embed message. Accepts hexcode value and some plaintext colors. \`-color:"0xABCDEF"\`
                **image**: provide an image for the embed. Needs to be valid url form. \`-image:...\` (NO QUOTATIONS)
            **You must specify at least a title or description flag.**
            _If you specify flags, you CANNOT specify a message body. If using flags, ONLY use flags._
        _Examples_: 
            \`${CONSTANTS.botPrefix}say -e Hey everybody!\` => _bot says the message "Hey everybody_"
            \`${CONSTANTS.botPrefix}say -e -title:"Weenis"\` => _bot sends an embed with the title "weenis"_.
            \`${CONSTANTS.botPrefix}say -e -title:"Weenis" -description:"I have a large one" -color:"magenta"\` => 
                _bot sends an embed with the title "weenis", description "I have a large one" and color "magenta"._`,
    argsRequired: true,
})

CONSTANTS.bot.registerCommand("suspend", suspend.suspend, {
    caseInsensitive: true,
    fullDescription: suspend.suspendHelp,
    aliases: ["s", "sus"],
    argsRequired: true
});
CONSTANTS.bot.registerCommand("unsuspend", suspend.unsuspend, {
    caseInsensitive: true,
    fullDescription: suspend.unsuspendHelp,
    aliases: ["us", "unsus"],
    argsRequired: true
});

CONSTANTS.bot.registerCommand("suspendlist", suspendlist.suspendList, {
    caseInsensitive: true,
    fullDescription: suspendlist.helpMessage,
    aliases: ["sl", "suspendl"],
    argsRequired: false
});

CONSTANTS.bot.registerCommand("log", log.logitem, {
    caseInsensitive: true,
    fullDescription: log.helpMessage,
    aliases: ["l", "logitem"],
    argsRequired: true
});

CONSTANTS.bot.registerCommand("getinfo", getinfo.getInfo, {
    caseInsensitive: true,
    fullDescription: getinfo.helpMessage,
    aliases: ["gi", "get"],
    argsRequired: true
})

CONSTANTS.bot.registerCommand("leaderboard", leaderboard.leaderboard, {
    caseInsensitive: true,
    fullDescription: 
    `Leaderboard Command
    Used to get the top 10 people from the item log database, organized by type.
    
    **Usage**: \`.leaderboard <type>\`
    
    **<type>**: One of \`[keys, vials, runes]\`. Default organizes by points.
    
    **Example**: \`.leaderboard runes\` -> Prints out the top 10 users, in decreasing order of number of runes logged.`,
    aliases: ["lb", "top"],
    argsRequired: false
})

CONSTANTS.bot.registerCommand("mv", manualverify.manualVerify, {
    caseInsensitive: true,
    fullDescription: manualverify.helpMessage,
    aliases: ["manualverify"],
    argsRequired: true
})








//SEPARATOR: <HELP>



const helpCommand = CONSTANTS.bot.registerCommand("help", function(msg, args) {
    if (args.length > 0) {
        let result = "";
        let cur = CONSTANTS.bot.commands[CONSTANTS.bot.commandAliases[args[0]] || args[0]];
        if(!cur) {
            return "Help Command not found";
        }
        let {label} = cur;
        for(let i = 1; i < args.length; ++i) {
            cur = cur.subcommands[cur.subcommandAliases[args[i]] || args[i]];
            if(!cur) {
                return "Help Command not found";
            }
            label += ` ${cur.label}`;
        }
        result += `**${msg.prefix}${label}** ${cur.usage}\n${cur.fullDescription}`;
        if(cur.aliases.length > 0) {
            result += `\n\n**Aliases:** ${cur.aliases.join(", ")}`;
        }
        const subcommands = Object.keys(cur.subcommands);
        if(subcommands.length > 0) {
            result += "\n\n**Subcommands:**";
            for(const subLabel of subcommands) {
                if(cur.subcommands.hasOwnProperty(subLabel) && cur.subcommands[subLabel].permissionCheck(msg)) {
                    result += `\n  **${subLabel}** - ${cur.subcommands[subLabel].description}`;
                }
            }
        }
        return {
            embed: {
                description: `${result}`,
                color: 3145463
            }
        }
    }
    else return {
                embed: {
                    title: "Available Commands:",
                    description: 
                    `__**Setup Commands:**__ (Administrator Only)
                    **${CONSTANTS.botPrefix}instructions** – Detailed instructions for bot setup
                    **${CONSTANTS.botPrefix}config // ${CONSTANTS.botPrefix}reconfig** – Initial configuration / reconfiguration of server in database. Use reconfiguration carefully
                    **${CONSTANTS.botPrefix}showconfig** – Show the current server configuration

                    **${CONSTANTS.botPrefix}accessrole** – Add bot privileges to roles
                    **${CONSTANTS.botPrefix}removeaccessrole** – Remove bot privileges from roles
                    **${CONSTANTS.botPrefix}changechannel** – Change a default text channel 
                    **${CONSTANTS.botPrefix}changereqsheet** – Change the default req sheet posted for a given AFK check
                    **${CONSTANTS.botPrefix}setsuspendrole** – Change the 'suspended' role for bot use
                    **${CONSTANTS.botPrefix}setlogchannel** – Change the log channel for bot use.
                    **${CONSTANTS.botPrefix}setpoints** – Set the default point values associated with keys/vials/runes

                    __**System Commands:**__
                    **${CONSTANTS.botPrefix}ping** – Check if the bot is online
                    **${CONSTANTS.botPrefix}say** – Make the bot speak
                    **${CONSTANTS.botPrefix}leaderboard** – Get leaderboard
        
                    __**Moderation Commands:**__
                    **${CONSTANTS.botPrefix}find** – Find a user from name or ID
                    **${CONSTANTS.botPrefix}suspend** – Suspend a user
                    **${CONSTANTS.botPrefix}unsuspend** – Unsuspend a user
                    **${CONSTANTS.botPrefix}suspendlist** – Get a list of currently suspended users
                    **${CONSTANTS.botPrefix}mv** – Manually verify a user.
        
                    __**Raid Leader Commands:**__
                    **${CONSTANTS.botPrefix}hc** – Start a headcount
                    **${CONSTANTS.botPrefix}afk** – Start an AFK check
                    **${CONSTANTS.botPrefix}makevc** – Create a voice channel
                    **${CONSTANTS.botPrefix}log** – Log a key/vial/rune for a user
                    
                    **${CONSTANTS.botPrefix}vethc** – Start a **Veteran** headcount 
                    **${CONSTANTS.botPrefix}vetafk** – Start a **Veteran** AFK check
        
                    Do ${CONSTANTS.botPrefix}help <command> for more information on that command.
                    `,
                    color: 3145463
                }
        }    
})


CONSTANTS.bot.registerCommand("leaveguild", leaveguild.leaveGuild, {
    requirements: {
        custom: function(msg) {
            return msg.author.id == "211959423847890945";
        }
    },
    argsRequired: true,
    hidden: true,
    permissionMessage: false,
})

exports.guildCache = {};

CONSTANTS.bot.on("error", console.log);
CONSTANTS.bot.on("disconnect", console.log);
CONSTANTS.bot.on("guildRoleDelete", function(guild, role) {
    if (role.id) CONFIG.deleteGuildRole(guild, role);
})
CONSTANTS.bot.on("channelDelete", function(channel) {
    if (channel.id) CONFIG.deleteChannel(channel);
})
CONSTANTS.bot.on("guildDelete", function(guild) {
    deleteGuildConfig.deleteGuildConfig(guild.id);
})

CONSTANTS.bot.on("ready", () => {
    console.log("Discord Bot Ready!");
    CONSTANTS.botID = CONSTANTS.bot.user.id;
    CONSTANTS.bot.editStatus("online", {
        name: ".instructions for setup!"
    });
})


CONSTANTS.bot.connect();

setInterval(() => {
    CONSTANTS.bot.guilds.forEach(async guild => {
        exports.guildCache[guild.id] = await guild.fetchMembers()
    })
}, 1800000);

// TODO
// MONGO DB ->
// add specific permissions for suspend 

