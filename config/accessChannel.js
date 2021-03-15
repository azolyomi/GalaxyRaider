const CONSTANTS = require("./constants");
const CONFIG = require("./config");

function changeChannel(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!(msg.channelMentions.length > 0)) return "You need to mention a channel for that!";
    else if (msg.channelMentions.length > 1) return "You can only mention one channel at a time for that!";

    let acceptableChannelTypes = (Object.keys(CONFIG.SystemConfig.servers[msg.guildID].channels.Main).concat(Object.keys(CONFIG.SystemConfig.servers[msg.guildID].channels.Veteran).map(item => `vet${item}`)));

    let channelToChange;
    args.some(item => {
        if (acceptableChannelTypes.includes(item)) {
            channelToChange = item;
            return true;
        }
    })

    if (!channelToChange) return `Target channel type must be one of the following: \`${acceptableChannelTypes.join(", ")}\``;
    
    if (channelToChange.startsWith("vet")) {
        channelToChange = channelToChange.substring(3);
        CONFIG.SystemConfig.servers[msg.guildID].channels.Veteran[channelToChange] = msg.channelMentions[0];
        CONFIG.updateConfig(msg.guildID);
        return `Successfully set channel <#${msg.channelMentions[0]}> as the ${channelToChange} for bot access.`;
    }
    else {
        CONFIG.SystemConfig.servers[msg.guildID].channels.Main[channelToChange] = msg.channelMentions[0];
        CONFIG.updateConfig(msg.guildID);
        return `Successfully set channel <#${msg.channelMentions[0]}> as the ${channelToChange} for bot access.`;
    }
}
exports.changeChannel = changeChannel;

function setLogChannel(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!(msg.channelMentions.length > 0)) return "You need to mention a channel for that!";
    
    let logchannel = msg.channelMentions[0];
    if (CONFIG.SystemConfig.servers[msg.guildID].logchannel != logchannel) CONFIG.SystemConfig.servers[msg.guildID].logchannel = logchannel;

    CONFIG.updateConfig(msg.guildID);
    return `Successfully set channel <#${logchannel}> as the Logging Channel for the bot.`;
}
exports.setLogChannel = setLogChannel;

const helpMessageDefaultChannelArray = [
    'RaidCategoryID',
    'RaidCommandsChannelID',
    'RaidStatusChannelID',
    'ActiveRaidsChannelID',
    'LocationChannelID',
    'EarlyReactionsLogChannelID',
    'vetRaidCategoryID',
    'vetRaidCommandsChannelID',
    'vetRaidStatusChannelID',
    'vetActiveRaidsChannelID',
    'vetLocationChannelID',
    'vetEarlyReactionsLogChannelID'
]

exports.helpMessage = 
`Change Channel Command (\`Administrator\`)
Links a specific channel to bot raiding functionality. Only one channel can be linked to any functionality, this command will override defaults.
(Ex: linking a RaidStatusChannelID will make all bot messages meant for the raid status channel go to the specified channel)

**Usage**: \`.changeChannel <#channel> <type>\`

**<#channel>**: A mention of the channel you would like to set for this type. To mention a channel, do <#channelID>.

**<type>**: The channel type you wish to set this channel to. One of \`${helpMessageDefaultChannelArray.join(", ")}\`

**Example**: \`.changeChannel <#channelid> RaidStatusChannelID\` -> will set the bot's stored raid status channel to this ID.
`;