const CONSTANTS = require("../config/constants");
const RAIDCONSTANTS = require("./RAIDCONSTANTS");
const ReactionHandler = require('eris-reactions');
const CONFIG = require("../config/config");


process.setMaxListeners(20);

exports.executeRegular = regularHeadcount;
exports.executeVeteran = veteranHeadcount;

function regularHeadcount(message, args) {
    if (!CONFIG.SystemConfig.servers[message.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else return headcount(message, args, CONFIG.SystemConfig.servers[message.guildID].channels.Main);
}

function veteranHeadcount(message, args) {
    if (!CONFIG.SystemConfig.servers[message.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else return headcount(message, args, CONFIG.SystemConfig.servers[message.guildID].channels.Veteran)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

// function testHeadcount(message, args) {
//     headcount(message, args, CHANNELS.TestRaiding)
// }


exports.COMMAND_HeadcountFullDescription = `Headcount Command. 
**Usage:** \`${CONSTANTS.botPrefix}headcount <DungeonType> <Location>\`
**<DungeonType>:** \`${RAIDCONSTANTS.acceptableRunTypes.join(", ")}\`
**<Location>:** The location to confirm runes (e.g. USSW Left Bazaar)
_Example:_ \`${CONSTANTS.botPrefix}hc o3 ussw left baz\``;

exports.COMMAND_BalerHeadcountFullDescription = `Baler Headcount Command. 
**Usage:** \`${CONSTANTS.botPrefix}bhc <DungeonType> <Location>\`
**<DungeonType>:** \`${RAIDCONSTANTS.acceptableRunTypes.join(", ")}\`
**<Location>:** The location to confirm runes (e.g. USSW Left Bazaar)
_Example:_ \`${CONSTANTS.botPrefix}bhc o3 ussw left baz\``;

// HEADCOUNT COMMAND
async function headcount(message, args, CHANNELOBJECT) {
    try {
        if (message.channel.id !== CHANNELOBJECT.RaidCommandsChannelID) return CONSTANTS.bot.createMessage(message.channel.id, "That command can only be used in designated raid bot commands channels.");
        else if (args.length < 2) return CONSTANTS.bot.createMessage(message.channel.id, "You have to specify a \`DungeonType\` and a \`Location\`!");

        if (Object.values(CHANNELOBJECT).some((channelid) => !channelid || CONSTANTS.bot.getChannel(channelid))) {
            return `One of your channels is not properly configured. Do \`.showconfig channels\` for more information.`;
        }

        let dungeonType = args.shift();
        if (!RAIDCONSTANTS.acceptableRunTypes.includes(dungeonType)) return CONSTANTS.bot.createMessage(message.channel.id, "Acceptable Run Types: "+ RAIDCONSTANTS.acceptableRunTypes.toString());


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

        // if ((dungeonType.includes("void") || dungeonType.includes("fullskip") || dungeonType.includes("fullclear") || dungeonType.includes("cult")) && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.halls.includes(item)))) {
        //     return "You must have a \`Halls Leading Role\` configured with the bot to start this headcount.";
        // }
        // else if ((dungeonType === "o3" || dungeonType === "o3-highreqs" ) && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.oryx.includes(item)))) {
        //     return "You must have a \`Oryx Leading Role\` configured with the bot to start this headcount.";
        // } // Same for the other two
        // else if ((dungeonType === "misc" || dungeonType === "misc-highreqs" ) && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.misc.includes(item)))) {
        //     return "You must have a \`Misc Leading Role\` configured with the bot to start this headcount.";
        // }
        // else if ((dungeonType === "shatters" || dungeonType === "shatters-highreqs" || dungeonType === "nest" || dungeonType === "nest-highreqs" || dungeonType === "fungal" || dungeonType === "fungal-highreqs") && !(message.member.roles.some(item => CONFIG.SystemConfig.servers[message.guildID].afkaccess.exaltation.includes(item)))) {
        //     return "You must have an \`Exaltation Leading Role\` configured with the bot to start this headcount.";
        // }

        let location = args;
        let index = RAIDCONSTANTS.acceptableRunTypes.indexOf(dungeonType);
        const raidReactionsEarly = RAIDCONSTANTS.HCReactionlistForRunTypes[index];
        const raidReactionsEarlyCap = RAIDCONSTANTS.HeadcountReactionNumberForRunTypes[index]; 

        const LeaderAsMember = await CONSTANTS.bot.getRESTGuildMember(message.guildID, message.author.id)
        let endHeadcountEventHasOccurred = false;
        let raidStatusMessage = await CONSTANTS.bot.createMessage(CHANNELOBJECT.RaidStatusChannelID, "@here"); // change to raidMessagePing 
        CONSTANTS.bot.editMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, {
            embed: {
                allowedMentions: {
                    everyone: true,
                },
                author: { 
                    name: `Headcount for ${RAIDCONSTANTS.runTypeTitleText[index]}, started by ${message.member.nick?message.member.nick:message.member.username}`,
                    icon_url: message.author.avatarURL
                },
                description: RAIDCONSTANTS.HCDescriptionsForRunTypes[index],
                color: RAIDCONSTANTS.runTypeColor[index],
                timestamp: new Date().toISOString(),
                footer: {
                    text: "Headcount will end in " + RAIDCONSTANTS.hcLengthString + " • d.gg/STD ",
                    icon_url: "https://cdn.discordapp.com/attachments/751589431441490082/764948382912479252/SPACE.gif"
                }
            }
        })
        message.addReaction(RAIDCONSTANTS.checkReaction);

        CONSTANTS.bot.createMessage(CHANNELOBJECT.ActiveRaidsChannelID, {
            embed: {
                author: {
                    name: `${message.member.nick?message.member.nick:message.member.username} started a ${RAIDCONSTANTS.runTypeTitleText[index]} headcount`,
                    icon_url: message.author.avatarURL,
                },
                color: RAIDCONSTANTS.runTypeColor[index],
                timestamp: new Date().toISOString()
            }
        })

        // This will continuously listen for 200 incoming reactions over the course of an hour
        let reactionListener = new ReactionHandler.continuousReactionStream(
            raidStatusMessage, 
            (userID) => {
                return !userID.user.bot;
            },  
            false, 
            { maxMatches: 200, time: RAIDCONSTANTS.hcTimeoutLength }
        );

        

            reactionListener.on('reacted', async (event) => {
                let eventEmojiString = (await event.emoji).id===null?event.emoji.name:event.emoji.name + ":" + event.emoji.id;
                if (raidReactionsEarly.includes(eventEmojiString)) {
                    let reactionCap = raidReactionsEarlyCap[raidReactionsEarly.indexOf(eventEmojiString)];
                    if (reactionCap === null) return;
                    let reactionArray = await raidStatusMessage.getReaction(eventEmojiString);
                    if (reactionArray.length > reactionCap + 1) {
                        return raidStatusMessage.removeReaction(eventEmojiString, event.userID.id);
                    }
                    if (eventEmojiString === RAIDCONSTANTS.boosterReaction && !(CONFIG.SystemConfig.servers[message.guildID].nonstaff.boosteraccess.filter(item => event.userID.roles.includes(item)).length > 0)) {
                        return raidStatusMessage.removeReaction(eventEmojiString, event.userID.id);
                    }
                    let dmChannel = await CONSTANTS.bot.getDMChannel(event.userID.id);
                    let a = await CONSTANTS.bot.createMessage(dmChannel.id, {
                        embed: {
                            title: message.guild.name + " Reaction Confirmation",
                            description: "Did you react with <:" + event.emoji.name + ":" + event.emoji.id + ">" + " ?", 
                            color: 4,
                            timestamp: new Date().toISOString()
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
                            let logMsg = await CONSTANTS.bot.createMessage(CHANNELOBJECT.EarlyReactionsLogChannelID, LeaderAsMember.mention);
                            CONSTANTS.bot.editMessage(CHANNELOBJECT.EarlyReactionsLogChannelID, logMsg.id, {
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
                    endHeadcountEventHasOccurred = true;
                    CONSTANTS.bot.editMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, {
                        embed: {
                            author: { 
                                name: `${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} Headcount`,
                                icon_url: message.author.avatarURL
                            },
                            description: `This ${RAIDCONSTANTS.runTypeTitleText[index]} ${RAIDCONSTANTS.runTypeEmoji[index]} headcount has ended.`, 
                        color: RAIDCONSTANTS.runTypeColor[index],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: "d.gg/STD",
                            icon_url: "https://cdn.discordapp.com/attachments/751589431441490082/764948382912479252/SPACE.gif"
                        }
                    }
                    });
                    if (await CONSTANTS.bot.getMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id)) await CONSTANTS.bot.removeMessageReactions(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id);
                    if (await CONSTANTS.bot.getMessage(message.channel.id, message.id)) await CONSTANTS.bot.deleteMessage(message.channel.id, message.id)
                }
            });
        
        for (j=0; j<raidReactionsEarly.length; j++) {
            raidStatusMessage.addReaction(raidReactionsEarly[j]);
            if (j == raidReactionsEarly.length - 1) {
                raidStatusMessage.addReaction(RAIDCONSTANTS.redXReaction);
            }
        }

        setTimeout( async () => {
            if (endHeadcountEventHasOccurred) return console.log("End Headcount Timeout Not Activated, Headcount Already Ended.");
            else {
                CONSTANTS.bot.editMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id, {
                    embed: {
                        author: { 
                            name: `${message.member.nick?message.member.nick:message.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index]} Headcount`,
                            icon_url: message.author.avatarURL
                        },
                        description: `This ${RAIDCONSTANTS.runTypeTitleText[index]} ${RAIDCONSTANTS.runTypeEmoji[index]} headcount has ended.`, 
                        color: RAIDCONSTANTS.runTypeColor[index],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: "d.gg/STD",
                            icon_url: "https://cdn.discordapp.com/attachments/751589431441490082/764948382912479252/SPACE.gif"
                        }
                    }
                });
                if (await CONSTANTS.bot.getMessage(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id)) await CONSTANTS.bot.removeMessageReactions(CHANNELOBJECT.RaidStatusChannelID, raidStatusMessage.id);
                if (await CONSTANTS.bot.getMessage(message.channel.id, message.id)) await CONSTANTS.bot.deleteMessage(message.channel.id, message.id)
            }
        }, RAIDCONSTANTS.hcTimeoutLength); 
    }
    catch(e) {
        console.log(e);
    }
}