const CONSTANTS = require("./constants");
const CONFIG = require("./config");
const RAIDCONSTANTS = require("../raiding_functions/RAIDCONSTANTS");
const ReactionHandler = require("eris-reactions");
const Eris = require("eris");
const cron = require("node-cron");

const reactions = [RAIDCONSTANTS.lhkeyReaction, RAIDCONSTANTS.vialReaction, RAIDCONSTANTS.shieldruneReaction, RAIDCONSTANTS.swordruneReaction, RAIDCONSTANTS.helmruneReaction, RAIDCONSTANTS.shatterskeyReaction, RAIDCONSTANTS.fungalkeyReaction, RAIDCONSTANTS.nestkeyReaction, RAIDCONSTANTS.legendarykeyReaction];
const fieldReactions = [
    [RAIDCONSTANTS.lhkeyReaction, RAIDCONSTANTS.vialReaction],
    [RAIDCONSTANTS.shieldruneReaction, RAIDCONSTANTS.swordruneReaction, RAIDCONSTANTS.helmruneReaction],
    [RAIDCONSTANTS.shatterskeyReaction],
    [RAIDCONSTANTS.fungalkeyReaction],
    [RAIDCONSTANTS.steamworksKeyReaction],
    [RAIDCONSTANTS.nestkeyReaction],
    [RAIDCONSTANTS.legendarykeyReaction]
]
const fields = [
    {name:`Lost Halls`, value:"\u200b"}, // ${RAIDCONSTANTS.lhkeyEmoji}${RAIDCONSTANTS.vialEmoji}
    {name:`Oryx 3`, value:"\u200b"}, // ${RAIDCONSTANTS.swordruneEmoji}${RAIDCONSTANTS.shieldruneEmoji}${RAIDCONSTANTS.helmruneEmoji}
    {name:`Shatters`, value:"\u200b"}, // ${RAIDCONSTANTS.shatterskeyEmoji}
    {name:`Fungal`, value:"\u200b"},
    {name:`Steamworks`, value:"\u200b"}, // ${RAIDCONSTANTS.fungalkeyEmoji}
    {name:`Nest`, value:"\u200b"}, // ${RAIDCONSTANTS.nestkeyEmoji}
    {name:`Miscellaneous`, value:"\u200b"}, // ${RAIDCONSTANTS.legendarykeyEmoji}
]

cron.schedule("0 * * * *", () => {
    CONSTANTS.bot.guilds.forEach(async guild => {
        if (CONFIG.SystemConfig.servers[guild.id] && CONFIG.SystemConfig.servers[guild.id].keyqueue.enabled) {
            const keyqueueMessage = await CONSTANTS.bot.getMessage(CONFIG.SystemConfig.servers[guild.id].keyqueue.channelid, CONFIG.SystemConfig.servers[guild.id].keyqueue.messageid).catch(() => {});
            await keyqueueMessage.edit({
                embed: {
                    title: keyqueueMessage.embeds[0].title,
                    description: keyqueueMessage.embeds[0].description,
                    fields: fields,
                    color: keyqueueMessage.embeds[0].color,
                    footer: keyqueueMessage.embeds[0].footer
                }
            }).catch(() => {})
            await keyqueueMessage.removeReactions().catch(() => {});
            reactions.forEach(async reaction => await keyqueueMessage.addReaction(reaction).catch(() => {}))
        }
    })
})

async function toggleKeyQueue(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return "Error: That's a premium only service.";
    CONFIG.SystemConfig.servers[msg.guildID].keyqueue.enabled = !(CONFIG.SystemConfig.servers[msg.guildID].keyqueue.enabled);
    CONFIG.updateConfig(msg.guildID);
    return `Key Queue Toggled To: \`${CONFIG.SystemConfig.servers[msg.guildID].keyqueue.enabled}\``;
}

exports.toggleKeyQueue = toggleKeyQueue;

exports.toggleKeyQueueHelpMessage = `
**Key Queue Toggle Command**

Toggles the automated key queue handling on/off.

**Usage**: \`${CONSTANTS.botPrefix}keyqueue toggle\``

