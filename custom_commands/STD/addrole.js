const CONSTANTS = require("../../config/constants");

const editableRoleIDs = ["765649870979596299", "780515270446940161", "779512163923525672", "780543201333215295", "790743719112343553", "864369441617870859", "761313993159475280", "790331735631593472", "522817272616583181", "868200591548117023", "784170636167479400", "847337364191707146", "890600680857948250", "893247873704161350", "784456967414218772", "879211296346734692", "879211150112329768", "897952451066494987", "921253292271616040", "778012539291172914", "522847698727206922"];
const officerID = "780306791212122153";
const headLeaderID = "761211992438472744";
async function addrole(msg, args) {
    if (msg.guildID != CONSTANTS.STDGuildID) return;
    if (!(msg.member.roles.includes(officerID) || msg.member.roles.includes(headLeaderID))) return `You need the <@&${officerID}> or <@&${headLeaderID}> role to do that.`;
    if (!(msg.mentions.length > 0)) return `Mention a user for that.`
    let roleMentions = msg.roleMentions.filter(id => editableRoleIDs.includes(id));
    if (!(roleMentions.length > 0)) return `You didn't mention any roles you are capable of editing.`;

    let mentionedMember = await CONSTANTS.bot.getRESTGuildMember(CONSTANTS.STDGuildID, msg.mentions[0].id);
    let memberRoles = mentionedMember.roles.concat(roleMentions);
    try {
        await mentionedMember.edit({
            roles: memberRoles,
        })
        return "Complete.";
    }
    catch(e) {
        return "Something went wrong with that and I couldn't edit their roles."
    }
}

exports.addrole = addrole

async function removerole(msg, args) {
    if (msg.guildID != CONSTANTS.STDGuildID) return;
    if (!(msg.member.roles.includes(officerID) || msg.member.roles.includes(headLeaderID))) return `You need the <@&${officerID}> or <@&${headLeaderID}> role to do that.`;
    if (!(msg.mentions.length > 0)) return `Mention a user for that.`
    let roleMentions = msg.roleMentions.filter(id => editableRoleIDs.includes(id));
    if (!(roleMentions.length > 0)) return `You didn't mention any roles you are capable of editing.`;

    let mentionedMember = await CONSTANTS.bot.getRESTGuildMember(CONSTANTS.STDGuildID, msg.mentions[0].id);
    let memberRoles = mentionedMember.roles.filter(id => !(roleMentions.includes(id)));
    try {
        await mentionedMember.edit({
            roles: memberRoles,
        })
        return "Complete.";
    }
    catch(e) {
        return "Something went wrong with that and I couldn't edit their roles."
    }
}

exports.removerole = removerole;

exports.STDrolehelpmessage = `
Add / Remove Role

**Usage**: \`.<add/remove>role @user @roles\`

**<@user>**: a mentioned user

**<@roles>**: any number of mentioned roles from the following list: 
${editableRoleIDs.map(id => `<@&${id}>`).join(", ")}

\`Example:\` .addrole <@211959423847890945> <@&761313993159475280>
`;