const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;
var cron = require('node-cron');

cron.schedule("* * * * *", () => {
    updateSuspensions();
})

function updateSuspensions() {
    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err)
        var dbo = db.db("GalaxyRaiderDB");
        await dbo.collection("GalaxySuspensions").updateMany({duration: {$gt: 0}, currentlySuspended: true}, {$inc: {duration: -1}}); // update all suspensions with positive duration in the collection, decrement by *1* minute;
        await dbo.collection("GalaxySuspensions").find({duration: {$lte: 0}, currentlySuspended: true}).forEach(async function(suspensionObject) {
        let guildID = suspensionObject.guildID;
        let guildName = suspensionObject.guildName;
        readdroles(suspensionObject.UID, guildID, suspensionObject.previousRoleIDs);
        suspensionObject.currentlySuspended = false;
        suspensionObject.duration = 0;
        suspensionObject.previousRoleIDs = [];
        suspensionObject.history.push({
            reason: suspensionObject.reason,
            suspenderID: suspensionObject.suspenderID,
            date: suspensionObject.date,
            duration: suspensionObject.duration
        });
        suspensionObject.reason = "";
        suspensionObject.suspenderID = "";
        suspensionObject.date = "";

        dbo.collection("GalaxySuspensions").updateOne({UID: suspensionObject.UID, guildID: suspensionObject.guildID}, {$set: suspensionObject});

        if (CONSTANTS.bot.getChannel(CONFIG.SystemConfig.servers[suspensionObject.guildID].logchannel))
            CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[suspensionObject.guildID].logchannel, {
            embed: {
                title: `User Unsuspended`,
                description: 
                `Successfully unsuspended user <@${suspensionObject.UID}>.
                
                **Unsuspender:** Automatic (Galaxy Raider)
                **Reason:** Time has been served!
                **Date of unsuspension:** ${new Date().toUTCString()}
                `,
                color: 0x2ECC71,
            }
        });

        let dmChannel = await CONSTANTS.bot.getDMChannel(suspensionObject.UID);
        dmChannel.createMessage({
            embed: {
                title: `User Unsuspended`,
                description: 
                `You have been unsuspended in **${guildName}**.
                
                **Unsuspender:** Automatic (Galaxy Raider)
                **Reason:** Time has been served!
                **Date of unsuspension:** ${new Date().toUTCString()}
                `,
                color: 0x2ECC71,
            }
        })


        })
        db.close();
    })
}

async function readdroles(UID, guildID, previousRoleIDs) {
    let roles = (await CONSTANTS.bot.getRESTGuild(guildID)).roles;
    let rolesToGiveBack = roles.filter(role => previousRoleIDs.includes(role.id));
    rolesToGiveBack.forEach(role => {
        CONSTANTS.bot.addGuildMemberRole(guildID, UID, role.id, "Unsuspension")
        .catch((error) => {
            console.log("Role reassignment on unsuspension failed due to permissions.");
        });
    });
    if (roles.find(role => role.id == CONFIG.SystemConfig.servers[guildID].suspendrole)) 
        CONSTANTS.bot.removeGuildMemberRole(guildID, UID, CONFIG.SystemConfig.servers[guildID].suspendrole, "Unsuspension")
        .catch((error) => {
            console.log("Suspended role removal on unsuspension failed due to permissions.");
        });
}

