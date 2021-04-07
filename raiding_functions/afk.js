const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const RAIDCONSTANTS = require("./RAIDCONSTANTS");
const ReactionHandler = require('eris-reactions');
const isImageURL = require('valid-image-url');
const Eris = require("eris");

exports.executeRegular = afkCheck;
exports.executeVeteran = veteranAfkCheck;
// exports.executeTest = testAfkCheck;

CONSTANTS.bot.setMaxListeners(100);

exports.COMMAND_AFKCheckFullDescription = `AFK Check Command. 
**Usage:** \`${CONSTANTS.botPrefix}afk <DungeonType> <Location> <?flags>\`

**<DungeonType>:** \`${RAIDCONSTANTS.acceptableRunTypes.join(", ")}\`

**<Location>:** The location of the raid (e.g. USSW Ogre)

**<?flags>:** optional flags:
        _- To set VC Cap, use the flag \`-cap:<channelcap>\` where \`<channelcap>\` is an integer between 0 and 99 Default cap = 65 or 35._
        _- To set VC Time Limit, use the flag \`-time:<limit>\` where \`<limit>\` is an integer number of hours from 1 to 8._
        _- To set AFK Check Image (req sheet), use the flag \`-image:<url>\` where \`<url>\` is a valid image url. To get the image url of one of our discord req sheets, right click the image and click "Copy link"._
        _– To start the AFK check in a prespecified voice channel, use the flag \`-vcid:<id>\` where \`<id>\` is the id of the voice channel you'd like to use._

Examples: 
        \`${CONSTANTS.botPrefix}afk o3 ussw ogre\` default AFK check without flags. 
        \`${CONSTANTS.botPrefix}afk o3 ussw ogre -cap:37 -time:2\` creates a channel with userlimit 37 and timelimit 2 hours.
        \`${CONSTANTS.botPrefix}afk o3 ussw ogre -image:https://tinyurl.com/stdfullskip\` starts afk with the specified image.`;

exports.COMMAND_BalerAFKCheckFullDescription = `Baler AFK Check Command. 
**Usage:** \`${CONSTANTS.botPrefix}bafk <DungeonType> <Location> <?flags>\`

**<DungeonType>:** \`${RAIDCONSTANTS.acceptableRunTypes.join(", ")}\`

**<Location>:** The location of the raid (e.g. USSW Ogre)

**<?flags>:** optional flags:
    _To set VC Cap, use the flag \`-cap:<channelcap>\` where \`<channelcap>\` is an integer between 0 and 99. Default cap = 65 or 35._
    _To set VC Time Limit, use the flag \`-time:<limit>\` where \`<limit>\` is an integer number of hours from 1 to 8._
    _To set AFK Check Image (req sheet), use the flag \`-image:<url>\` where \`<url>\` is a valid image url. **To get the image url of one of our discord req sheets, right click the image and click "Copy link".**_

Examples: 
        \`${CONSTANTS.botPrefix}bafk o3 ussw ogre\` default AFK check without flags. 
        \`${CONSTANTS.botPrefix}bafk o3 ussw ogre -cap:37 -time:2\` creates a channel with userlimit 37 and timelimit 2 hours.
        \`${CONSTANTS.botPrefix}afk o3 test -image:https://tinyurl.com/stdfullskip\` starts afk with the specified image.`;

