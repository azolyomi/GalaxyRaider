const CONSTANTS = require("./constants");
const CONFIG = require("./config");

function registerKeyPopperRole(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return `Your server must be registered with the bot as a premium server to use that feature.`;
    else if (!(msg.roleMentions.length > 0)) return "You need to mention a role for that!";

    args = args.filter(string => !msg.roleMentions.find(s => string.includes(s)));

    let acceptableTypes = ["novice", "apprentice", "adept", "master"];

    let inputtype = args.shift();
    if (!acceptableTypes.includes(inputtype)) return `Key Pop Role Tier must be one of \`[${acceptableTypes.join(", ")}]\``;

    let pointvalue = parseInt(args.shift());
    if (isNaN(pointvalue) || pointvalue <= 0) return `The point value threshold must be an integer value greater than 0.`;

    let prefix = "";
    if (args.length > 0) prefix = args.shift();

    let roleID = msg.roleMentions[0];

    if (inputtype == "novice") {
        if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.enabled && CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.points < pointvalue) 
            return `You have a higher tier role (\`apprentice\`) that has a fewer configured amount of points. First correct this error!`;
        else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.enabled && CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.points < pointvalue) 
            return `You have a higher tier role (\`adept\`) that has a fewer configured amount of points. First correct this error!`;
        else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.enabled && CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.points < pointvalue) 
            return `You have a higher tier role (\`master\`) that has a fewer configured amount of points. First correct this error!`;
    }
    else if (inputtype == "apprentice") {
        if (!CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.enabled) return `First setup the \`novice\` tier!`;
        else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.enabled && CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.points < pointvalue) 
            return `You have a higher tier role (\`adept\`) that has a fewer configured amount of points. First correct this error!`;
        else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.enabled && CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.points < pointvalue) 
            return `You have a higher tier role (\`master\`) that has a fewer configured amount of points. First correct this error!`;
    }
    else if (inputtype == "adept") {
        if (!(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.enabled && CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.enabled)) return `First setup the \`novice\` and \`apprentice\` tiers!`;
        else if (CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.enabled && CONFIG.SystemConfig.servers[msg.guildID].keypoproles.master.points < pointvalue) 
            return `You have a higher tier role (\`master\`) that has a fewer configured amount of points. First correct this error!`;
    }
    else if (inputtype == "master") {
        if (!(CONFIG.SystemConfig.servers[msg.guildID].keypoproles.novice.enabled && CONFIG.SystemConfig.servers[msg.guildID].keypoproles.apprentice.enabled && CONFIG.SystemConfig.servers[msg.guildID].keypoproles.adept.enabled)) return `First setup the \`novice\`, \`apprentice\` and \`adept\` tiers!`;
    }

    CONFIG.SystemConfig.servers[msg.guildID].keypoproles[inputtype].enabled = true;
    CONFIG.SystemConfig.servers[msg.guildID].keypoproles[inputtype].id = roleID;
    CONFIG.SystemConfig.servers[msg.guildID].keypoproles[inputtype].points = pointvalue;
    CONFIG.SystemConfig.servers[msg.guildID].keypoproles[inputtype].prefix = prefix;

    CONFIG.updateConfig(msg.guildID);

    return `Successfully set the \`${inputtype}\` tier key popper role to the role <@&${roleID}>, with a point value of ${pointvalue} ${prefix?`and a prefix of \`${prefix}\``:""}`;

}

exports.registerKeyPopperRole = registerKeyPopperRole;

function resetKeyPopperRoles(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return `Your server must be registered with the bot as a premium server to use that feature.`;

    CONFIG.SystemConfig.servers[msg.guildID].keypoproles = {
                "novice" : {
                        "enabled" : false,
                        "id" : "",
                        "points" : 0,
                        "prefix": "",
                },
                "apprentice" : {
                        "enabled" : false,
                        "id" : "",
                        "points" : 0,
                        "prefix": ""
                },
                "adept" : {
                        "enabled" : false,
                        "id" : "",
                        "points" : 0,
                        "prefix": ""
                },
                "master" : {
                        "enabled" : false,
                        "id" : "",
                        "points" : 0,
                        "prefix": ""
                }
          }

    CONFIG.updateConfig(msg.guildID);

    return `Reset Key Popper Roles to Default Settings.`;
}

exports.resetKeyPopperRoles = resetKeyPopperRoles;

exports.resetHelpCommand = 
`Reset Key Popper Roles
Used to reset the key popper roles to defaults. This will erase any configuration progress you might have made with key popper roles so far.
Errors in configuring key popper roles require the roles to be reset`;

exports.helpCommand = 
`Register Key Popper Role
Used to assign one of the four tiers of key popper roles. Not all tiers have to be used.
Roles specified here will automatically be given to users once they exceed certain designated point values (from popping keys/vials/runes)

**Usage**: \`${CONSTANTS.botPrefix}registerkeypopperrole <tier> <pointvalue> <?prefix> <@role>\`

**<tier>**: The tier which you'd like to assign this key popper role to. One of \`novice, apprentice, adept, master\`.
_Note: tiers must be assigned in order. You must first configure a \`novice\` tier before configuring an \`apprentice\` tier._

**<pointvalue>**: The integer number of points (from item logs) which members should have in order for this role to be given to them.

**<prefix>**: The prefix you would like all members with this role to acquire. _Note: This will be **added to the beginning of their nickname**, regardless of whatever characters are there already._
**<@role>**: A mention of the role to assign the member.

Example: \`.registerkeypopperrole novice 100 @role1\` -> sets it so that all members who reach or exceed \`100\` points will be automatically assigned the \`@role1\` role.
`;


/**

keypoproles: {
    novice: {
        enabled: false,
        id: null,
        points: 0
    }
    apprentice: {
        enabled: false,
        id: null,
        points: 0
    }
    adept: {
        enabled: false,
        id: null,
        points: 0
    }
    master: {
        enabled: false,
        id: null,
        points: 0
    }
}







 */