async function unsuspend(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "You first have to configurate the server. Type \`.instructions\` for help.";
    if (msg.mentions.length < 1) return "You have to mention a member. To mention a member, type <@memberid>";

    let roles = (await CONSTANTS.bot.getRESTGuildRoles(msg.guildID)).map(item => {return item.id});
    if (!CONFIG.SystemConfig.servers[msg.guildID].suspendrole || !roles.includes(CONFIG.SystemConfig.servers[msg.guildID].suspendrole)) return "You haven't properly configurated the suspend role in your server. Do \`.instructions\` for more information.";
    args.shift();
    let member = await CONSTANTS.bot.getRESTGuildMember(msg.guildID, msg.mentions[0].id);
    let reason = args.join(" ");
    
    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let suspensionObject = await dbo.collection("GalaxySuspensions").findOne({UID: member.id, guildID: msg.guildID, currentlySuspended: true})
        if (suspensionObject) {
            readdroles(suspensionObject.UID, suspensionObject.guildID, suspensionObject.previousRoleIDs);
            suspensionObject.currentlySuspended = false;
            suspensionObject.history.push({
                reason: suspensionObject.reason,
                suspenderID: suspensionObject.suspenderID,
                date: suspensionObject.date,
                duration: suspensionObject.duration,
            });
            suspensionObject.duration = 0;
            suspensionObject.previousRoleIDs = [];
            suspensionObject.reason = "";
            suspensionObject.suspenderID = "";
            suspensionObject.date = "";

            dbo.collection("GalaxySuspensions").updateOne({UID: suspensionObject.UID, guildID: suspensionObject.guildID}, {$set: suspensionObject});
            CONSTANTS.bot.createMessage(msg.channel.id, {
                embed: {
                    title: `User Unsuspended`,
                    description: 
                    `Successfully unsuspended user ${member.mention}.
                    
                    **Unsuspender:** ${msg.member.mention}
                    **Reason:** ${reason}
                    **Date of unsuspension:** ${new Date().toUTCString()}
                    `,
                    color: 0x2ECC71,
                }
            })

            if (CONSTANTS.bot.getChannel(CONFIG.SystemConfig.servers[msg.guildID].logchannel))
             CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                embed: {
                    title: `User Unsuspended`,
                    description: 
                    `Successfully unsuspended user ${member.mention}.
                    
                    **Unsuspender:** ${msg.member.mention}
                    **Reason:** ${reason}
                    **Date of unsuspension:** ${new Date().toUTCString()}
                    `,
                    color: 0x2ECC71,
                }
            })

            let dmChannel = await CONSTANTS.bot.getDMChannel(member.id);
            dmChannel.createMessage({
                embed: {
                    title: `User Unsuspended`,
                    description: 
                    `You have been unsuspended in **${msg.guild.name}**.
                    
                    **Unsuspender:** ${msg.member.mention};
                    **Reason:** ${reason}
                    **Date of unsuspension:** ${new Date().toUTCString()}
                    `,
                    color: 0x2ECC71,
                }
            })
            db.close();
        }
        else {
            CONSTANTS.bot.createMessage(msg.channel.id, `That user isn't currently suspended.`);
            db.close();
        }
    })
}
exports.unsuspend = unsuspend;

