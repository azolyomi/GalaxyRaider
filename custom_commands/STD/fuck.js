const CONSTANTS = require('../../config/constants');

exports.execute = function(msg, args) {
    if (!msg.guildID || msg.guildID != "522815906376843274") return;
    else if (!(msg.mentions.length > 0)) return "Mention a user.";

    if (msg.member.id == msg.mentions[0].id) return {
        embed: {
            title: "Ruh roh!",
            description: "Masturbation is illegal in Indonesia! Pick someone else to fuck.",
            color: 0xff0000
        }
    }
    if (msg.mentions.length > 1 && msg.mentions.length <= 5) {
        let desc = 
        `**Pictured**:
        
        Center: ${msg.member.mention}
        Top: ${msg.mentions.map(mention => mention.mention).join(", ")}`;
        return {
            embed: {
                title: "What a lucky guy!",
                description: desc,
                image: {
                    url: "https://cdn.discordapp.com/attachments/826194483992461383/834078874581205062/fc8.png"
                },
                color: 0xffb6c1
            }
        }
    }


    let rand = Math.random() * 100 + 1;

    if (rand < 50) {
        return {
            embed: {
                title: "What's going on here?!",
                description: 
                `Pictured: 
                **Left**: ${msg.member.mention},
                **Right**: ${msg.mentions[0].mention}`,
                image: {
                    url: "https://i.imgur.com/okrfYto.gif",
                },
                color: 0xffb6c1
            }
        }
    }
    else {
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "Incoming!",
                color: 0xffb6c1
            }
        })
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "3...",
                color: 0xffb6c1
            }
        })
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "2...",
                color: 0xffb6c1
            }
        })
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "1...",
                color: 0xffb6c1
            }
        })
        return {
            embed: {
                title: "Yahtzee!",
                description: `${msg.member.mention} successfully fucked ${msg.mentions[0].mention}`,
                color: 0x00ff00
            }
        }
    }
}