async function toggleKeyPing(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return "Error: That's a premium only service.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].keyqueue.enabled) return "Error: The key queue needs to be enabled first. Run `.keyqueue toggle`."
    else if (!CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingchannel) return "Error: The ping channel needs to be set first. Run `.keyqueue setPingChannel <#channel>`.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingrole) return "Error: The ping role needs to be set first. Run `.keyqueue setPingRole <@role>`.";

    CONFIG.SystemConfig.servers[msg.guildID].keyqueue.keyping = !(CONFIG.SystemConfig.servers[msg.guildID].keyqueue.keyping);
    CONFIG.updateConfig(msg.guildID);

    return `Key Ping Toggled To: \`${CONFIG.SystemConfig.servers[msg.guildID].keyqueue.keyping}\``;
}

exports.toggleKeyPing = toggleKeyPing;

exports.toggleKeyPingHelpMessage = `
**Key Queue toggleKeyPing Command**

Toggles the automatic pinging when someone adds a key to the key queue.

**Usage**: \`${CONSTANTS.botPrefix}keyqueue toggleKeyPing\``;

async function setPingChannel(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return "Error: That's a premium only service.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].keyqueue.enabled) return "Error: The key queue needs to be enabled first. Run `.keyqueue toggle`."
    else if (!(msg.channelMentions.length > 0)) return "You need to mention a channel for that!";
    
    let pingChannel = msg.channelMentions[0];
    
    if (CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingchannel != pingChannel) {
        CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingchannel = pingChannel;
        CONFIG.updateConfig(msg.guildID);
    }

    return `Successfully set channel <#${pingChannel}> as the key ping channel.`;
}

exports.setPingChannel = setPingChannel;

exports.setPingChannelHelp = `
**Set Key Queue Ping Channel**

Sets the channel for the bot to ping in when someone adds a key to the queue.

**Usage**: \`${CONSTANTS.botPrefix}keyqueue setPingChannel <#channel>\`

**<#channel>**: A mention of the channel you would like to set for this type. To mention a channel, do <#channelID>.
`;

async function setPingRole(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return "Error: That's a premium only service.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].keyqueue.enabled) return "Error: The key queue needs to be enabled first. Run `.keyqueue toggle`."
    else if (!(msg.roleMentions.length > 0)) return "You need to mention a role for that!";
    
    let pingRole = msg.roleMentions[0];
    
    if (CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingrole != pingRole) {
        CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingrole = pingRole;
        CONFIG.updateConfig(msg.guildID);
    }

    return `Successfully set role <@&${pingRole}> as the key ping role.`;
}

exports.setPingRole = setPingRole;

exports.setPingRoleHelp = `
**Set Key Queue Ping Role**

Sets the role for the bot to ping when someone adds a key to the queue.

**Usage**: \`${CONSTANTS.botPrefix}keyqueue setPingRole <@role>\`

**<@role>**: A mention of the role you would like to set for this type. To mention a channel, do <@role>.
`;

async function setupKeyQueueMessage(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return "Error: That's a premium only service.";

    let desc = 
    `React below if you have a key you are willing to pop **within the next hour**.
    **Confim with the bot in DMs.**

    Note:
    *If you do not receive a message, ensure that your direct messages are turned on from non-friends.
    If your queue additions do not appear on the message, please re-try. If the issue persists, DM <@211959423847890945>*`;
    
    const keyQueueMessage = await msg.channel.createMessage({
        embed: {
            title: `Key Queue`,
            description: desc,
            fields: fields,
            color: 0x00ab30,
            footer: {
                icon_url: msg.guild.iconURL,
                text: "Queue resets every hour."
            }
        }
    })

    reactions.forEach(async reaction => await keyQueueMessage.addReaction(reaction))

    CONFIG.SystemConfig.servers[msg.guildID].keyqueue.messageid = keyQueueMessage.id;
    CONFIG.SystemConfig.servers[msg.guildID].keyqueue.channelid = msg.channel.id;
    CONFIG.updateConfig(msg.guildID);
    return;
}

exports.setupKeyQueueMessage = setupKeyQueueMessage;

exports.setupKeyQueueMessageHelpMessage = `
**Key Queue Setup Command**

Creates a message with every reaction added in order to set up the key queue.

**Usage**: \`${CONSTANTS.botPrefix}keyqueue setup\``

