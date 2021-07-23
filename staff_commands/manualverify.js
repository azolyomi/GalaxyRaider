const CONFIG = require("../config/config");
const CONSTANTS = require("../config/constants");

async function manualVerify(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "You first have to configurate the server. Type \`.instructions\` for help.";
    else if (!msg.member.roles.some(role => CONFIG.SystemConfig.servers[msg.guildID].securityroles.includes(role))) return "You need to have a security role that is configured with the bot for that to work.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.length > 0) return `You first have to configurate a member role with \`.accessrole member <@role>\`.`;
    else if (!(msg.mentions.length > 0)) return `Mention a user to manually verify!`;
    args = args.filter(arg => !arg.includes(msg.mentions[0].id));
    if (!(args.length > 0)) return `Specify the nickname of the user.`;
    try {
        let member = await CONSTANTS.bot.getRESTGuildMember(msg.guildID, msg.mentions[0].id).catch(() => {
            CONSTANTS.bot.createMessage(msg.channel.id, `That mention doesn't match a member in your server.`);
            return undefined;
        })
        let nick = args.shift();
        if (member) {
            await CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.forEach(roleid => {
                member.addRole(roleid);
            })
            await member.edit({
                nick: nick
            })
            try {
                CONSTANTS.bot.deleteMessage(msg.channel.id, msg.id);
                CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                    embed: {
                        title: "Manual Verification",
                        description: `${msg.member.mention} just manually verified ${member.mention}. \nIGN: \`${nick}\`\nRoles added: ${CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.map(roleid => `<@&${roleid}>`).join(", ")}`,
                        color: 0x6e99d7
                    }
                })
            }
            catch(e) {}
        }

        if (msg.guildID == CONSTANTS.STDGuildID) {
            (await msg.channel.getMessages(10, msg.id, "821438827423203349")).forEach(message => {
                if (message.author.id == msg.mentions[0].id) message.delete();
            })
        }
    }
    catch (e) {
        CONSTANTS.bot.createMessage(msg.channel.id, "Something went wrong with that, and it didn't fully complete. Make sure your member roles all exist, are properly configured, and that the bot's highest role is higher than them. You cannot modify user nicknames if they rank higher than the bot. Also ensure that the log channel is properly set up.");
        console.log(e);
    }
}

exports.manualVerify = manualVerify;

exports.helpMessage = 
`Manual Verify Command
Used to assign a member the member roles configured within the server, and (optionally) change their nickname.

**Usage**: \`.mv <@user> <?nick>\`

**<@user>**: A mention of the user. To mention a user, type <@userID>

**<?nick>** (optional): The nickname to give the now-verified member.

**Example**: \`.mv <@myID> GalaxyRaider\` -> Gives me all configurated member roles and sets my nickname to GalaxyRaider`;