async function afkCheck(message, args) {
    if (!CONFIG.SystemConfig.servers[message.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else return startAfk(message, args, CONFIG.SystemConfig.servers[message.guildID].channels.Main);
}

async function veteranAfkCheck(message, args) {
    if (!CONFIG.SystemConfig.servers[message.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else return startAfk(message, args, CONFIG.SystemConfig.servers[message.guildID].channels.Veteran);
}

// async function testAfkCheck(message, args) {
//     return startAfk(message, args, CHANNELS.TestRaiding);
// }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

// AFK CHECK TEMPLATE
async function startAfk(message, args, CHANNELOBJECT) {
    try {
        if (message.channel.id !== CHANNELOBJECT.RaidCommandsChannelID) return `That command can only be used in <#${CHANNELOBJECT.RaidCommandsChannelID}>`;
        else if (args.length < 2) return "You have to specify a \`DungeonType\` and a \`Location\`!";

        if (Object.values(CHANNELOBJECT).some((channelid) => !channelid || !CONSTANTS.bot.getChannel(channelid))) {
            return `One of your channels is not properly configured. Do \`.showconfig channels\` for more information.`;
        }

        let dungeonType = args.shift();
        if (!RAIDCONSTANTS.acceptableRunTypes.includes(dungeonType)) return `Acceptable Run Types: \`${RAIDCONSTANTS.acceptableRunTypes.join(", ")}\``;

        let userlimit;
        for (argument of args) {
            if (argument.startsWith("-cap:")) {
                let parseCap = argument.substring(5);
                if (isNaN(parseCap)) return "The voice cap must be an integer. e.g. -cap:20";
                else if (parseCap < 0 || parseCap > 99) return "The voice cap must be between 0 and 99";
                else {
                    userlimit = parseCap;
                    let index = args.indexOf(argument);
                    args.splice(index, 1);
                    break;
                }
            }
        }

        let timelimit;
        for (argument of args) {
            if (argument.startsWith("-time:")) {
                let parseLimit = argument.substring(6);
                if (isNaN(parseLimit)) return "The time limit must be an integer number of hours. e.g. \`-timelimit:3\` = 3 hours";
                else if (parseLimit < 1 || parseLimit > 8) return "The time limit must be between 1h and 8h";
                    timelimit = 3600000 * parseFloat(parseLimit);
                    let index = args.indexOf(argument);
                    args.splice(index, 1);
                    break;
            }
        }

        let imageurl;
        for (argument of args) {
            if (argument.startsWith("-image:")) {
                let parseImage = argument.substring(7);
                if (!await isImageURL(parseImage)) return "The image must be a valid image url. e.g. \`https://via.placeholder.com/300/09f/fff.png\`";
                else {   
                    imageurl = parseImage;
                    let index = args.indexOf(argument);
                    args.splice(index, 1);
                    break;
                }
            }
        }

        let voicechannel;
        for (argument of args) {
            if (argument.startsWith("-vcid:")) {
                let parseVc = argument.substring(6);
                if (!message.guild.channels.some(channel => (channel.id == parseVc && channel.type == 2))) return `Error: either \`${parseVc}\` is not a valid channel id, or the specified channel is not a voice channel.`;
                else {   
                    voicechannel = CONSTANTS.bot.getChannel(parseVc);
                    let index = args.indexOf(argument);
                    args.splice(index, 1);
                    break;
                }
            }
        }
        // handle non-valid flags
        for (argument of args) {
            if (argument.startsWith("-")) {
                return `Unknown flag: \`${argument}\`. Proper flags include: \`-cap:#, -time:#, -image:url, -vcid:#\``;
            }
        }

        if (!message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].modroles.includes(item))) {
            if (CHANNELOBJECT == CONFIG.SystemConfig.servers[message.guildID].channels.Main) {
                if ((dungeonType.includes("void") || dungeonType.includes("fullskip") || dungeonType.includes("fullclear") || dungeonType.includes("cult")) && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.halls.includes(item)))) {
                    return "You must have a \`Halls Leading Role\` configured with the bot to start this afk check.";
                }
                else if ((dungeonType === "o3" || dungeonType === "o3-highreqs" ) && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.oryx.includes(item)))) {
                    return "You must have a \`Oryx Leading Role\` configured with the bot to start this afk check.";
                } // Same for the other two
                else if ((dungeonType === "misc" || dungeonType === "misc-highreqs" ) && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.misc.includes(item)))) {
                    return "You must have a \`Misc Leading Role\` configured with the bot to start this afk check.";
                }
                else if ((dungeonType === "shatters" || dungeonType === "shatters-highreqs" || dungeonType === "nest" || dungeonType === "nest-highreqs" || dungeonType === "fungal" || dungeonType === "fungal-highreqs") && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.exaltation.includes(item)))) {
                    return "You must have an \`Exaltation Leading Role\` configured with the bot to start this afk check.";
                }
            }
            if (CHANNELOBJECT == CONFIG.SystemConfig.servers[message.guildID].channels.Veteran) {
                if ((dungeonType.includes("void") || dungeonType.includes("fullskip") || dungeonType.includes("fullclear") || dungeonType.includes("cult")) && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vethalls.includes(item)))) {
                    return "You must have a \`Veteran Halls Leading Role\` configured with the bot to start this afk check.";
                }
                else if ((dungeonType === "o3" || dungeonType === "o3-highreqs" ) && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetoryx.includes(item)))) {
                    return "You must have a \`Veteran Oryx Leading Role\` configured with the bot to start this afk check.";
                } // Same for the other two
                else if ((dungeonType === "misc" || dungeonType === "misc-highreqs" ) && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetmisc.includes(item)))) {
                    return "You must have a \`Veteran Misc Leading Role\` configured with the bot to start this afk check.";
                }
                else if ((dungeonType === "shatters" || dungeonType === "shatters-highreqs" || dungeonType === "nest" || dungeonType === "nest-highreqs" || dungeonType === "fungal" || dungeonType === "fungal-highreqs") && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetexaltation.includes(item)))) {
                    return "You must have an \`Veteran Exaltation Leading Role\` configured with the bot to start this afk check.";
                }
            }
        }

        

        let location = args;
        let index = RAIDCONSTANTS.acceptableRunTypes.indexOf(dungeonType);

        const raidReactionsAll = RAIDCONSTANTS.MainReactionListForRunTypes[index];
        const raidReactionsEarly = RAIDCONSTANTS.EarlyReactionlistForRunTypes[index];
        const raidReactionsEarlyCap = RAIDCONSTANTS.EarlyReactionNumberForRunTypes[index];
        // const raidMessagePing = RAIDCONSTANTS.runPing[index];

        let endRaidEventHasOccurred = false;
        let endAFKEventHasOccurred = false;

        let activeChannelPermissions = [];
        let activeChannel;

        if (voicechannel) {
            activeChannel = voicechannel;
        }
        else {
            activeChannelPermissions.push({
                id: CONFIG.SystemConfig.servers[message.guildID].suspendrole,
                type: 0,
                allow: 0,
                deny: 32507648,
            })
            activeChannelPermissions.push({
                id: message.guildID,
                type: 0,
                allow: 0,
                deny: 1049600,
            })
            if (CHANNELOBJECT == CONFIG.SystemConfig.servers[message.guildID].channels.Veteran) {
                CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(item => {
                    activeChannelPermissions.push({
                        id: item,
                        type: 0,
                        allow: 0,
                        deny: 32507648,
                    })
                })
                CONFIG.SystemConfig.servers[message.guildID].nonstaff.vetaccess.forEach(item => {
                    activeChannelPermissions.push({
                        id: item,
                        type: 0,
                        allow: 1049600, // view connect
                        deny: 31458048, // speak screenshare etc
                    })
                })
                
            }
            else { // highreqs main or regular main
                if (dungeonType.includes("highreqs")) {
                    CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(item => {
                        activeChannelPermissions.push({
                            id: item,
                            type: 0,
                            allow: 1024,
                            deny: 32506624,
                        })
                    })
                    CONFIG.SystemConfig.servers[message.guildID].nonstaff.vetaccess.forEach(item => {
                        activeChannelPermissions.push({
                            id: item,
                            type: 0,
                            allow: 1049600,
                            deny: 31458048,
                        })
                    })
                }
                else { // not highreqs
                    CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(item => {
                        activeChannelPermissions.push({
                            id: item,
                            type: 0,
                            allow: 1049600,
                            deny: 31458048
                        })
                    })
                }
                
        
                // Assign staff role permissions:
        
                CONFIG.SystemConfig.servers[message.guildID].staffroles.forEach(item => {
                    activeChannelPermissions.push({
                        id: item,
                        type: 0,
                        allow: 66070272,
                        deny: 0,
                    })
                })
                CONFIG.SystemConfig.servers[message.guildID].modroles.forEach(item => {
                    activeChannelPermissions.push({
                        id: item,
                        type: 0,
                        allow: 1610360830,
                        deny: 0,
                    })
                })
        
                activeChannelPermissions.push({
                    id: message.author.id,
                    type: 1,
                    allow: 16,
                    deny: 0
                })
            }

            activeChannel = await CONSTANTS.bot.createChannel(message.guildID, `${RAIDCONSTANTS.runTypeTitleText[index]} | ${message.member.nick?message.member.nick:message.member.username}`, 2, {
                parentID: CHANNELOBJECT.RaidCategoryID,
                userLimit: userlimit?userlimit:RAIDCONSTANTS.runTypeChannelCap[index],
                permissionOverwrites: activeChannelPermissions
            });
            while (!CONSTANTS.bot.getChannel(activeChannel.id)) await sleep(100);
            await activeChannel.editPosition(1);
        }

        
        
        let raidStatusMessage = await CONSTANTS.bot.createMessage(CHANNELOBJECT.RaidStatusChannelID, "@here"); 
        CONSTANTS.bot.editMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, {
            embed: {
                allowedMentions: {
                    everyone: true,
                },
                author: { 
                    name: `A ${RAIDCONSTANTS.runTypeTitleText[index]} run has been started in ${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run`,
                    icon_url: message.author.avatarURL
                },
                description: "To join this " + RAIDCONSTANTS.runTypeEmoji[index] + " run, **connect to the voice channel located below lounge**. \n" + RAIDCONSTANTS.AFKCheckDescriptionsForRunTypes[index], 
                image: {
                    url: imageurl?imageurl:CONFIG.SystemConfig.servers[message.guildID].defaultreqsheets[index],
                },
                color: RAIDCONSTANTS.runTypeColor[index],
                timestamp: new Date().toISOString(),
                footer: {
                    text: "AFK check will end in " + RAIDCONSTANTS.afkCheckLengthString + " • d.gg/STD ",
                    icon_url: "https://cdn.discordapp.com/attachments/751589431441490082/764948382912479252/SPACE.gif"
                }
            }
        })

        CONSTANTS.bot.createMessage(CHANNELOBJECT.LocationChannelID, `Location for ${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run: \`${location.join(" ")}\``)
        message.addReaction(RAIDCONSTANTS.checkReaction);

        let allEarlyReactedUserIDs = [];

        // This will continuously listen for 200 incoming reactions over the course of 10 minutes
        let reactionListener = new ReactionHandler.continuousReactionStream(
            raidStatusMessage, 
            (userID) => {
                return !userID.user.bot;
            },  
            false, 
            { maxMatches: 200, time: RAIDCONSTANTS.afkCheckLength }
            );

            reactionListener.on('reacted', async (event) => {
                let eventEmojiString = event.emoji.id===null?event.emoji.name:event.emoji.name + ":" + event.emoji.id;
                if (raidReactionsEarly.includes(eventEmojiString)) {
                    let reactionCap = raidReactionsEarlyCap[raidReactionsEarly.indexOf(eventEmojiString)];
                    let reactionArray = await raidStatusMessage.getReaction(eventEmojiString);
                    if (reactionArray.length > reactionCap + 1) {
                        await raidStatusMessage.removeReaction(eventEmojiString, event.userID.id);
                        return;
                    }
                    if (eventEmojiString === RAIDCONSTANTS.boosterReaction && !CONFIG.SystemConfig.servers[message.guildID].nonstaff.boosteraccess.some(item => event.userID.roles.includes(item))) {
                        await raidStatusMessage.removeReaction(eventEmojiString, event.userID.id);
                        return;
                    }
                    let dmChannel = await CONSTANTS.bot.getDMChannel(event.userID.id);
                    let a = await CONSTANTS.bot.createMessage(dmChannel.id, {
                        embed: {
                            title: message.guild.name + " Reaction Confirmation",
                            description: "Did you react with <:" + event.emoji.name + ":" + event.emoji.id + ">" + " ?", 
                            color: 4,
                            timestamp: new Date().toISOString(),
                            footer: {
                                text: "d.gg/STD",
                                icon_url: "https://cdn.discordapp.com/attachments/751589431441490082/764948382912479252/SPACE.gif"
                            }
                        }
                    });
                    await a.addReaction(RAIDCONSTANTS.checkReaction);
                    await a.addReaction(RAIDCONSTANTS.redXReaction);

                    let dmReactionListener = new ReactionHandler.continuousReactionStream(
                        a, 
                        (userID) => userID.id != CONSTANTS.botID, 
                        false, 
                        { maxMatches: 1, time: RAIDCONSTANTS.dmReactionTimeoutLength }
                    );

                    let hasConfirmed = false;
                    let hasDenied = false;

                    dmReactionListener.on('reacted', async (subevent) => {
                        if (subevent.emoji.name === "greenCheck") {
                            CONSTANTS.bot.createMessage(dmChannel.id, "Confirmed! The location is \`" + location.join(" ") + "\`");
                            hasConfirmed = true;
                        }
                        else if (subevent.emoji.name === "redX") {
                            await CONSTANTS.bot.removeMessageReaction(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, event.emoji.id===null?event.emoji.name:event.emoji.name + ":" + event.emoji.id, event.userID.id);
                            CONSTANTS.bot.createMessage(dmChannel.id, "Thank you for correcting! Reaction removed.");
                            hasDenied = true;
                        }

                        if (hasConfirmed) {
                            let member = await CONSTANTS.bot.getRESTGuildMember(message.guildID, subevent.userID.id);
                            allEarlyReactedUserIDs.push(member.id);
                            CONSTANTS.bot.createMessage(CHANNELOBJECT.EarlyReactionsLogChannelID, {
                                embed: {
                                    title: `Confirmed Reaction for ${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run`,
                                    description: member.mention + " confirmed reaction " + `<:${event.emoji.name}:${event.emoji.id}>` + " at [" + new Date().toUTCString() + "]",
                                }
                            })
                        }
                    });
                    setTimeout( async () => {
                        if (!hasConfirmed && !hasDenied) {
                            await CONSTANTS.bot.removeMessageReaction(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, event.emoji.id===null?event.emoji.name:event.emoji.name + ":" + event.emoji.id, event.userID.id);
                            CONSTANTS.bot.createMessage(dmChannel.id, "Error: Timed Out. Please re-react on the AFK check.");
                        }
                    }, RAIDCONSTANTS.dmReactionTimeoutLength);
                }
                else if ((event.userID.id == message.author.id || CONFIG.SystemConfig.servers[message.guildID].modroles.some(item => event.userID.roles.includes(item))) && event.emoji.name === "redX") {
                    endAFKEventHasOccurred = true;
                    CONSTANTS.bot.editMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, {
                        embed: {
                            author: { 
                                name: `${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run`,
                                icon_url: message.author.avatarURL
                            },
                            description: "This " + RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index] + " run has started.\nThere will be a new run up shortly.", 
                        color: RAIDCONSTANTS.runTypeColor[index],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: "d.gg/STD",
                            icon_url: "https://cdn.discordapp.com/attachments/751589431441490082/764948382912479252/SPACE.gif"
                        }

                    }
                    });
                    if (CONSTANTS.bot.getMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id)) await CONSTANTS.bot.removeMessageReactions(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id);
                    if (CONSTANTS.bot.getChannel(activeChannel.id) && !voicechannel) {
                        CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(id => {
                            activeChannel.editPermission(id, "1024", "4361028352", "role", "closed channel");
                        })
                        CONFIG.SystemConfig.servers[message.guildID].nonstaff.vetaccess.forEach(id => {
                            activeChannel.editPermission(id, "1024", "4361028352", "role", "closed channel");
                        })
                        activeChannel.editPosition(100000);
                    }
                }
            });

        let activeRaidMessage = await CONSTANTS.bot.createMessage(CHANNELOBJECT.ActiveRaidsChannelID, {
            embed: {
                author: {
                    name: `${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run`,
                    icon_url: message.author.avatarURL,
                },
                description: 
                `Click ${RAIDCONSTANTS.redXEmoji} to terminate raid. Only do this after the run has been completed, it will delete the voice channel.
                Click ${RAIDCONSTANTS.pencil} to change the location for the raid. This will DM all early reactions the new location.`, 
                color: RAIDCONSTANTS.runTypeColor[index],
                timestamp: new Date().toISOString()
            }
        })

        await activeRaidMessage.addReaction(RAIDCONSTANTS.redXReaction);
        await activeRaidMessage.addReaction(RAIDCONSTANTS.pencil);

        let endRaidListener = new ReactionHandler.continuousReactionStream(
            activeRaidMessage, 
            (userID) => userID.id == message.author.id || (CONFIG.SystemConfig.servers[message.guildID].modroles.some(item => userID.roles.includes(item)) && !userID.bot), 
            false, 
            { maxMatches: 20, time: timelimit?timelimit:RAIDCONSTANTS.endRaidTimeoutLength}
        );

        endRaidListener.on('reacted', async (endevent) => {
            if (endevent.emoji.name === "📝") {
                try {
                    CONSTANTS.bot.removeMessageReaction(CHANNELOBJECT.ActiveRaidsChannelID, activeRaidMessage.id, endevent.emoji.name, endevent.userID.id);
                    let ActiveRaidsChannel = CONSTANTS.bot.getChannel(CHANNELOBJECT.ActiveRaidsChannelID);
                    let collector = new Eris.MessageCollector(ActiveRaidsChannel, {
                        timeout: 60000,
                        count: 1,
                        filter: function(msg) {
                            return (msg.author.id == message.author.id || msg.member.roles.some(id => CONFIG.SystemConfig.servers[message.guildID].modroles.includes(id)));
                        }
                    })
                    collector.run();

                    let changelocmsg = await CONSTANTS.bot.createMessage(CHANNELOBJECT.ActiveRaidsChannelID, {
                            embed: {
                                title: "Location Change",
                                description: `Please enter the new location to forward to all early-reacted users.`,
                                color: 3145463
                            }
                    });

                    let hasChangedLoc = false;

                    collector.on("collect", (msg) => {
                        hasChangedLoc = true;
                        location = msg.content.split(" ");
                        CONSTANTS.bot.createMessage(CHANNELOBJECT.LocationChannelID, `Changed Location for ${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run:   \`${location.join(" ")}\``);

                        allEarlyReactedUserIDs.forEach(async id => {
                            let newlocDmChannel = await CONSTANTS.bot.getDMChannel(id);
                            CONSTANTS.bot.createMessage(newlocDmChannel.id, `The location for ${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run has changed to:   \`${location.join(" ")}\``);
                        })

                        if (CONSTANTS.bot.getMessage(CHANNELOBJECT.ActiveRaidsChannelID, changelocmsg.id)) CONSTANTS.bot.deleteMessage(CHANNELOBJECT.ActiveRaidsChannelID, changelocmsg.id);
                        if (CONSTANTS.bot.getMessage(CHANNELOBJECT.ActiveRaidsChannelID, msg.id)) CONSTANTS.bot.deleteMessage(CHANNELOBJECT.ActiveRaidsChannelID, msg.id);

                        CONSTANTS.bot.editMessage(CHANNELOBJECT.ActiveRaidsChannelID, activeRaidMessage.id, {
                            embed: {
                                author: {
                                    name: `${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run`,
                                    icon_url: message.author.avatarURL,
                                },
                                description: 
                                `Click ${RAIDCONSTANTS.redXEmoji} to terminate raid. Only do this after the run has been completed, it will delete the voice channel.
                                Click ${RAIDCONSTANTS.pencil} to change the location for the raid.
                                
                                Location has been set to: \`${location.join(" ")}\``, 
                                color: RAIDCONSTANTS.runTypeColor[index],
                                timestamp: new Date().toISOString()
                            }
                        })
                        collector.stop();
                    })

                    setTimeout(() => {
                        if (!hasChangedLoc) CONSTANTS.bot.createMessage(CHANNELOBJECT.ActiveRaidsChannelID, `Error: timed out. Please re-react with the pencil to change location.`);
                    }, 60000);
                }
                catch(e) {
                    CONSTANTS.bot.createMessage(CHANNELOBJECT.ActiveRaidsChannelID, `Sorry! Something went wrong with that.`);
                    console.log(e);
                }
            }




            else if (endevent.emoji.name === "redX") {
                endRaidEventHasOccurred = true;
                endAFKEventHasOccurred = true;
                if (CONSTANTS.bot.getChannel(activeChannel.id) && !voicechannel) CONSTANTS.bot.deleteChannel(activeChannel.id);
                CONSTANTS.bot.editMessage(CHANNELOBJECT.ActiveRaidsChannelID, activeRaidMessage.id, {
                    embed: {
                        title: `${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run`,
                        description: RAIDCONSTANTS.runTypeEmoji[index] + " Raid Terminated", 
                        color: RAIDCONSTANTS.runTypeColor[index],
                        timestamp: new Date().toISOString()
                    }
                });
                if (await CONSTANTS.bot.getMessage(CHANNELOBJECT.ActiveRaidsChannelID, activeRaidMessage.id)) await CONSTANTS.bot.removeMessageReactions(CHANNELOBJECT.ActiveRaidsChannelID, activeRaidMessage.id);
                CONSTANTS.bot.editMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, {
                    embed: {
                        title: `${message.member.nick?message.member.nick:message.member.username}'s AFK Check`,
                        description: "This AFK Check has now ended.", 
                    color: RAIDCONSTANTS.runTypeColor[index],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "d.gg/STD",
                        icon_url: "https://cdn.discordapp.com/attachments/751589431441490082/764948382912479252/SPACE.gif"
                    }
                }
                });
                CONSTANTS.bot.deleteMessage(message.channel.id, message.id);
                if (await CONSTANTS.bot.getMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id)) await CONSTANTS.bot.removeMessageReactions(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id);
                return;
            }
        });


        setTimeout( async() => {
            if (endRaidEventHasOccurred) return console.log(`End Raid Timeout Not Activated for ${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]}: Raid Already Ended.`);
            else {
                if (CONSTANTS.bot.getChannel(activeChannel.id) && !voicechannel) CONSTANTS.bot.deleteChannel(activeChannel.id);
                CONSTANTS.bot.editMessage(CHANNELOBJECT.ActiveRaidsChannelID, activeRaidMessage.id, {
                    embed: {
                        title: `${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} run`,
                        description: RAIDCONSTANTS.runTypeEmoji[index] + " Raid Terminated", 
                        color: RAIDCONSTANTS.runTypeColor[index],
                        timestamp: new Date().toISOString()
                    }
                });
                if (await CONSTANTS.bot.getMessage(CHANNELOBJECT.ActiveRaidsChannelID, activeRaidMessage.id)) await CONSTANTS.bot.removeMessageReactions(CHANNELOBJECT.ActiveRaidsChannelID, activeRaidMessage.id);
                if (await CONSTANTS.bot.getMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id)) CONSTANTS.bot.editMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, {
                    embed: {
                        title: `${message.member.nick?message.member.nick:message.member.username} 's AFK Check`,
                        description: "This AFK Check has now ended.", 
                    color: RAIDCONSTANTS.runTypeColor[index],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "d.gg/STD",
                        icon_url: "https://cdn.discordapp.com/attachments/751589431441490082/764948382912479252/SPACE.gif"
                    }
                }
                });
                if (await CONSTANTS.bot.getMessage(message.channel.id, message.id)) await CONSTANTS.bot.deleteMessage(message.channel.id, message.id);
                if (await CONSTANTS.bot.getMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id)) await CONSTANTS.bot.removeMessageReactions(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id);
                return;
            }
        }, timelimit?timelimit:RAIDCONSTANTS.endRaidTimeoutLength);
        
        for (j=0; j<raidReactionsAll.length; j++) {
            raidStatusMessage.addReaction(raidReactionsAll[j]);
        }


        setTimeout( async () => {
            if (endAFKEventHasOccurred) return console.log(`End AFK Timeout Not Activated for ${message.member.nick}'s ${RAIDCONSTANTS.runTypeTitleText[index]}: AFK Already Ended.`);
            else {
                CONSTANTS.bot.editMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, {
                    embed: {
                        author: { 
                            name: `${message.member.nick?message.member.nick:message.member.username} 's run`,
                            icon_url: message.author.avatarURL
                        },
                        description: "This " + RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index] + " run has started.\nThere will be a new run up shortly.", 
                        color: RAIDCONSTANTS.runTypeColor[index],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: "d.gg/STD",
                            icon_url: "https://cdn.discordapp.com/attachments/751589431441490082/764948382912479252/SPACE.gif"
                        }
                    }
                });
                if (await CONSTANTS.bot.getMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id)) await CONSTANTS.bot.removeMessageReactions(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id);
                if (CONSTANTS.bot.getChannel(activeChannel.id) && !voicechannel) {
                    CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(id => {
                        activeChannel.editPermission(id, "1024", "4361028352", "role", "closed channel");
                    })
                    CONFIG.SystemConfig.servers[message.guildID].nonstaff.vetaccess.forEach(id => {
                        activeChannel.editPermission(id, "1024", "4361028352", "role", "closed channel");
                    })
                    activeChannel.editPosition(100000);
                }
            }
        }, RAIDCONSTANTS.afkCheckLength); 
    }
    catch(e) {
        CONSTANTS.bot.createMessage(message.channel.id, "Bot reported a nonlethal error during this process. Make sure that all roles and channels are configured properly.");
        console.log(e);
    }
}