async function suspend(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "You first have to configurate the server. Type \`.instructions\` for help.";
    else if (!msg.member.roles.some(role => CONFIG.SystemConfig.servers[msg.guildID].securityroles.includes(role))) return "You need to have a security role that is configured with the bot for that to work.";
    else if (msg.mentions.length < 1) return "You have to mention a member. To mention a member, type <@memberid>";
    else if (args.length < 4) return "You need to specify a \`member, duration, timeType, and reason\`! Type .help suspend for more information.";

    let roles = (await CONSTANTS.bot.getRESTGuildRoles(msg.guildID)).map(item => {return item.id});
    if (!CONFIG.SystemConfig.servers[msg.guildID].suspendrole || !roles.includes(CONFIG.SystemConfig.servers[msg.guildID].suspendrole)) return "You haven't properly configurated the suspend role in your server. Do \`.instructions\` for more information.";
    args.shift();
    let member = await CONSTANTS.bot.getRESTGuildMember(msg.guildID, msg.mentions[0].id);
    let rawDuration = args.shift();
    let timeType = args.shift();
    let reason = args.join(" ");
    let duration = parseInt(rawDuration);

    let acceptableTimeTypes = ["m", "h", "d", "w"];
    if (!acceptableTimeTypes.includes(timeType)) return `Time type must be one of \`${acceptableTimeTypes.join(", ")}\``;
    if (isNaN(duration)) return `Duration must be a valid integer. You put '${duration}'`;
    if (duration > 999) return `Please enter a value less than 1000.`;
    if (reason.length > 100) return `That reason is too long.`;

    switch(timeType) {
        case "m": break;
        case "h": 
            duration*=60;
            break;
        case "d":
            duration *=1440;
            break;
        case "w":
            duration *= 10080;
            break;
        default: break;
    }
    let oldMemberRoles = member.roles;

    member.roles.forEach(async roleID => {
        CONSTANTS.bot.removeGuildMemberRole(msg.guildID, member.id, roleID, `Suspension issued by ${msg.author.username}`)
        .catch((error) => {
            CONSTANTS.bot.createMessage(msg.channel.id, "Warning: Target's roles include one or more roles that are higher than the bot's highest role, this role will not be removed upon unsuspension.");
        });
    })
    
    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = (await dbo.collection("GalaxySuspensions").findOne({UID: member.id, guildID: msg.guildID})) 
        if (!foundEntry) {
            let suspensionObject = {
                currentlySuspended: true,
                UID: member.id,
                UNAME: member.username,
                guildID: msg.guildID,
                guildName: msg.guild.name,
                duration: duration,
                previousRoleIDs: oldMemberRoles,
                reason: reason,
                suspenderID: msg.member.id,
                date: new Date().toUTCString(),
                history: []
            }
            dbo.collection("GalaxySuspensions").insertOne(suspensionObject);
            
            await CONSTANTS.bot.addGuildMemberRole(msg.guildID, member.id, CONFIG.SystemConfig.servers[msg.guildID].suspendrole)
            .catch((error)=> {
                CONSTANTS.bot.createMessage(msg.channel.id, 'Failed to assign suspended role. Ensure that this role is below the bot\`s highest role.')
            });

            CONSTANTS.bot.createMessage(msg.channel.id, {
                embed: {
                    title: `Suspension Issued`,
                    description: 
                    `Successfully suspended user ${member.mention} for ${rawDuration} ${timeType}.
                    
                    **Suspender:** ${msg.member.mention}
                    **Reason:** ${reason}
                    **Date of unsuspension:** ${new Date(new Date().getTime() + duration*60000).toUTCString()}
                    `,
                    color: 0xE74C3C,
                }
            })

            if (CONSTANTS.bot.getChannel(CONFIG.SystemConfig.servers[msg.guildID].logchannel)) CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                embed: {
                    title: `Suspension Issued`,
                    description: 
                    `Successfully suspended user ${member.mention} for ${rawDuration} ${timeType}.
                    
                    **Suspender:** ${msg.member.mention}
                    **Reason:** ${reason}
                    **Date of unsuspension:** ${new Date(new Date().getTime() + duration*60000).toUTCString()}
                    `,
                    color: 0xE74C3C,
                }
            });

            let dmChannel = await CONSTANTS.bot.getDMChannel(member.id);
            dmChannel.createMessage({
                embed: {
                    title: `Suspension Issued`,
                    description: 
                    `You have been suspended in **${msg.guild.name}** 
                    
                    **Suspension length**: ${rawDuration} ${timeType}.
                    **Suspender**: ${msg.member.mention};
                    **Reason**: ${reason}
                    **Date of unsuspension**: ${new Date(new Date().getTime() + duration*60000).toUTCString()}
                    `,
                    color: 0xE74C3C,
                }
            })
            db.close();
        }
        else {
            let suspensionObject = foundEntry;

            suspensionObject.UNAME = member.username;
            suspensionObject.currentlySuspended = true;
            suspensionObject.duration = duration;
            suspensionObject.previousRoleIDs = oldMemberRoles;
            suspensionObject.reason = reason;
            suspensionObject.suspenderID = msg.member.id;
            suspensionObject.date = new Date().toUTCString();

            dbo.collection("GalaxySuspensions").updateOne({UID: member.id, guildID: msg.guildID}, {$set: suspensionObject});
            await CONSTANTS.bot.addGuildMemberRole(msg.guildID, member.id, CONFIG.SystemConfig.servers[msg.guildID].suspendrole)
            .catch((error) => {
                CONSTANTS.bot.createMessage(msg.channel.id, 'Failed to assign suspended role. Ensure that this role is below the bot\`s highest role.')
            });

            CONSTANTS.bot.createMessage(msg.channel.id, {
                embed: {
                    title: `Suspension Issued`,
                    description: 
                    `Successfully suspended user ${member.mention} for ${rawDuration} ${timeType}.
                    
                    **Suspender:** ${msg.member.mention}
                    **Reason:** ${reason}
                    **Date of unsuspension:** ${new Date(new Date().getTime() + duration*60000).toUTCString()}
                    `,
                    color: 0xE74C3C,
                }
            });

            if (CONSTANTS.bot.getChannel(CONFIG.SystemConfig.servers[msg.guildID].logchannel)) CONSTANTS.bot.createMessage(CONFIG.SystemConfig.servers[msg.guildID].logchannel, {
                embed: {
                    title: `Suspension Issued`,
                    description: 
                    `Successfully suspended user ${member.mention} for ${rawDuration} ${timeType}.
                    
                    **Suspender:** ${msg.member.mention}
                    **Reason:** ${reason}
                    **Date of unsuspension:** ${new Date(new Date().getTime() + duration*60000).toUTCString()}
                    `,
                    color: 0xE74C3C,
                }
            });

            let dmChannel = await CONSTANTS.bot.getDMChannel(member.id);
            dmChannel.createMessage({
                embed: {
                    title: `Suspension Issued`,
                    description: 
                    `You have been suspended in **${msg.guild.name}** 
                    
                    **Suspension length**: ${rawDuration} ${timeType}.
                    **Suspender**: ${msg.member.mention}
                    **Reason**: ${reason}
                    **Date of unsuspension**: ${new Date(new Date().getTime() + duration*60000).toUTCString()}
                    `,
                    color: 0xE74C3C,
                }
            })
            db.close();
        }
    })
}
exports.suspend = suspend;

