const CONSTANTS = require("./constants");
const CONFIG = require("./config");

async function streamingPerms(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return `Your server must be registered with the bot as a premium server to use that feature.`;
    else if (!(msg.roleMentions.length > 0)) return "You need to mention at least one role for that!";

    let types = ["allow", "deny"];
    let type = args[0];
    if (!types.includes(type)) return `You must specify whether to \`allow\` or \`deny\` the permissions. Ex: \`.streamingperms allow @role1\``;

    if (type == "allow") {
        await msg.roleMentions.forEach(id => {
            if (!CONFIG.SystemConfig.servers[msg.guildID].streamingperms.includes(id)) CONFIG.SystemConfig.servers[msg.guildID].streamingperms.push(id);
        })
    }
    else {
        await msg.roleMentions.forEach(id => {
            CONFIG.SystemConfig.servers[msg.guildID].streamingperms = CONFIG.SystemConfig.servers[msg.guildID].streamingperms.filter(enabledID => enabledID != id);
        })
    }
    CONFIG.updateConfig(msg.guildID);
    
    return `Successfully ${type=="allow"?"added":"removed"} ${msg.roleMentions.map((roleID, index) => {
        return `<@&${roleID}>`;
    }).join(", ")} ${type=="allow"?"to":"from"} bot access for \`streaming\` permissions`
}

exports.streamingPerms = streamingPerms;

exports.streamingPermsHelpCommand = 
`Streaming Permissions Command
Allows you to designate a role to have permission to stream in voice channels they have access to.

**Usage**: \`.streamingperms <type> <@roles>\`

**<type>**: Either \`allow\` or \`deny\`, to either allow or deny the permissions.

**<@roles>**: A list of mentioned roles.

Example: \`.streamingperms allow @role1 @role2\` -> enables users with @role1 and @role2 to stream in raiding voice channels that have access to.`;