// async function logRunCheck(CHANNELOBJECT, message, index) {
//     let checkMessage = await CONSTANTS.bot.createMessage(CHANNELOBJECT.ActiveRaidsChannelID, {
//         embed: {
//             title: `Post-Raid Panel for ${message.member.nick}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
//             description:
//             `How did your run go?

//             React with ${RAIDCONSTANTS.oneemoji} if the run was a success! (Logs 1 run)
//             React with ${RAIDCONSTANTS.twoemoji} if the run was a chain! (Input # of runs)
//             React with ${RAIDCONSTANTS.threeemoji} if the run was a failure.
//             React with ${RAIDCONSTANTS.redXEmoji} if you would prefer to log the run manually!
            
//             This message will time out in 5 minutes, after which you will have to log the run manually.`,
//             color: RAIDCONSTANTS.runTypeColor[index],
//             timestamp: new Date().toISOString()
//         }
//     })

//     await checkMessage.addReaction(RAIDCONSTANTS.onereaction);
//     await checkMessage.addReaction(RAIDCONSTANTS.tworeaction);
//     await checkMessage.addReaction(RAIDCONSTANTS.threereaction);
//     await checkMessage.addReaction(RAIDCONSTANTS.redXReaction);

//     let checkMessageListener = new ReactionHandler.continuousReactionStream(
//         checkMessage, 
//         (userID) => userID.id == message.author.id || userID.roles.includes(ROLEINFO.HigherStaffRoles.AdminID) || userID.roles.includes(ROLEINFO.HigherStaffRoles.BotMakerID), 
//         false, 
//         { maxMatches: 1, time: 300000}
//     );

