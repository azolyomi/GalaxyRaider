const CONFIG = require("../config/config");
const CONSTANTS = require("../config/constants");

async function manualVerifyVet(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "You first have to configurate the server. Type \`.instructions\` for help.";
    else if (!msg.member.roles.some(role => CONFIG.SystemConfig.servers[msg.guildID].securityroles.includes(role))) return "You need to have a security role that is configured with the bot for that to work.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].nonstaff.vetaccess.length > 0) return `You first have to configurate a veteran role with \`.accessrole veteran <@role>\`.`;
    try {
        let rolesToAdd = []
        msg.roleMentions.forEach(id => {
            if (CONFIG.SystemConfig.servers[msg.guildID].nonstaff.vetaccess.includes(id)) rolesToAdd.push(id);
            else CONSTANTS.bot.createMessage(msg.channel.id, `I did not assign the role <@&${id}> because it is not configured as a veteran role and is therefore not a role you can assign with this command.`);
        });
        if (!(rolesToAdd.length > 0)) return {
            embed: {
                title: `Error`,
                description: 
                `Please mention at least one veteran role that you'd like to give that user.
                
                Example: \`.mvvet @user @vetrole1\` -> assigns vetrole1 to the user if vetrole1 is a configured veteran role.
                This is to avoid assigning all veteran roles to a user at once.`,
                color: 0xff0000
            }
        };
        
        let member = await CONSTANTS.bot.getRESTGuildMember(msg.guildID, msg.mentions[0].id).catch(() => {
            CONSTANTS.bot.createMessage(msg.channel.id, `That mention doesn't match a member in your server.`);
            return undefined;
        })
        if (member) {
            rolesToAdd.forEach(roleid => {
                member.addRole(roleid);
            })
            try {
                CONSTANTS.bot.deleteMessage(msg.channel.id, msg.id);
                CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                    embed: {
                        title: "Manual Veteran Verification",
                        description: `${msg.member.mention} just veteran verified ${member.mention}. \nRoles added: ${rolesToAdd.map(roleid => `<@&${roleid}>`).join(", ")}`,
                        color: 0x011ca2
                    }
                })
            }
            catch(e) {}
        }
    }
    catch (e) {
        CONSTANTS.bot.createMessage(msg.channel.id, "Something went wrong with that, and it didn't fully complete. Make sure your veteran roles all exist, are properly configured, and that the bot's highest role is higher than them. You cannot modify user nicknames if they rank higher than the bot.");
    }
}

exports.manualVerifyVet = manualVerifyVet;

exports.helpMessage = 
`Verify Veteran Command
Used to assign a user one or more of the veteran roles configured within the server.

**Usage**: \`.mv <@user> <@vetrole(s)>\`

**<@user>**: A mention of the user. To mention a user, type <@userID>

**<@vetrole(s)>** A list of mentioned roles to add to the user. Roles must be first configured as a veteran role in the bot.

**Example**: \`.mv <@myID> @vetrole1\` -> Gives me the @vetrole1 role if it is configured within the bot.`;