exports.keyqueueReacted = async function(msg, emoji, member) {
    // if (emoji.name == RAIDCONSTANTS.trashCan && CONFIG.SystemConfig.servers[msg.channel.guild.id].modroles.some(id => member.roles.includes(id))) {
    //     const keyqueueMessage = await msg.channel.getMessage(CONFIG.SystemConfig.servers[msg.guildID].keyqueue.messageid);
    //     await keyqueueMessage.edit({
    //         embed: {
    //             title: keyqueueMessage.embeds[0].title,
    //             description: keyqueueMessage.embeds[0].description,
    //             fields: fields,
    //             footer: keyqueueMessage.embeds[0].footer
    //         }
    //     })
    //     return CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emoji.name, member.id)
    // }
    let emojiText = emoji.id?emoji.name + ":" + emoji.id:emoji.name
    let failed = false;
    const dmChannel = await CONSTANTS.bot.getDMChannel(member.id).catch(() => {failed = true; return CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emojiText, member.id)});
    const dmMessage = await dmChannel.createMessage({
        embed: {
            title: "Key Queue Confirmation",
            description: `Would you like to begin adding <:${emojiText}> to the queue?`,
            color: 0x00ab30,
            footer: {
                text: msg.channel.guild.name, 
                icon_url: msg.channel.guild.iconURL
            }
        }
    }).catch(() => {failed = true; return CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emojiText, member.id)});
    if (failed) return;

    let dmReactionListener = new ReactionHandler.continuousReactionStream(
        dmMessage, 
        (userID) => userID.id != CONSTANTS.botID, 
        false, 
        { maxMatches: 1, time: RAIDCONSTANTS.dmReactionTimeoutLength }
    );

    let hasConfirmed = false;
    let hasMsged = false;

    dmMessage.addReaction(RAIDCONSTANTS.checkReaction);
    dmMessage.addReaction(RAIDCONSTANTS.redXReaction);

    dmReactionListener.on('reacted', async(event) => {
        if (event.emoji.name == "greenCheck") {
            hasConfirmed = true;
            const keyqueueMessage = await msg.channel.getMessage(CONFIG.SystemConfig.servers[msg.guildID].keyqueue.messageid);
            let kqembed = keyqueueMessage.embeds[0];
            if (!kqembed) return;
            let fields = kqembed.fields;

            let index = -1;
            fieldReactions.forEach((list, i) => {
                if (list.includes(emojiText)) {
                    index = i;
                    return;
                }
            })
            if (index == -1) return;
            else if (index == 5) {
                let hasPrecollected = false;

                await dmChannel.createMessage({
                    embed: {
                        description: `What kind of <:${emojiText}> are you popping?`,
                        color: 0x00ab30,
                    }
                })
    
                let precollector = new Eris.MessageCollector(dmChannel, {
                    timeout: 60000,
                    count: 1,
                    filter: function(msg) {
                        return (msg.author.id != CONSTANTS.botID);
                    }
                })
                precollector.run();

                precollector.on('collect', async(precollectorMsg) => {
                    await dmChannel.createMessage({
                        embed: {
                            description: `Please enter the number of <:${emojiText}> you are willing to pop.`,
                            color: 0x00ab30
                        }
                    })
        
                    let collector = new Eris.MessageCollector(dmChannel, {
                        timeout: 60000,
                        count: 1,
                        filter: function(msg) {
                            return (msg.author.id != CONSTANTS.botID);
                        }
                    })
                    collector.run();
        
                    collector.on('collect', async(dmMessage)=> {
                        hasMsged = true;
                        let numItems = parseInt(dmMessage.content);
                        if (isNaN(numItems) || numItems <= 0) {
                            dmChannel.createMessage({
                                embed: {
                                    description: `Error: That's not a valid **positive** integer. Please re-react on the key queue to try again.`,
                                    color: 0xff0000
                                }
                            });
                            return CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emojiText, member.id)
                        }
                        if (fields[index].value == "\u200b") fields[index].value += `<:${emojiText}> – \`${numItems} ${precollectorMsg.content}\` ${member.mention}`;
                        else fields[index].value += `\n<:${emojiText}> – \`${numItems}\` ${member.mention}`;
                        
                        keyqueueMessage.edit({
                            embed: {
                                title: kqembed.title,
                                description: kqembed.description,
                                fields: fields,
                                footer: kqembed.footer,
                                color: 0x00ab30
                            }
                        })
                        dmChannel.createMessage({
                            embed: {
                                title: "Success!",
                                description: `Added \`${numItems}\` <:${emojiText}> to the queue.`,
                                color: 0x00ab30
                            }
                        });

                        if (CONFIG.SystemConfig.servers[msg.guildID].keyqueue.keyping) {
                            let pingRole = CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingrole;

                            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingchannel,
                                `<@&${pingRole}> ${member.mention} has ${numItems} <:${emojiText}> to pop!`
                            ).catch((e) => {
                                console.log("> [ERROR SENDING KEY PING MESSAGE] " + e);

                                CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel,
                                    "Error: An error occurred while trying to send the key ping message"
                                ).catch((e) => { console.log("> [ERROR SENDING MESSAGE TO LOG CHANNEL] " + e) });
                            });
                        }
                    })   
                    setTimeout(() => {
                        if (!hasMsged) {
                            dmChannel.createMessage({
                                embed: {
                                    description: `Timed out. Please re-react to the key queue.`,
                                    color: 0xff0000
                                }
                            });
                            return CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emojiText, member.id)
                        }
                    }, 60000)
                })
                setTimeout(() => {
                    if (!hasPrecollected) {
                        dmChannel.createMessage({
                            embed: {
                                description: `Timed out. Please re-react to the key queue.`,
                                color: 0xff0000
                            }
                        });
                        return CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emojiText, member.id)
                    }
                }, 60000)
            }
            else {
                await dmChannel.createMessage({
                    embed: {
                        description: `Please enter the number of <:${emojiText}> you are willing to pop.`,
                        color: 0x00ab30
                    }
                })
    
                let collector = new Eris.MessageCollector(dmChannel, {
                    timeout: 60000,
                    count: 1,
                    filter: function(msg) {
                        return (msg.author.id != CONSTANTS.botID);
                    }
                })
                collector.run();
    
                collector.on('collect', async(dmMessage)=> {
                    hasMsged = true;
                    let numItems = parseInt(dmMessage.content);
                    if (isNaN(numItems) || numItems <= 0) {
                        dmChannel.createMessage({
                            embed: {
                                description: `Error: That's not a valid **positive** integer. Please re-react on the key queue to try again.`,
                                color: 0xff0000
                            }
                        });
                        return CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emojiText, member.id)
                    }
                    if (fields[index].value == "\u200b") fields[index].value += `<:${emojiText}> – \`${numItems}\` ${member.mention}`;
                    else fields[index].value += `\n<:${emojiText}> – \`${numItems}\` ${member.mention}`;
                    
                    keyqueueMessage.edit({
                        embed: {
                            title: kqembed.title,
                            description: kqembed.description,
                            fields: fields,
                            footer: kqembed.footer,
                            color: 0x00ab30
                        }
                    })
                    dmChannel.createMessage({
                        embed: {
                            title: "Success!",
                            description: `Added \`${numItems}\` <:${emojiText}> to the queue.`,
                            color: 0x00ab30
                        }
                    });

                    if (CONFIG.SystemConfig.servers[msg.guildID].keyqueue.keyping) {
                        let pingRole = CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingrole;

                        CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].keyqueue.pingchannel, 
                            `<@&${pingRole}> ${member.mention} has ${numItems} <:${emojiText}> to pop!`
                        ).catch((e) => {
                            console.log("> [ERROR SENDING KEY PING MESSAGE] " + e);

                            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel,
                                "Error: An error occurred while trying to send the key ping message"
                            ).catch((e) => { console.log("> [ERROR SENDING MESSAGE TO LOG CHANNEL] " + e) });
                        });
                    }
                })
                
                setTimeout(() => {
                    if (!hasMsged) {
                        dmChannel.createMessage({
                            embed: {
                                description: `Timed out. Please re-react to the key queue.`,
                                color: 0xff0000
                            }
                        });
                        return CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emojiText, member.id)
                    }
                }, 60000)
            }
        }
        else if (event.emoji.name == "redX") {
            hasConfirmed = true;
            CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emojiText, member.id);
            dmChannel.createMessage({
                embed: {
                    description: `Removed from the key queue.`,
                    color: 0xff0000
                }
            });
            return;
        }
    })

    setTimeout(() => {
        if (!hasConfirmed) {
            dmChannel.createMessage({
                embed: {
                    description: `Timed out. Please re-react to the key queue.`,
                    color: 0xff0000
                }
            });
            return CONSTANTS.bot.removeMessageReaction(msg.channel.id, msg.id, emojiText, member.id)
        }
    }, RAIDCONSTANTS.dmReactionTimeoutLength)
}