//     let hasConfirmed = false;

//     checkMessageListener.on('reacted', async (checkevent) => { // Success!
//         if (checkevent.emoji.name == "DONOTDELETE_1") {
//             hasConfirmed = true;
//             if (RAIDCONSTANTS.acceptableRunTypes[index] == "void" || RAIDCONSTANTS.acceptableRunTypes[index] == "void-highreqs" || RAIDCONSTANTS.acceptableRunTypes[index] == "fullskip") {
//                 if (await CONSTANTS.bot.getMessage(checkMessage.channel.id, checkMessage.id)) {
//                     await CONSTANTS.bot.editMessage(checkMessage.channel.id, checkMessage.id, {
//                         embed: {
//                             title: `Post-Raid Panel for ${message.member.nick}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
//                             description:
//                             `Logging...`,
//                             color: RAIDCONSTANTS.runTypeColor[index],
//                             timestamp: new Date().toISOString()
//                         }
//                     })
//                     await CONSTANTS.bot.removeMessageReactions(checkMessage.channel.id, checkMessage.id);
//                 }
    
//                 collector = new Eris.MessageCollector(checkMessage.channel, {
//                     timeout: 60000,
//                     count: 1,
//                     filter: function(msg) {
//                         return ((msg.author.id == message.author.id || msg.member.roles.includes(ROLEINFO.HigherStaffRoles.AdminID)) && !isNaN(msg.content));
//                     }
//                 })
//                 collector.run();
    
