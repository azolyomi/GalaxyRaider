const Eris = require('eris');
const CONFIG = require("./config");
require('pluris')(Eris);
require('dotenv').config();



// Bot Setup:
const botPrefix = ".";
const botToken = process.env.BOT_TOKEN;

const clientOptions = {
    allowedMentions: {
        everyone: true,
        roles: true,
        users: true
    },
    intents: [
        "guilds",
        "guildMembers", 
        "guildBans",
        "guildEmojis",
        "guildIntegrations",
        "guildWebhooks",
        "guildInvites",
        "guildVoiceStates",
        "guildPresences",
        "guildMessages",
        "guildMessageReactions",
        "guildMessageTyping",
        "directMessages",
        "directMessageReactions",
        "directMessageTyping",
    ],
    restMode: true,
    getAllUsers: true //without this events might not fire until the user does something else
};

const commandOptions = {
    defaultHelpCommand: false,
    description: "Multi-purpose ROTMG Raiding Bot",
    owner: "Theurul",
    prefix: botPrefix,
    defaultCommandOptions: {
        caseInsensitive: true,
        guildOnly: true,
        permissionMessage: "You don't have the permissions to execute that command.",
        requirements: {
            custom: function(msg) {
                if (!CONFIG.SystemConfig.servers[msg.guildID]) {
                    bot.createMessage(msg.channel.id, "The bot has not been configurated in this server yet. Type .instructions to get started.")
                    return false;
                }
                else return (msg.member.roles.some((role, index) => CONFIG.SystemConfig.servers[msg.guildID].staffroles.includes(role)));
            }
        }
    }
}

const bot = new Eris.CommandClient(botToken, clientOptions, commandOptions);

exports.bot = bot;
exports.botID = "784842269378609152";
exports.botCommandOptions = commandOptions;
exports.botPrefix = botPrefix;
const STDGuildID = `522815906376843274`;
exports.STDGuildID = STDGuildID;
exports.STDNitroPrefix = `^`;

exports.defaultCredits = 5;

exports.permissionModeratorOnly = function(msg) {
    if (!msg.guildID) return false;
    else if (!CONFIG.SystemConfig.servers[msg.guildID]) return false;
    else if (!(CONFIG.SystemConfig.servers[msg.guildID].modroles.some(id => msg.member.roles.includes(id)))) return false;
    else return true;
}

exports.permissionTheurulOnly = function(msg) {
    return (msg.author.id == "211959423847890945");
}