function addStaffAccess(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!(msg.roleMentions.length > 0)) return "You need to mention a role for that!";

    let acceptableAccessTypes = ["moderator", "helper", "security", "halls", "oryx", "shatters", "exaltation", "misc", "vethalls", "vetoryx", "vetshatters", "vetexaltation", "vetmisc", "allreg", "allvet"]; // all different access types you can add (determined by config.json structure)
    let accessTypes = []; // store dict for the inputted access types

    acceptableAccessTypes.forEach((string, index) => {
        if (args.includes(string)) accessTypes.push(string);
    })
    if (!(accessTypes.length > 0)) return `You must specify an access type, one of \`${acceptableAccessTypes.join(", ")}\``;
    try {
        msg.roleMentions.forEach((roleID, index) => {
            if (!(accessTypes.length == 1 && accessTypes[0] == "helper") && !CONFIG.SystemConfig.servers[msg.guildID].staffroles.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].staffroles.push(roleID);
            if ((accessTypes.includes("moderator")) && !CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(roleID)) {
                CONFIG.SystemConfig.servers[msg.guildID].modroles.push(roleID);
                CONFIG.SystemConfig.servers[msg.guildID].securityroles.push(roleID);
                CONFIG.SystemConfig.servers[msg.guildID].quotaOverrideRoles.push(roleID);
            }
            if (accessTypes.includes("helper") && !CONFIG.SystemConfig.servers[msg.guildID].helperroles.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].helperroles.push(roleID);
            if (accessTypes.includes("security") && !CONFIG.SystemConfig.servers[msg.guildID].securityroles.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].securityroles.push(roleID);
            if ((accessTypes.includes("halls") || accessTypes.includes("allreg")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.halls.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.halls.push(roleID);
            if ((accessTypes.includes("oryx") || accessTypes.includes("allreg")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.oryx.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.oryx.push(roleID);
            if ((accessTypes.includes("shatters") || accessTypes.includes("allreg")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.shatters.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.shatters.push(roleID);
            if ((accessTypes.includes("exaltation") || accessTypes.includes("allreg")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.exaltation.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.exaltation.push(roleID);
            if ((accessTypes.includes("misc") || accessTypes.includes("allreg")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.misc.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.misc.push(roleID);

            if ((accessTypes.includes("vethalls") || accessTypes.includes("allvet")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vethalls.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vethalls.push(roleID);
            if ((accessTypes.includes("vetoryx") || accessTypes.includes("allvet")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetoryx.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetoryx.push(roleID);
            if ((accessTypes.includes("vetshatters") || accessTypes.includes("allvet")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetshatters.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetshatters.push(roleID);
            if ((accessTypes.includes("vetexaltation") || accessTypes.includes("allvet")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetexaltation.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetexaltation.push(roleID);
            if ((accessTypes.includes("vetmisc") || accessTypes.includes("allvet")) && !CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetmisc.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetmisc.push(roleID);
        })
        CONFIG.updateConfig(msg.guildID);
        return `Successfully added ${msg.roleMentions.map((roleID, index) => {
            return `<@&${roleID}>`;
        }).join(", ")} to the bot access for \`${(accessTypes.includes("allvet") && accessTypes.includes("allreg")?"all veteran + all regular":(accessTypes.includes("allreg")?"all regular":accessTypes.join(", ")))}\` permissions.`;
    }
    catch(e) {
        throw e;
    }
}

function accessMember(msg, args) {
    return addNonstaffAccess(msg, args, "member");
}
function accessVet(msg, args) {
    return addNonstaffAccess(msg, args, "vet");
}
function accessBooster(msg, args) {
    return addNonstaffAccess(msg, args, "booster");
}


function addNonstaffAccess(msg, args, type) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!(msg.roleMentions.length > 0)) return "You need to mention a role for that!";

    let acceptableNonstaffAccessTypes = ["member", "vet", "booster"];
    if (!type || !acceptableNonstaffAccessTypes.includes(type)) return `Not a valid access type, must be one of \`${acceptableNonstaffAccessTypes.join(", ")}\``;

    try {
        if (type === "member") {
            msg.roleMentions.forEach((roleID, index) => {
                if (!CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.push(roleID);
            })
        }
        else if (type === "vet") {
            msg.roleMentions.forEach((roleID, index) => {
                if (!CONFIG.SystemConfig.servers[msg.guildID].nonstaff.vetaccess.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].nonstaff.vetaccess.push(roleID);
            })
        }
        else if (type === "booster") {
            msg.roleMentions.forEach((roleID, index) => {
                if (!CONFIG.SystemConfig.servers[msg.guildID].nonstaff.boosteraccess.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].nonstaff.boosteraccess.push(roleID);
            })
        }
        
        CONFIG.updateConfig(msg.guildID);
        return `Successfully added ${msg.roleMentions.map((roleID, index) => {
            return `<@&${roleID}>`;
        }).join(", ")} to the bot access as a ${type} role.`;
    }
    catch(e) {
        throw e;
    }
}

exports.accessStaff = addStaffAccess;
exports.accessMember = accessMember;
exports.accessVet = accessVet;
exports.accessBooster = accessBooster;


// REMOVING ACCESS FUNCTIONS:

function removeStaffAccess(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!(msg.roleMentions.length > 0)) return "You need to mention a role for that!";

    let acceptableAccessTypes = ["moderator", "helper", "security", "halls", "oryx", "shatters", "exaltation", "misc", "vethalls", "vetoryx", "vetshatters", "vetexaltation", "vetmisc", "allreg", "allvet", "all"]; // all different access types you can add (determined by config.json structure)
    let accessTypes = []; // store dict for the inputted access types

    acceptableAccessTypes.forEach((string, index) => {
        if (args.includes(string)) accessTypes.push(string);
    })
    if (!(accessTypes.length > 0)) return `You must specify an access type, one of \`${acceptableAccessTypes.join(", ")}\``;
    try {
        msg.roleMentions.forEach((roleID, index) => {
            if ((accessTypes.includes("moderator")) && CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(roleID)) {
                CONFIG.SystemConfig.servers[msg.guildID].modroles = CONFIG.SystemConfig.servers[msg.guildID].modroles.filter(id => id != roleID);
                CONFIG.SystemConfig.servers[msg.guildID].securityroles = CONFIG.SystemConfig.servers[msg.guildID].securityroles.filter(id => id != roleID);
                CONFIG.SystemConfig.servers[msg.guildID].quotaOverrideRoles = CONFIG.SystemConfig.servers[msg.guildID].quotaOverrideRoles.filter(id => id != roleID);
            }
            if ((accessTypes.includes("helper")) && CONFIG.SystemConfig.servers[msg.guildID].helperroles.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].helperroles = CONFIG.SystemConfig.servers[msg.guildID].helperroles.filter(id => id != roleID);
            if ((accessTypes.includes("security")) && CONFIG.SystemConfig.servers[msg.guildID].securityroles.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].securityroles = CONFIG.SystemConfig.servers[msg.guildID].securityroles.filter(id => id != roleID);
            if ((accessTypes.includes("halls") || accessTypes.includes("allreg") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.halls = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.halls.filter(id => id != roleID);
            if ((accessTypes.includes("oryx") || accessTypes.includes("allreg") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.oryx = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.oryx.filter(id => id != roleID);
            if ((accessTypes.includes("shatters") || accessTypes.includes("allreg") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.shatters = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.shatters.filter(id => id != roleID);
            if ((accessTypes.includes("exaltation") || accessTypes.includes("allreg") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.exaltation = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.exaltation.filter(id => id != roleID);
            if ((accessTypes.includes("misc") || accessTypes.includes("allreg") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.misc = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.misc.filter(id => id != roleID);

            if ((accessTypes.includes("vethalls") || accessTypes.includes("allvet") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vethalls = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vethalls.filter(id => id != roleID);
            if ((accessTypes.includes("vetoryx") || accessTypes.includes("allvet") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetoryx = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetoryx.filter(id => id != roleID);
            if ((accessTypes.includes("vetshatters") || accessTypes.includes("allvet") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetshatters = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetshatters.filter(id => id != roleID);
            if ((accessTypes.includes("vetexaltation") || accessTypes.includes("allvet") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetexaltation = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetexaltation.filter(id => id != roleID);
            if ((accessTypes.includes("vetmisc") || accessTypes.includes("allvet") || accessTypes.includes("all"))) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetmisc = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetmisc.filter(id => id != roleID);

            if ((!CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].securityroles.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.halls.includes(roleID)) && 
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.oryx.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.shatters.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.exaltation.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.misc.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vethalls.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetoryx.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetshatters.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetexaltation.includes(roleID)) &&
                (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.vetmisc.includes(roleID))) CONFIG.SystemConfig.servers[msg.guildID].staffroles = CONFIG.SystemConfig.servers[msg.guildID].staffroles.filter(id => id != roleID);
        })
        CONFIG.updateConfig(msg.guildID);
        return `Successfully removed ${msg.roleMentions.map((roleID, index) => {
            return `<@&${roleID}>`;
        }).join(", ")} from the bot access for \`${accessTypes.join(", ")}\` permissions.`;
    }
    catch(e) {
        throw e;
    }
}

function removeAccessMember(msg, args) {
    return removeNonstaffAccess(msg, args, "member");
}
function removeAccessVet(msg, args) {
    return removeNonstaffAccess(msg, args, "vet");
}
function removeAccessBooster(msg, args) {
    return removeNonstaffAccess(msg, args, "booster");
}


function removeNonstaffAccess(msg, args, type) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!(msg.roleMentions.length > 0)) return "You need to mention a role for that!";

    let acceptableNonstaffAccessTypes = ["member", "vet", "booster"];
    if (!type || !acceptableNonstaffAccessTypes.includes(type)) return `Not a valid access type, must be one of \`${acceptableNonstaffAccessTypes.join(", ")}\``;

    try {
        if (type === "member") {
            msg.roleMentions.forEach((roleID, index) => {
                if (CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess = CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess.filter(id => id != roleID);
            })
        }
        else if (type === "vet") {
            msg.roleMentions.forEach((roleID, index) => {
                if (CONFIG.SystemConfig.servers[msg.guildID].nonstaff.vetaccess.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].nonstaff.vetaccess = CONFIG.SystemConfig.servers[msg.guildID].nonstaff.vetaccess.filter(id => id != roleID);
            })
        }
        else if (type === "booster") {
            msg.roleMentions.forEach((roleID, index) => {
                if (CONFIG.SystemConfig.servers[msg.guildID].nonstaff.boosteraccess.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].nonstaff.boosteraccess = CONFIG.SystemConfig.servers[msg.guildID].nonstaff.boosteraccess.filter(id => id != roleID);
            })
        }
        
        CONFIG.updateConfig(msg.guildID);
        return `Successfully removed ${msg.roleMentions.map((roleID, index) => {
            return `<@&${roleID}>`;
        }).join(", ")} from the bot access as a \`${type}\` role.`;
    }
    catch(e) {
        throw e;
    }
}

exports.removeAccessStaff = removeStaffAccess;
exports.removeAccessMember = removeAccessMember;
exports.removeAccessVet = removeAccessVet;
exports.removeAccessBooster = removeAccessBooster;


function clearAccessMember(msg, args) {
    return clearNonstaffAccess(msg, args, "member");
}
function clearAccessVet(msg, args) {
    return clearNonstaffAccess(msg, args, "vet");
}
function clearAccessBooster(msg, args) {
    return clearNonstaffAccess(msg, args, "booster");
}

function clearNonstaffAccess(msg, args, type) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return `Your server must be registered with the bot as a premium server to use that feature.`;

    let acceptableNonstaffAccessTypes = ["member", "vet", "booster"];
    if (!type || !acceptableNonstaffAccessTypes.includes(type)) return `Not a valid access type, must be one of \`${acceptableNonstaffAccessTypes.join(", ")}\``;

    try {
        if (type === "member") {
            CONFIG.SystemConfig.servers[msg.guildID].nonstaff.memberaccess = [];
        }
        else if (type === "vet") {
            CONFIG.SystemConfig.servers[msg.guildID].nonstaff.vetaccess = [];
        }
        else if (type === "booster") {
            CONFIG.SystemConfig.servers[msg.guildID].nonstaff.boosteraccess = [];
        }
        
        CONFIG.updateConfig(msg.guildID);
        return `Successfully removed all \`${type}\` roles from the bot access.`;
    }
    catch(e) {
        throw e;
    }
}

exports.clearAccessMember = clearAccessMember;
exports.clearAccessVet = clearAccessVet;
exports.clearAccessBooster = clearAccessBooster;

function highreqs(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!CONFIG.SystemConfig.servers[msg.guildID].premium) return `Your server must be registered with the bot as a premium server to use that feature.`;
    else if (!(msg.roleMentions.length > 0)) return "You need to mention a role for that!";

    let types = ["allow","deny"];
    let type = args[0];
    if (!types.includes(type)) return `You must specify in your first argument whether you wish to \`allow\` or \`deny\` permissions. Ex: \`.highreqs allow @role1\``;

    let failedCheck = [];
    msg.roleMentions.forEach(id => {
        if (!CONFIG.SystemConfig.servers[msg.guildID].staffroles.includes(id)) {
            failedCheck.push(id);
        }
    })

    if (failedCheck.length > 0) {
        return `Error: The roles ${failedCheck.map(id => `<@&${id}>`).join(", ")} are not staff roles in the database. First configure them as such, then edit highreqs capabilities.`
    }

    if (type == "deny") {
        msg.roleMentions.forEach(roleID => {
            if (CONFIG.SystemConfig.servers[msg.guildID].modroles.includes(roleID)) CONSTANTS.bot.createMessage(msg.channel.id, `The role <@&${roleID}> is a mod role. Nothing was changed for this role.`);
            else if (!CONFIG.SystemConfig.servers[msg.guildID].afkaccess.denyhighreqs.includes(roleID)) CONFIG.SystemConfig.servers[msg.guildID].afkaccess.denyhighreqs.push(roleID);
        })
    }
    else {
        msg.roleMentions.forEach(roleID => {
            CONFIG.SystemConfig.servers[msg.guildID].afkaccess.denyhighreqs = CONFIG.SystemConfig.servers[msg.guildID].afkaccess.denyhighreqs.filter(id => id != roleID);
        })
    }

    CONFIG.updateConfig(msg.guildID);
    return `Successfully ${type=="allow"?"added":"removed"} permissions for ${msg.roleMentions.map((roleID, index) => {
        return `<@&${roleID}>`;
    }).join(", ")} ${type=="allow"?"to":"from"} start${type=="allow"?"":"ing"} highreqs raids.`;
}

exports.highreqs = highreqs;

exports.highreqsHelpCommand = 
`Edit Highreqs Status Command
Used to either allow / deny capacity to start highreqs raids for certain roles. Default is allowed for all new roles configurated with bot.

**Usage**: \`.highreqs <type> <@roles>\`

**<type>**: Either \`allow\` or \`deny\` to specify whether or not you are allowing the role access to highreqs raids or denying it.

**<@roles>**: A list of mentioned roles.

Example: \`.highreqs deny @role1\` -> If @role1 is a configured staff role, eliminates the role's capacity to start highreqs raids.`;

function setSuspendRole(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Run the `.config` command first.";
    else if (!(msg.roleMentions.length > 0)) return "You need to mention a role for that!";

    let roleID = msg.roleMentions[0];
    if (CONFIG.SystemConfig.servers[msg.guildID].suspendrole != roleID ) CONFIG.SystemConfig.servers[msg.guildID].suspendrole = roleID;

    CONFIG.updateConfig(msg.guildID);
    return `Successfully set the Suspended role to <@&${roleID}>`;
}

exports.setSuspendRole = setSuspendRole;


/**
 * HELP COMMANDS
 * Staff Access
 * Remove Staff Access
 * Member Access
 * Remove Member Access
 * Vet access
 * Remove vet access
 * Booster access
 * Remove booster access
 */

exports.accessHelp = 
`Access Role Command. \`Requires Administrator\`
Registers a role with the bot to have certain privileges. The default command registers a staff role, while subcommands register other roles.
Note: By default, only the bot-generated roles have access to the AFK check system. You can unregister these at your leisure, but be sure to re-register other roles to avoid losing functionality.

**Usage**: ${CONSTANTS.botPrefix}accessRole <@roles> <privileges>

**<@roles>**: a list of space-separated mentioned roles. To mention a role, type @<rolename> and click the correct role, or type <@&roleID>.

**<privileges>**: a list of space-separated bot access privileges. Available privileges: \`${["moderator", "helper", "security", "halls", "oryx", "exaltation", "misc", "vethalls", "vetoryx", "vetexaltation", "vetmisc", "allreg", "allvet"].join(", ")}\`.
These privileges denote access to the corresponding bot commands. For example, \`halls\` access allows that role to start halls afk checks.

**Examples**: \`${CONSTANTS.botPrefix}accessRole <@&ID> allvet\` -> gives the given role permissions to use all veteran afk checks (halls, oryx, exaltation, misc)
`;

exports.removeAccessHelp = 
`Remove Access From Role Command. \`Requires Administrator\`
Unregisters a role with the bot, deleting its bot privileges. The default command unregisters a staff role, while subcommands unregister other roles.
Note: By default, only the bot-generated roles have access to the AFK check system. You can unregister these at your leisure, but be sure to re-register other roles to avoid losing functionality.

**Usage**: ${CONSTANTS.botPrefix}removeAccessRole <@roles> <privileges>

**<@roles>**: a list of space-separated mentioned roles. To mention a role, type @<rolename> and click the correct role, or type <@&roleID>.

**<privileges>**: a list of space-separated bot access privileges. Available privileges: \`${["moderator", "helper", "security", "halls", "oryx", "exaltation", "misc", "vethalls", "vetoryx", "vetexaltation", "vetmisc", "allreg", "allvet", "all"].join(", ")}\`.
These privileges denote access to the corresponding bot commands. For example, removing \`halls\` access will deny that role the ability to start halls afk checks.

**Examples**: \`${CONSTANTS.botPrefix}removeAccessRole <@&ID> allvet\` -> removes access to all veteran afk checks (halls, oryx, exaltation, misc) from this role.
`;

exports.accessMemberHelp = 
`Give a role access to raiding privileges (only users with this role can view auto-generated raid channels, configure this before using AFK system)

**Usage**: ${CONSTANTS.botPrefix}accessRole member <@roles>

**<@roles>**: a list of space-separated mentioned roles. To mention a role, type @<rolename> and click the correct role, or type <@&roleID>.
`

exports.accessVeteranHelp = 
`Give a role access to Veteran raiding privileges (only users with this role can view auto-generated Veteran raid channels, configure this before using vet AFK system)

**Usage**: ${CONSTANTS.botPrefix}accessRole veteran <@roles>

**<@roles>**: a list of space-separated mentioned roles. To mention a role, type @<rolename> and click the correct role, or type <@&roleID>.
`

exports.accessBoosterHelp = 
`Give a role access to nitro booster privileges (only users with this role can react on AFK check for early location)

**Usage**: ${CONSTANTS.botPrefix}accessRole booster <@roles>

**<@roles>**: a list of space-separated mentioned roles. To mention a role, type @<rolename> and click the correct role, or type <@&roleID>.
`

exports.removeAccessMemberHelp = 
`Deny a role access from raiding privileges (only users with these privileges can view auto-generated raid channels)

**Usage**: ${CONSTANTS.botPrefix}removeAccessRole member <@roles>

**<@roles>**: a list of space-separated mentioned roles. To mention a role, type @<rolename> and click the correct role, or type <@&roleID>.
`

exports.removeAccessVeteranHelp = 
`Deny a role access from Veteran raiding privileges (only users with these privileges can view auto-generated Veteran raid channels)

**Usage**: ${CONSTANTS.botPrefix}removeAccessRole veteran <@roles>

**<@roles>**: a list of space-separated mentioned roles. To mention a role, type @<rolename> and click the correct role, or type <@&roleID>.
`

exports.removeAccessBoosterHelp = 
`Deny a role access from nitro booster privileges (only users with these privileges can react to the AFK check for early location)

**Usage**: ${CONSTANTS.botPrefix}removeAccessRole booster <@roles>

**<@roles>**: a list of space-separated mentioned roles. To mention a role, type @<rolename> and click the correct role, or type <@&roleID>.
`

exports.clearAccessMemberHelp = 
`Clear (remove all roles from) bot member access list.`

exports.clearAccessVeteranHelp = 
`Clear (remove all roles from) bot veteran access list.`

exports.clearAccessBoosterHelp = 
`Clear (remove all roles from) bot booster access list.`