//                 let confirmMessage = await CONSTANTS.bot.createMessage(checkMessage.channel.id, {
//                     embed: {
//                         description: "Please enter the number of pots you hit as an integer. (e.g. \`3\`)",
//                         color: RAIDCONSTANTS.runTypeColor[index],
//                         timestamp: new Date().toISOString()
//                     }
//                 })
    
//                 collector.on("collect", async(msg) => {
//                     let value = msg.content;
//                     sql.logrun(message.member, checkMessage, true, index, 1, value);
//                     console.log("logged 1 successful run index " + index + " numruns " + 1 + " numPots " + value);
//                     hasConfirmedCollectorForNumRuns = true;
//                     if (await CONSTANTS.bot.getMessage(msg.channel.id, msg.id)) CONSTANTS.bot.deleteMessage(msg.channel.id, msg.id);
//                     if (await CONSTANTS.bot.getMessage(confirmMessage.channel.id, confirmMessage.id)) CONSTANTS.bot.deleteMessage(confirmMessage.channel.id, confirmMessage.id);
//                 })
//             }
//             else {
//                 sql.logrun(message.member, checkMessage, true, index, 1, -1);
//             }
//         }
//         else if (checkevent.emoji.name == "DONOTDELETE_2") { // Chain
//             let hasConfirmedCollectorForNumRuns = false;
//             let hasConfirmedCollectorForNumPots = false;

