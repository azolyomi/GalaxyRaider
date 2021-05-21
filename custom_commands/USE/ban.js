const CONSTANTS = require('../../config/constants');

exports.execute = function(msg, args) {
    if (!msg.guildID || msg.guildID != "330575044088692736") return;
    else if (!(msg.mentions.length > 0)) return "Mention a user.";


    let titles = ["Ruh roh, dumbass!", "You dare PRESUME!", "LIGMA.", "Ok, one-inch wonder."];

    let num = Math.floor(Math.random() * titles.length);

    if (msg.member.id == msg.mentions[0].id) return {
        embed: {
            title: titles[num],
            description: "You're too beta to try ban yourself, nerd. \n**Even __my__ balls hang lower than yours!**",
            image: {
                url: "https://i.redd.it/iveuj0gfqxw61.jpg",
                width: 400
            },
            color: 0xff0000
        }
    }

    else if (msg.mentions.length > 1) return {
        embed: {
            title: titles[num],
            description: "**Only your mom can ban multiple people at a time, and I'm six inches deep in her!**",
            image: {
                url: "https://i.redd.it/iveuj0gfqxw61.jpg",
                width: 400
            },
            color: 0xff0000
        }
    }

    else {
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "Incoming!",
                color: 0xffa3c1
            }
        })
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "3...",
                color: 0xffa3c1
            }
        })
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "2...",
                color: 0xffa3c1
            }
        })
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "1...",
                color: 0xffa3c1
            }
        })
        return {
            embed: {
                title: `R I P`,
                description: `The ban hammer has struck ${msg.mentions[0].mention}. Press F to pay respects.`,
                image: {
                    url: "https://cdn.discordapp.com/attachments/826194483992461383/845150970845331486/trump_ban.gif"
                },
                color: 0x00ff00
            }
        }
    }

}