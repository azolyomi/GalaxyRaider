const CONSTANTS = require("../config/constants");
const GENERAL = require('../app');

// async function initializeBotGuildMembers() {
//     let privateBotGuild = await GENERAL.botGuild;
//     privateBotGuildMembers = await privateBotGuild.fetchMembers();
// }
// initializeBotGuildMembers();

exports.execute = findPrintCommand;
exports.find = find;

async function findPrintCommand(message, args) {
    let found = await find(message, args);
    if (!found) return;
    else if (found.length === 1) {
        return {
            embed: {
                title: "User " + args.join(" ") + " found: ",
                description: found[0].mention,
            }
        };
    }
    else {
        let allMemberMentionsString;
        for (const member of found) {
            if (!allMemberMentionsString) allMemberMentionsString = member.mention;
            else allMemberMentionsString += ", " + member.mention; 
        }
        return {
            embed: {
                title: "User Not Found, But Similar Members Include:",
                description: allMemberMentionsString,
            }
        }
    }
}

exports.COMMAND_FindFullDescription = `Find Command. 
**Usage:** \`${CONSTANTS.botPrefix}find <parameter>\`
**Parameter:** userID, username, nickname – any string that can be used to identify a user in the discord server.
**Returns:** If an exact match is found, returns a mention of the found user. Otherwise, returns a list of mentioned possible users that in <parameter> in their username or nickname.
_Example:_ \`${CONSTANTS.botPrefix}find Daryl\``;

async function find(message, args) {
    if (!GENERAL.guildCache[message.guildID]) {
        CONSTANTS.bot.createMessage(message.channel.id, "Members not cached, fetching members...");
        GENERAL.guildCache[message.guildID] = await message.guild.fetchMembers()
    }

    if (args.length === 0) {
        CONSTANTS.bot.createMessage(message.channel.id, "You have to specify a username/nickname/id!");
        return;
    }
    else {
        if (message.mentions.length > 0) return message.mentions;
        let inputString = args.join(" ");
        let allSimilarMembers = [];
        for (const member of GENERAL.guildCache[message.guildID]) {
            if (member.nick && (member.nick.toLowerCase() == inputString.toLowerCase())) {
                return [member];
            }
            else if (member.id == inputString) {
                return [member];
            }
            else if ((member.nick && (member.nick.toLowerCase().includes(inputString.toLowerCase()))) || (member.username && member.username.toLowerCase().includes(inputString.toLowerCase()))) {
                allSimilarMembers.push(member);
            }
        }
        if (allSimilarMembers.length > 0) {
            if (allSimilarMembers.length >= 50) {
                CONSTANTS.bot.createMessage(message.channel.id, {
                    embed: {
                        title: "Too many matches found. Try again with a more specific input.",
                    }
                })
                return;
            }
            else return allSimilarMembers;
        }
        else if (allSimilarMembers.length === 0) {
            CONSTANTS.bot.createMessage(message.channel.id, "Member or Similar User Not Found.");
            return;
        }
    }
}


/**
 * async function find(message, args) {
    if (args.length === 0) CONSTANTS.bot.createMessage(message.channel.id, "You have to mention a user!");
    else {
        let inputString = args.join(" ");
        let foundMember = false;
        let allSimilarMembers;
        for (const member of GENERAL.botGuildMembers) {
            if (member.nick && member.nick.toLowerCase() == inputString.toLowerCase()) {
                CONSTANTS.bot.createMessage(message.channel.id, {
                    embed: {
                        title: "User " + inputString + " found: ",
                        description: member.mention,
                    }
                })
                foundMember = true;
            }
            else if (member.id == inputString) {
                CONSTANTS.bot.createMessage(message.channel.id, {
                    embed: {
                        title: "User " + inputString + " found: ",
                        description: member.mention
                    }
                })
                foundMember = true;
            }
            else if (member.nick && (member.nick.toLowerCase().includes(inputString.toLowerCase()) || member.username.toLowerCase().includes(inputString.toLowerCase()))) {
                    if (!allSimilarMembers) {
                        allSimilarMembers = member.mention + ", ";
                    }
                    else allSimilarMembers += member.mention + ", ";
                }
            if (foundMember) break;
        }
        if (allSimilarMembers) {
            if (allSimilarMembers.length >= 2048) {
                CONSTANTS.bot.createMessage(message.channel.id, {
                    embed: {
                        title: "Too many matches found. Try again with a more specific input.",
                    }
                })
                foundMember = true;
            }
            else CONSTANTS.bot.createMessage(message.channel.id, {
                embed: {
                    title: "User Not Found, But Similar Members Include:",
                    description: allSimilarMembers,
                }
            })
        }
        if (!foundMember && !allSimilarMembers) {
            CONSTANTS.bot.createMessage(message.channel.id, "Member or Similar User Not Found.");
        }
    }
}
 */