//             hasConfirmed = true;

//             if (await CONSTANTS.bot.getMessage(checkMessage.channel.id, checkMessage.id)) {
//                 await CONSTANTS.bot.editMessage(checkMessage.channel.id, checkMessage.id, {
//                     embed: {
//                         title: `Post-Raid Panel for ${message.member.nick}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
//                         description:
//                         `Logging...`,
//                         color: RAIDCONSTANTS.runTypeColor[index],
//                         timestamp: new Date().toISOString()
//                     }
//                 })
//                 await CONSTANTS.bot.removeMessageReactions(checkMessage.channel.id, checkMessage.id);
//             }

//             collector = new Eris.MessageCollector(checkMessage.channel, {
//                 timeout: 60000,
//                 count: 1,
//                 filter: function(msg) {
//                     return ((msg.author.id == message.author.id || msg.member.roles.includes(ROLEINFO.HigherStaffRoles.AdminID)) && !isNaN(msg.content));
//                 }
//             })
//             collector.run();

//             let confirmMessageOne = await CONSTANTS.bot.createMessage(checkMessage.channel.id, {
//                 embed: {
//                     description: "Please enter the number of runs you chained as an integer. (e.g. \`6\`)",
//                     color: RAIDCONSTANTS.runTypeColor[index],
//                     timestamp: new Date().toISOString()
//                 }
//             })

