const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const RAIDCONSTANTS = require("./RAIDCONSTANTS");
const ReactionHandler = require('eris-reactions');
const isImageURL = require('valid-image-url');
const Eris = require("eris");

const logrun = require("../staff_commands/logrun");


async function logRunCheck(CHANNELOBJECT, startAfkMessage, index) {
    let checkMessage = await CONSTANTS.bot.createMessage(CHANNELOBJECT.ActiveRaidsChannelID, {
        embed: {
            title: `Post-Raid Panel for ${startAfkMessage.member.nick?startAfkMessage.member.nick:startAfkMessage.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
            description:
            `How did your run go?

            React with ${RAIDCONSTANTS.optiononeEmoji} if the run was a success! (Logs 1 run)
            React with ${RAIDCONSTANTS.optiontwoEmoji} if the run was a chain! (Input # of runs)
            React with ${RAIDCONSTANTS.optionthreeEmoji} if the run was a failure.
            React with ${RAIDCONSTANTS.redXEmoji} if you would prefer to log the run manually!
            
            **This message will time out in 5 minutes, after which you will have to log the run manually.**`,
            color: RAIDCONSTANTS.runTypeColor[index],
            timestamp: new Date().toISOString()
        }
    })

    await checkMessage.addReaction(RAIDCONSTANTS.optiononeReaction);
    await checkMessage.addReaction(RAIDCONSTANTS.optiontwoReaction);
    await checkMessage.addReaction(RAIDCONSTANTS.optionthreeReaction);
    await checkMessage.addReaction(RAIDCONSTANTS.redXReaction);

    let checkMessageListener = new ReactionHandler.continuousReactionStream(
        checkMessage, 
        (userID) => userID.id == startAfkMessage.author.id || CONFIG.SystemConfig.servers[startAfkMessage.guildID].modroles.some(id => userID.id == id), 
        false, 
        { maxMatches: 1, time: 300000}
    );

    let hasConfirmed = false;

    checkMessageListener.on('reacted', async (checkevent) => { // Success!
        if (checkevent.emoji.name == "optionone") {
            hasConfirmed = true;
            let runtype = RAIDCONSTANTS.acceptableRunTypes[index];
            if (runtype.indexOf("-") > 0) runtype = runtype.substring(0, runtype.indexOf("-"));
            console.log(runtype);
            logrun.logrun_programmatically(startAfkMessage.member, CHANNELOBJECT.ActiveRaidsChannelID, startAfkMessage.guildID, runtype, 1);
            checkMessage.delete().catch(() => {});
        }
        else if (checkevent.emoji.name == "optiontwo") { // Chain
            let hasConfirmedCollectorForNumRuns = false;

            hasConfirmed = true;

            checkMessage.edit({
                embed: {
                    title: `Post-Raid Panel for ${startAfkMessage.member.nick?startAfkMessage.member.nick:startAfkMessage.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
                    description:
                    `Logging...`,
                    color: RAIDCONSTANTS.runTypeColor[index],
                    timestamp: new Date().toISOString()
                }
            }).catch(() => {});
            checkMessage.removeReactions().catch(() => {});

            collector = new Eris.MessageCollector(checkMessage.channel, {
                timeout: 60000,
                count: 1,
                filter: function(msg) {
                    return ((msg.author.id == startAfkMessage.author.id || CONFIG.SystemConfig.servers[startAfkMessage.guildID].modroles.some(id => msg.author.id == id)) && !isNaN(parseInt(msg.content)));
                }
            })
            collector.run();

            let confirmMessageOne = await CONSTANTS.bot.createMessage(checkMessage.channel.id, {
                embed: {
                    description: "Please enter the number of runs you chained as an integer. (e.g. \`6\`)",
                    color: RAIDCONSTANTS.runTypeColor[index],
                    timestamp: new Date().toISOString()
                }
            })

            collector.on("collect", async(msgOne) => {
                let numRuns = parseInt(msgOne.content);
                hasConfirmedCollectorForNumRuns = true;

                let runtype = RAIDCONSTANTS.acceptableRunTypes[index];
                if (runtype.indexOf("-") > 0) runtype = runtype.substring(0, runtype.indexOf("-"));
                logrun.logrun_programmatically(startAfkMessage.member, CHANNELOBJECT.ActiveRaidsChannelID, startAfkMessage.guildID, runtype, numRuns);
                checkMessage.delete().catch(() => {});
                
                msgOne.delete().catch(() => {});
                confirmMessageOne.delete().catch(() => {});
            })

            setTimeout( async() => {
                if (!hasConfirmedCollectorForNumRuns) {
                    checkMessage.edit({
                        embed: {
                            title: `Post-Raid Panel for ${startAfkMessage.member.nick?startAfkMessage.member.nick:startAfkMessage.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
                            description:
                            `Timed out. Please log this run manually.`,
                            color: RAIDCONSTANTS.runTypeColor[index],
                            timestamp: new Date().toISOString()
                        }
                    }).catch(() => {});
                    checkMessage.removeReactions().catch(() => {});;
                    confirmMessageOne.delete().catch(() => {});
                }
            }, 60000)
        }
        else if (checkevent.emoji.name == "optionthree") { // Failure
            hasConfirmed = true;
            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[startAfkMessage.guildID].logchannel, {
                embed: {
                    description: `${startAfkMessage.member.mention} just failed a ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run.`,
                    color: 0xff0000,
                }
            })
            checkMessage.delete().catch(() => {});
        }
        else if (checkevent.emoji.name == "redX") { // Manual
            checkMessage.edit({
                embed: {
                    title: `Post-Raid Panel for ${startAfkMessage.member.nick?startAfkMessage.member.nick:startAfkMessage.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
                    description:
                    `You elected to manually log this run!`,
                    color: RAIDCONSTANTS.runTypeColor[index],
                    timestamp: new Date().toISOString()
                }
            }).catch(() => {});
            checkMessage.removeReactions().catch(() => {});;
            hasConfirmed = true;
        }
    });


    setTimeout(async () => {
        if (!hasConfirmed) {
            checkMessage.edit({
                embed: {
                    title: `Post-Raid Panel for ${startAfkMessage.member.nick?startAfkMessage.member.nick:startAfkMessage.member.username}'s ${RAIDCONSTANTS.runTypeTitleText[index] + " " + RAIDCONSTANTS.runTypeEmoji[index]} run`,
                    description:
                    `Timed out. Please log this run manually.`,
                    color: RAIDCONSTANTS.runTypeColor[index],
                    timestamp: new Date().toISOString()
                }
            }).catch(() => {});
            checkMessage.removeReactions().catch(() => {});;
        }
    }, 300000)
}

exports.execute = logRunCheck;