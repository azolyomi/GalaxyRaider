const CONSTANTS = require("../../config/constants");
const CONFIG = require("../../config/config");
const RAIDCONSTANTS = require("../../raiding_functions/RAIDCONSTANTS");
require("dotenv").config();

const ReactionHandler = require('eris-reactions');
const isImageURL = require('valid-image-url');
const Eris = require("eris");

var MongoClient = require('mongodb').MongoClient;


exports.gamble = function(msg, args) {
    return minibossGamble(msg, args);
}

async function minibossGamble(msg, args) {
    if (msg.guildID != CONSTANTS.STDGuildID) return;
    let gambleMessage = await CONSTANTS.bot.createMessage(msg.channel.id, {
        embed: {
            title: `Miniboss Gamble`,
            description:
            `${msg.member.mention} has initited a **Miniboss Gamble**
            
            **Instructions:**
            1. Pick a miniboss to bet on!
            2. The bot will DM you asking for a number of credits to gamble. Answer the bot in DM's!
            To check your current credits, type \`${CONSTANTS.botPrefix}credits\``,
            footer: {
                icon_url: `${msg.guild.iconURL}`,
                text: `${new Date().toUTCString()} | This gamble will end in 15 minutes.`
            },
            color: 0xff0066
        }
    });
    gambleMessage.addReaction(RAIDCONSTANTS.gemsbokReaction);
    gambleMessage.addReaction(RAIDCONSTANTS.beisaReaction);
    gambleMessage.addReaction(RAIDCONSTANTS.leucoryxReaction);
    gambleMessage.addReaction(RAIDCONSTANTS.dammahReaction);
    gambleMessage.addReaction(RAIDCONSTANTS.redXReaction);

    let gambleEnded = false;

    let gambleReactionListener = new ReactionHandler.continuousReactionStream(
        gambleMessage, 
        (userID) => (!userID.bot), 
        false, 
        { maxMatches: 200, time: 900000}
    );

    gambleReactionListener.on('reacted', async function(event) {
        if (["Gemsbok", "Beisa", "Leucoryx", "Dammah"].includes(event.emoji.name)) {
            minibossBet(event.emoji.name, event.userID.id, msg.guildID, gambleMessage, event);
        }
        else if (event.emoji.name == "redX" && event.userID.id == msg.author.id) {
            gambleMessage.edit({
                embed: {
                    title: `Miniboss Gamble`,
                    description:
                    `${msg.member.mention} is rolling this **Miniboss Gamble**
                    
                    **Good luck!**`,
                    footer: {
                        icon_url: `${msg.guild.iconURL}`,
                        text: `${new Date().toUTCString()}`
                    },
                    color: 0xff0066
                }
            })
            await gambleMessage.removeReactions();
            await gambleMessage.addReaction(RAIDCONSTANTS.pencil);
        }
        else if (event.emoji.name == RAIDCONSTANTS.pencil && event.userID.id == msg.author.id) {
            //deciding the bet now

            //get miniboss:
            let minibossCollector = new Eris.MessageCollector(gambleMessage.channel, {
                timeout: 60000,
                count: 1,
                filter: function(message) {
                    if (message.author.id != msg.author.id) return false;
                    else if (!(["Gemsbok", "Beisa", "Leucoryx", "Dammah"].includes(message.content))) {
                        gambleMessage.channel.createMessage(`Must be one of \`${["Gemsbok", "Beisa", "Leucoryx", "Dammah"].join(", ")}\``).catch(() => {});
                        return false;
                    }
                    else return (true);
                }
            })

            let whichMessage = await gambleMessage.channel.createMessage({
                embed: {
                    title: `Which Miniboss Won?`,
                    color: 0xff0066,
                }
            })

            minibossCollector.run(); 
            
            minibossCollector.on('collect', async (minibossMsg) => {
                gambleEnded = true;
                let winningMiniboss = minibossMsg.content;

                whichMessage.delete().catch(() => {});
                minibossMsg.delete().catch(() => {});

                endMinibossBet(gambleMessage.id, msg.guildID, winningMiniboss);
                gambleMessage.edit({
                    embed: {
                        title: `Miniboss Gamble`,
                        description:
                        `${msg.member.mention} has ended this **Miniboss Gamble**
                        
                        **The miniboss was: \`${winningMiniboss}\`!!!**`,
                        footer: {
                            icon_url: `${msg.guild.iconURL}`,
                            text: `${new Date().toUTCString()}`
                        },
                        color: 0xff0066
                    }
                })
                gambleMessage.removeReactions();
                gambleReactionListener.removeAllListeners('reacted');
            })

            setTimeout(() => {
                if (!gambleEnded) gambleMessage.channel.createMessage(`Miniboss selection timed out. Re-react with the ${RAIDCONSTANTS.pencil}`);
            }, 60000)

            
        }
    })

    setTimeout(() => {
        if (!gambleEnded) {
            MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
                if (err) throw (err);
                var dbo = db.db("GalaxyRaiderDB");
                let betObjectArray = await dbo.collection("GalaxyGambling.ActiveGambles").find({msgID: gambleMessage.id, guildID: msg.guildID}).toArray();

                betObjectArray.forEach(async betObject => {
                    await dbo.collection("GalaxyGambling.UserData").updateOne({guildID: msg.guildID, userID: betObject.userID}, {$inc: {credits: betObject.bet}});
                })

                gambleMessage.edit({
                    embed: {
                        title: `Miniboss Gamble`,
                        description:
                        `This gamble has timed out. Start a new one!`,
                        footer: {
                            icon_url: `${msg.guild.iconURL}`,
                            text: `${new Date().toUTCString()}`
                        },
                        color: 0xff0066
                    }
                })

                gambleMessage.removeReactions();
                gambleReactionListener.removeAllListeners('reacted');
                await dbo.collection("GalaxyGambling.ActiveGambles").deleteMany({msgID: gambleMessage.id, guildID: msg.guildID});
                db.close();
            })
        }
    }, 900000)
}

