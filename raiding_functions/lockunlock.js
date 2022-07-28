const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const RAIDCONSTANTS = require("./RAIDCONSTANTS");
const Eris = require("eris");

exports.lock = lock;
exports.unlock = unlock;

exports.COMMAND_LockFullDescription = `Lock Channel Command. 
Edits permissions of the voice channel you are **currently connected to**.
Stops non-staff from being able to join.

**Usage:** \`${CONSTANTS.botPrefix}lock\`

**Note:** You must be \`connected\` to a voice channel to use this command.
`

exports.COMMAND_UnlockFullDescription = `Unlock Channel Command. 
Edits permissions of the voice channel you are **currently connected to**.
Enables members / veterans to join the channel.

**Usage:** \`${CONSTANTS.botPrefix}lock\`

**Note:** You must be \`connected\` to a voice channel to use this command.
If you run this command in a \`veteran bot commands\` channel, it will assume you are in a \`veteran voice channel\`.
If you run this command in a \`regular bot commands\` channel, it will assume you are in a \`regular voice channel\`.
`

const getLockedVCPermissions = (message) => {
    let lockedVCPermissions = [];


    CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(id => {
        lockedVCPermissions.push({
            id: id,
            type: 0,
            allow: 1024,
            deny: 4327473664
        })
    })
    CONFIG.SystemConfig.servers[message.guildID].nonstaff.vetaccess.forEach(id => {
        lockedVCPermissions.push({
            id: id,
            type: 0,
            allow: 1024,
            deny: 4327473664
        })
    })

    return lockedVCPermissions;
}

const getUnlockedVCPermissions = (message, channel) => {
    let unlockedVCPermissions = [];

    if (channel == "vet") { // vet run
        CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(item => {
            unlockedVCPermissions.push({
                id: item,
                type: 0,
                allow: 0,
                deny: 32507648,
            })
        })
        CONFIG.SystemConfig.servers[message.guildID].nonstaff.vetaccess.forEach(item => {
            unlockedVCPermissions.push({
                id: item,
                type: 0,
                allow: 1049600, // view connect
                deny: 31458048, // speak screenshare etc
            })
        })
        
    }
    else { // main
        CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(item => {
            unlockedVCPermissions.push({
                id: item,
                type: 0,
                allow: 1049600,
                deny: 31458048
            })
        })
    }

    return unlockedVCPermissions;
}

async function lock(message, args) {
    try {
        if (!CONFIG.SystemConfig.servers[message.guildID]) {
            return "Server is not configured yet. Type \`.config\` to configurate it.";
        }
        if (!message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].staffroles.includes(role))) {
            return `You don't have the permissions to execute that command.`;
        }
    
        let channel = ""
        let mainRaidCommandsChannelID = CONFIG.SystemConfig.servers[message.guildID].channels.Main.RaidCommandsChannelID;
        let vetRaidCommandsChannelID = CONFIG.SystemConfig.servers[message.guildID].channels.Veteran.RaidCommandsChannelID
        if (message.channel.id == CONFIG.SystemConfig.servers[message.guildID].channels.Main.RaidCommandsChannelID) channel = "main";
        else if (message.channel.id == CONFIG.SystemConfig.servers[message.guildID].channels.Veteran.RaidCommandsChannelID) channel = "vet";
        else return `You must do that in a \`raid bot commands\` channel. \nUse <#${mainRaidCommandsChannelID}> for main raids, <#${vetRaidCommandsChannelID}> for veteran raids.`;
    
        if (!message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].modroles.includes(role))) {
            if (channel == "main") {
                if (!message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.halls.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.oryx.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.shatters.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.exaltation.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.misc.includes(role))) {
                    return "You must have a \`Leading Role\` or a \`Mod Role\` configured with the bot to lock this channel.";
                }
            }
            else {
                if (!message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vethalls.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetoryx.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetshatters.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetexaltation.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetmisc.includes(role))) {
                    return "You must have a \`Veteran Leading Role\` or a \`Mod Role\` configured with the bot to lock this channel.";
                }
            }
        }
        let voiceChannelID = message.member.voiceState.channelID;
        if (!voiceChannelID) return `You must be connected to a voice channel to \`lock\` that voice channel.`;
    
        CONSTANTS.bot.editChannel(voiceChannelID, {
            userLimit: 1
        })
    
        CONSTANTS.bot.createMessage(message.channel.id, "Locking voice channel. This may take a minute...")
    
        const lockedVCPermissions = getLockedVCPermissions(message);
        for (const permissionArgs of lockedVCPermissions) {
            await CONSTANTS.bot.editChannelPermission(voiceChannelID, permissionArgs.id, permissionArgs.allow, permissionArgs.deny, permissionArgs.type, "locked channel");
        }
        return `Voice channel locked.`;
    }
    catch(e) {
        console.log(e);
        return "An error occured while locking the voice channel.";
    }
}

async function unlock(message, args) {
    try {
        if (!CONFIG.SystemConfig.servers[message.guildID]) {
            return "Server is not configured yet. Type \`.config\` to configurate it.";
        }
        if (!message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].staffroles.includes(role))) {
            return `You don't have the permissions to execute that command.`;
        }
    
        let channel = ""
        let mainRaidCommandsChannelID = CONFIG.SystemConfig.servers[message.guildID].channels.Main.RaidCommandsChannelID;
        let vetRaidCommandsChannelID = CONFIG.SystemConfig.servers[message.guildID].channels.Veteran.RaidCommandsChannelID
        if (message.channel.id == CONFIG.SystemConfig.servers[message.guildID].channels.Main.RaidCommandsChannelID) channel = "main";
        else if (message.channel.id == CONFIG.SystemConfig.servers[message.guildID].channels.Veteran.RaidCommandsChannelID) channel = "vet";
        else return `You must do that in a \`raid bot commands\` channel. \nUse <#${mainRaidCommandsChannelID}> for main raids, <#${vetRaidCommandsChannelID}> for veteran raids.`;
    
        if (!message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].modroles.includes(role))) {
            if (channel == "main") {
                if (!message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.halls.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.oryx.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.shatters.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.exaltation.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.misc.includes(role))) {
                    return "You must have a \`Leading Role\` or a \`Mod Role\` configured with the bot to unlock this channel.";
                }
            }
            else {
                if (!message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vethalls.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetoryx.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetshatters.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetexaltation.includes(role))
                && !message.member.roles.some(role => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetmisc.includes(role))) {
                    return "You must have a \`Veteran Leading Role\` or a \`Mod Role\` configured with the bot to unlock this channel.";
                }
            }
        }
        let voiceChannelID = message.member.voiceState.channelID;
        if (!voiceChannelID) return `You must be connected to a voice channel to \`unlock\` that voice channel.`;
    
        CONSTANTS.bot.editChannel(voiceChannelID, {
            userLimit: 70,
        })
    
        CONSTANTS.bot.createMessage(message.channel.id, "Unlocking voice channel. This may take a minute...")
    
        const unlockedVCPermissions = getUnlockedVCPermissions(message, channel);
        for (const permissionArgs of unlockedVCPermissions) {
            await CONSTANTS.bot.editChannelPermission(voiceChannelID, permissionArgs.id, permissionArgs.allow, permissionArgs.deny, permissionArgs.type, "locked channel");
        }
        return `Voice channel unlocked.`;
    }
    catch(e) {
        console.log(e);
        return "An error occured while unlocking the voice channel.";
    }
}


    