//             collector.on("collect", async(msgOne) => {
//                 let numRuns = msgOne.content;
//                 hasConfirmedCollectorForNumRuns = true;

//                 if (RAIDCONSTANTS.acceptableRunTypes[index] == "void" || RAIDCONSTANTS.acceptableRunTypes[index] == "void-highreqs" || RAIDCONSTANTS.acceptableRunTypes[index] == "fullskip") {
//                     secondCollector = new Eris.MessageCollector(checkMessage.channel, {
//                         timeout: 60000,
//                         count: 1,
//                         filter: function(msgOne) {
//                             return ((msgOne.author.id == message.author.id || msgOne.member.roles.includes(ROLEINFO.HigherStaffRoles.AdminID)) && !isNaN(msgOne.content));
//                         }
//                     })
//                     secondCollector.run();
        
//                     let confirmMessageTwo = await CONSTANTS.bot.createMessage(checkMessage.channel.id, {
//                         embed: {
//                             description: "Please enter the **total** number of pots you hit as an integer. (e.g. \`3\`)",
//                             color: RAIDCONSTANTS.runTypeColor[index],
//                             timestamp: new Date().toISOString()
//                         }
//                     })
        
//                     secondCollector.on("collect", async(msgTwo) => {
//                         let numPots = msgTwo.content;
//                         sql.logrun(message.member, checkMessage, true, index, numRuns, numPots);
//                         hasConfirmedCollectorForNumPots = true;
//                         if (await CONSTANTS.bot.getMessage(msgTwo.channel.id, msgTwo.id)) CONSTANTS.bot.deleteMessage(msgTwo.channel.id, msgTwo.id);
//                         if (await CONSTANTS.bot.getMessage(confirmMessageTwo.channel.id, confirmMessageTwo.id)) CONSTANTS.bot.deleteMessage(confirmMessageTwo.channel.id, confirmMessageTwo.id);
//                     })