async function minibossBet(miniboss, userID, guildID, msg, event) {
    MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = await dbo.collection("GalaxyGambling.UserData").findOne({guildID: guildID, userID: userID});
        if (!foundEntry) {
            foundEntry = {
                guildID: guildID, 
                userID: userID,
                credits: CONSTANTS.defaultCredits,
                wins: 0,
                losses: 0,
                winstreak: 0
            }
            await dbo.collection("GalaxyGambling.UserData").insertOne(foundEntry);
        }
        let hasConfirmed = false;


        let dmChannel = await CONSTANTS.bot.getDMChannel(userID).catch(console.log);
        let dmCollector = new Eris.MessageCollector(dmChannel, {
            timeout: 60000,
            count: 1,
            filter: function(message) {
                if (message.author.bot) return false;
                else if (foundEntry.credits <= 0) {
                    dmChannel.createMessage(`You don't have enough credits to make a bet. Popping a key/vial/rune will get you more credits!`).catch(() => {});
                    return false;
                }
                let number = parseInt(message.content);
                if (isNaN(number) || number <= 0 || number > foundEntry.credits) {
                    dmChannel.createMessage(`Must be an integer less than or equal to \`${foundEntry.credits}\` and greater than \`0\``).catch(() => {});
                    return false;
                }
                else return (!message.author.bot);
            }
        })

        
        dmCollector.run();
        
        dmCollector.on('collect', async (dmMsg) => { 
            hasConfirmed = true;
            // say how much they're going to bet
            let bet = parseInt(dmMsg.content);

            //update user (decrement credits by bet)   
            dbo.collection("GalaxyGambling.UserData").updateOne({userID: userID, guildID: guildID}, {$inc: {credits: -(bet)}});

            //add user bet to the pool
            let betObject = {
                userID: userID,
                msgID: msg.id,
                guildID: guildID,
                miniboss: miniboss,
                bet: bet,
            }
            await dbo.collection("GalaxyGambling.ActiveGambles").insertOne(betObject);

            dmChannel.createMessage({
                embed: {
                    title: `Bet Placed`,
                    description: `Successfully placed \`${bet}\` credits on \`${event.emoji.name}\``,
                    color: 0xff0066
                }
            }).catch(() => {});

            db.close();
        })

        try {
            await dmChannel.createMessage({
                embed: {
                    title: `Miniboss Gamble`,
                    description: 
                    `Please enter the **number of credits you wish to bet**
                    Make sure this is a number. The bot will not respond to any other input.
                    
                    You have: ${foundEntry?foundEntry.credits:50} available credits.`,
                    color: 0xff0066
                }
            })

        }
        catch(e) {
            await msg.removeReaction(`${event.emoji.id?(event.emoji.name + `:` + event.emoji.id):event.emoji.name}`, userID);
            dmCollector.stop();
            dmCollector.removeAllListeners();
            db.close();
        }

        setTimeout(() => {
            if (!hasConfirmed) dmChannel.createMessage(`Timed out!`).catch(() => {});
            db.close();
        }, 60000)

    })
}

