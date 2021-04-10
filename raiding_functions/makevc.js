const CONSTANTS = require("../config/constants");
const RAIDCONSTANTS = require("./RAIDCONSTANTS");
const CONFIG = require("../config/config");
const ReactionHandler = require('eris-reactions');


CONSTANTS.bot.setMaxListeners(100);

exports.execute = executevc;

exports.COMMAND_MkVcFullDescription = `Make Voice Channel Command. 
**Usage:** \`${CONSTANTS.botPrefix}makevc <category> <type> <?flags> <?name>\`
**<category>:** Raid category, one of \`main, veteran\`
**<type>:** \`regular, highreqs\`
**<?flags>:** \`-cap:<number>\` sets the vc cap to the desired number (must be between 0 and 99). Defaults: 75 for regular, 35 for highreqs.
**<?name>:** Optional: the desired name of the vc (default is <IGN>'s Run)
Example: \`${CONSTANTS.botPrefix}makevc main regular -cap:20 Theurul's O3\``;

const acceptableCategories = ["main", "veteran"];
const acceptableTypes = ["regular", "highreqs"];

function executevc(message, args) {
    if (!CONFIG.SystemConfig.servers[message.guildID]) {
        return "Server is not configurated yet. Type \`.config\` to configurate it.";
    }
    else return makevc(message, args);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makevc(message, args) {
    if (args.length < 2) return "You have to specify a \`Category\` and a \`Type\`! Example: \`makevc main regular SpaceRaider's O3\`";
    //VC Category Handling
    let category = args.shift();
    if (!acceptableCategories.includes(category)) return `Acceptable categories: \`${acceptableCategories.join(", ")}\``;
    else if (category === "veteran" && 
    (!CONFIG.SystemConfig.servers[message.guildID].afkaccess.vethalls.some(item => message.member.roles.includes(item)) && 
    !CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetoryx.some(item => message.member.roles.includes(item)) &&
    !CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetexaltation.some(item => message.member.roles.includes(item)) &&
    !CONFIG.SystemConfig.servers[message.guildID].afkaccess.vetmisc.some(item => message.member.roles.includes(item)))) return "You need a \`Veteran Leader Role\` to do that."

    let CHANNELOBJECT;
    if (category === "main") CHANNELOBJECT = CONFIG.SystemConfig.servers[message.guildID].channels.Main;
    else CHANNELOBJECT = CONFIG.SystemConfig.servers[message.guildID].channels.Veteran;

    //VC Type Handling
    let type = args.shift();
    if (!acceptableTypes.includes(type)) return `Acceptable types: \`${acceptableTypes.join(", ")}\``;

    //VC flag handling (REMOVE ALL NON-USERLIMIT FUNCTIONALITY)
    let userlimit;
    for (argument of args) {
        if (argument.startsWith("-cap:")) {
            let parseCap = argument.substring(5);
            if (isNaN(parseCap)) return "The voice cap must be an integer. e.g. -cap:20";
            else if (parseCap < 0 || parseCap > 99) return "The voice cap must be between 0 and 99";
            else {
                userlimit = parseFloat(parseCap);
                let index = args.indexOf(argument);
                args.splice(index, 1);
            }
        }
    }
    if (!userlimit) {
        if (type === "highreqs") userlimit = 35;
        else userlimit = 75;
    }


    //VC Name Handling
    let channelname;
    if (args.length > 0) channelname = args.join(" ");
    else if (type === "highreqs") channelname = `${message.member.nick}'s Highreqs Run`;
    else channelname = `${message.member.nick}'s Run`;

    let activeChannelPermissions = [];
    activeChannelPermissions.push({
        id: CONFIG.SystemConfig.servers[message.guildID].suspendrole,
        type: 0,
        allow: 0,
        deny: 32507648,
    })

        if (CHANNELOBJECT == CONFIG.SystemConfig.servers[message.guildID].channels.Veteran) {
            CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(item => {
                activeChannelPermissions.push({
                    id: item,
                    type: 0,
                    allow: 0,
                    deny: 32507648,
                })
            })
            CONFIG.SystemConfig.servers[message.guildID].nonstaff.vetaccess.forEach(item => {
                activeChannelPermissions.push({
                    id: item,
                    type: 0,
                    allow: 1049600,
                    deny: 31458048,
                })
            })
            
        }
        else { // highreqs main or regular main
            if (category === "highreqs") {
                CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberacccess.forEach(item => {
                    activeChannelPermissions.push({
                        id: item,
                        type: 0,
                        allow: 1024,
                        deny: 32506624,
                    })
                })
                CONFIG.SystemConfig.servers[message.guildID].nonstaff.vetaccess.forEach(item => {
                    activeChannelPermissions.push({
                        id: item,
                        type: 0,
                        allow: 1049600,
                        deny: 31458048,
                    })
                })
            }
            else { // not highreqs
                CONFIG.SystemConfig.servers[message.guildID].nonstaff.memberaccess.forEach(item => {
                    activeChannelPermissions.push({
                        id: item,
                        type: 0,
                        allow: 1049600,
                        deny: 31458048
                    })
                })
            }
        }

        // Assign staff role permissions:

        CONFIG.SystemConfig.servers[message.guildID].staffroles.forEach(item => {
            activeChannelPermissions.push({
                id: item,
                type: 0,
                allow: 66070272,
                deny: 0,
            })
        })
        CONFIG.SystemConfig.servers[message.guildID].modroles.forEach(item => {
            activeChannelPermissions.push({
                id: item,
                type: 0,
                allow: 1610360830,
                deny: 0,
            })
        })

        activeChannelPermissions.push({
            id: message.author.id,
            type: 1,
            allow: 16,
            deny: 0
        })


    let activeChannel = await CONSTANTS.bot.createChannel(message.guildID, channelname, 2, {
        parentID: CHANNELOBJECT.RaidCategoryID,
        userLimit: userlimit,
        permissionOverwrites: activeChannelPermissions
    });
    while (!CONSTANTS.bot.getChannel(activeChannel.id)) await sleep(100);
    activeChannel.editPosition(1);

    return "Channel successfully created, permissions successfully assigned. Don't forget to delete the channel when done!";
}