//                     setTimeout( async() => {
//                         if (!hasConfirmedCollectorForNumPots) {
//                             if (await CONSTANTS.bot.getMessage(checkMessage.channel.id, checkMessage.id)) {
//                                 await CONSTANTS.bot.editMessage(checkMessage.channel.id, checkMessage.id, {
//                                     embed: {
//                                         title: `Post-Raid Panel for ${message.member.nick}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
//                                         description:
//                                         `Timed out. Please log this run manually.`,
//                                         color: RAIDCONSTANTS.runTypeColor[index],
//                                         timestamp: new Date().toISOString()
//                                     }
//                                 })
//                                 await CONSTANTS.bot.removeMessageReactions(checkMessage.channel.id, checkMessage.id);
//                             }
//                             if (await CONSTANTS.bot.getMessage(confirmMessageTwo.channel.id, confirmMessageTwo.id)) CONSTANTS.bot.deleteMessage(confirmMessageTwo.channel.id, confirmMessageTwo.id);
//                         }
//                     }, 60000)
//                 }
//                 else {
//                     sql.logrun(message.member, checkMessage, true, index, numRuns, -1);
//                 }

//                 if (await CONSTANTS.bot.getMessage(msgOne.channel.id, msgOne.id)) CONSTANTS.bot.deleteMessage(msgOne.channel.id, msgOne.id);
//                 if (await CONSTANTS.bot.getMessage(confirmMessageOne.channel.id, confirmMessageOne.id)) CONSTANTS.bot.deleteMessage(confirmMessageOne.channel.id, confirmMessageOne.id);            })

//             setTimeout( async() => {
//                 if (!hasConfirmedCollectorForNumRuns) {
//                     if (await CONSTANTS.bot.getMessage(checkMessage.channel.id, checkMessage.id)) {
//                         await CONSTANTS.bot.editMessage(checkMessage.channel.id, checkMessage.id, {
//                             embed: {
//                                 title: `Post-Raid Panel for ${message.member.nick}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
//                                 description:
//                                 `Timed out. Please log this run manually.`,
//                                 color: RAIDCONSTANTS.runTypeColor[index],
//                                 timestamp: new Date().toISOString()
//                             }
//                         })
//                         await CONSTANTS.bot.removeMessageReactions(checkMessage.channel.id, checkMessage.id);
//                     }
//                     if (await CONSTANTS.bot.getMessage(confirmMessageOne.channel.id, confirmMessageOne.id)) CONSTANTS.bot.deleteMessage(confirmMessageOne.channel.id, confirmMessageOne.id);
//                 }
//             }, 60000)
//         }
//         else if (checkevent.emoji.name == "DONOTDELETE_3") { // Failure
//             sql.logrun(message.member, checkMessage, false, index, 1, -1);
//             hasConfirmed = true;
//         }
//         else if (checkevent.emoji.name == "redX") { // Manual
//             if (await CONSTANTS.bot.getMessage(checkMessage.channel.id, checkMessage.id)) {
//                 await CONSTANTS.bot.editMessage(checkMessage.channel.id, checkMessage.id, {
//                     embed: {
//                         title: `Post-Raid Panel for ${message.member.nick}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
//                         description:
//                         `You elected to manually log this run!`,
//                         color: RAIDCONSTANTS.runTypeColor[index],
//                         timestamp: new Date().toISOString()
//                     }
//                 })
//                 await CONSTANTS.bot.removeMessageReactions(checkMessage.channel.id, checkMessage.id);
//                 hasConfirmed = true;
//             }
//         }
//     });


//     setTimeout(async () => {
//         if (!hasConfirmed) {
//             if (await CONSTANTS.bot.getMessage(checkMessage.channel.id, checkMessage.id)) {
//                 await CONSTANTS.bot.editMessage(checkMessage.channel.id, checkMessage.id, {
//                     embed: {
//                         title: `Post-Raid Panel for ${message.member.nick}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
//                         description:
//                         `Timed out. Please log this run manually.`,
//                         color: RAIDCONSTANTS.runTypeColor[index],
//                         timestamp: new Date().toISOString()
//                     }
//                 })
//                 await CONSTANTS.bot.removeMessageReactions(checkMessage.channel.id, checkMessage.id);
//             }
//         }
//     }, 300000)
// }