async function endMinibossBet(msgID, guildID, winningMiniboss) {
    MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let betObjectArray = await dbo.collection("GalaxyGambling.ActiveGambles").find({msgID: msgID, guildID: guildID}).toArray();

        let poolMinusWinnerContributions = 0;
        let winnerContributions = 0;
        let winnerArray = [];
        let nonWinnerArray = [];

        betObjectArray.forEach(betObject => {
            if (betObject.miniboss == winningMiniboss) {
                winnerArray.push(betObject);
                winnerContributions += betObject.bet;
            }
            else {
                nonWinnerArray.push(betObject);
                poolMinusWinnerContributions += betObject.bet;
            }
        })

        let odds = Math.floor(poolMinusWinnerContributions / winnerContributions);

        winnerArray.forEach(async betObject => {
            let winnings = betObject.bet + (betObject.bet * odds);
            await dbo.collection("GalaxyGambling.UserData").updateOne({guildID: guildID, userID: betObject.userID}, {$inc: {credits: winnings, winstreak: 1, wins: 1}});
        })

        nonWinnerArray.forEach(async betObject => {
            await dbo.collection("GalaxyGambling.UserData").updateOne({guildID: guildID, userID: betObject.userID}, {$set: {winstreak: 0}, $inc: {losses: 1}});
        })

        await dbo.collection("GalaxyGambling.ActiveGambles").deleteMany({msgID: msgID, guildID: guildID});
        db.close();
    })
}


exports.credits = function(msg, args) {
    MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = await dbo.collection("GalaxyGambling.UserData").findOne({userID: msg.author.id, guildID: msg.guildID});
        let object;
        if (!foundEntry) {
            object = {
                guildID: msg.guildID, 
                userID: msg.author.id,
                credits: CONSTANTS.defaultCredits,
                wins: 0,
                losses: 0,
                winstreak: 0
            }
            await dbo.collection("GalaxyGambling.UserData").insertOne(object);

            msg.channel.createMessage({
                embed: {
                    title: `Casino Status`,
                    description:
                    `**Credits**: ${object.credits}
                    **Wins**: ${object.wins}
                    **Losses**: ${object.losses}
                    **Win Streak**: ${object.winstreak}`,
                    color: 3145463
                }
            })

            db.close();
        }
        else {
            object = foundEntry;
            msg.channel.createMessage({
                embed: {
                    title: `Casino Status`,
                    description:
                    `**Credits**: ${object.credits}
                    **Wins**: ${object.wins}
                    **Losses**: ${object.losses}
                    **Win Streak**: ${object.winstreak}`,
                    color: 3145463
                }
            })

            db.close();
        }
    })
}