exports.rolePersist = function(guild, member) {
    if (!CONFIG.SystemConfig.servers[guild.id] || !CONFIG.SystemConfig.servers[guild.id].suspendrole) return;
    MongoClient.connect(process.env.DBURL, function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let entry = dbo.collection("GalaxySuspensions").findOne({UID: member.id, guildID: guild.id});
        if (entry.currentlySuspended) {
            member.addRole(CONFIG.SystemConfig.servers[guild.id].suspendrole);
        }
        db.close();
    })
}

exports.suspendHelp = 
`Suspend Command.
Used to temporarily deny a member access to parts of the server. Removes all of that member's roles and stores them, then assigns them the server's configured 'Suspended' role.

_If you configurate a suspended role higher than the bot's highest role, it will not be assigned to the user.
Suspending a user with any roles higher than the bot's highest role will not remove these roles._

**Usage**: \`.suspend <@user> <duration> <timeType> <reason>\`

**<@user>**: A mention of the user you'd like to suspend. To mention a user, type <@userid>

**<duration>**: The duration of time you'd like to suspend for, as an integer.

**<timeType>**: One of \`[m, h, d, w]\` to designate \`[minutes, hours, days, or weeks]\`

**<reason>**: The reason for suspension. This is the reason that will be catalogued in the database for future reference.

**Example**: \`.suspend <@userid> 3 d Too cute for my liking\` -> suspends the user for 3 days, for reason "Too cute for my liking"`;

exports.unsuspendHelp = 
`Unsuspend Command
Used to unsuspend a user. For more information on suspend, type \`.help suspend\`.

**Usage**: \`.unsuspend <@user> <?reason>\`

**<@user>**: A mention of the user you'd like to unsuspend. To mention a user, type <@userid>

**<?reason>**: Optional: the reason for unsuspension (will be delivered to the user).

**Example**: \`.unsuspend <@userid> time's up!\` -> unsuspends <@userid> for reason "time's up"
`;

/** STRUCTURE
 * 
 * 
 * {
 *  
 *        {
 *          currentlySuspended: bool,
 *          UID: #,
 *          guildID: #,
*           duration: #,
*           previousRoleIDs: [],
*           reason: "",
*           suspenderID: #,
*           date: date,
*           history: [{reason: "", suspenderID: #, date: date}, {...}]
 *        },
 *  
 *  }
 * 
 * }
 */