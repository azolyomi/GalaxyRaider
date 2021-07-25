const CONSTANTS = require("../../config/constants");
const CONFIG = require("../../config/config");
const RAIDCONSTANTS = require("../../raiding_functions/RAIDCONSTANTS");

const acceptablePromoVoteTypes = ["event", "halls", "oryx", "fullskip", "exalted", "officer"];

const ROLEINFO = {
    Roles: {
        MemberID: "522817975091462147",
        BalerJRID: "522847698727206922",
        BalerID: "761404286978228244",
        BoosterID: "761400620086329345",
        HeartRoleID: "779574044919726130",
        PatreonOmegaID: "787216345451462696",
        PatreonID: "787216255614058506",
        SuspendedID: "522847611649130506",
    
        //ping roles:
        VoidPing: "791828348388900914",
        CultPing: "791828591838232626",
        ShattersPing: "791828751314976800",
        NestPing: "791828862300454913",
        FungalPing: "791828982022012939",
        O3Ping: "791829025055834124",
        MiscPing: "791829177376047104",
    },
    StaffRoles: {
        Syphilis: "761994942225580042",
        Admin: "522816371755712515",
        ModeratorID: "522816654091223051",
        BotMakerID: "768482286429405295",
        HeadLeaderID: "761211992438472744",
        OfficerID: "780306791212122153",
        ExaltedLeaderID: "765649870979596299",
        SecurityID: "761313993159475280",
        OryxLeaderID: "780515270446940161",
        OryxARLID: "780543201333215295",
        HallsLeaderID: "779512163923525672",
        HallsARLID: "790743719112343553",
        EventOrganizerID: "790331735631593472",
        TrialRaidLeaderID: "522817272616583181",
        FullskipID: "784456967414218772",
    }
}

exports.execute = promoVote;
exports.fulldesc = 
`Promotion Vote Command.
**Usage:** \`.promovote <type> <username>\`
**<type>:** The type of promotion vote. One of \`[${acceptablePromoVoteTypes.join(", ")}]\`
**<username>** The name of the user to promote
_Example:_ \`.promovote halls Theurul\``;

async function promoVote(msg, args) {
    if (args.length < 2) return `Must include both a type and the name of the member to promote.`;
    let type = args.shift().toLowerCase();
    let name = args.shift();
    if (!acceptablePromoVoteTypes.includes(type)) return `Type must be one of \`[${acceptablePromoVoteTypes.join(", ")}]\``;

    CONSTANTS.bot.createChannel(CONSTANTS.STDGuildID, `⏫│${name}-${type}-vote`, 0, `${type} promo vote for ${name}`, {
        parentID: "804155260867182652",
        topic: `${type} promotion vote for ${name}`, // Not necessary for Voice Channel
        permissionOverwrites: getPermissionOverwriteArray(type),
    })

    let command = await CONSTANTS.bot.getMessage(msg.channel.id, msg.id);
    command.addReaction(RAIDCONSTANTS.checkReaction);
}


function getPermissionOverwriteArray(type) {
    switch(type) {
        case "event":
            return [
                {
                    id: CONSTANTS.STDGuildID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.SuspendedID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.MemberID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerJRID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.EventOrganizerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.TrialRaidLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.SecurityID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.ExaltedLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.HeadLeaderID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
                {
                    id: ROLEINFO.StaffRoles.ModeratorID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
            ];
        case "halls":
            return [
                {
                    id: CONSTANTS.STDGuildID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.SuspendedID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.MemberID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerJRID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.EventOrganizerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.TrialRaidLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.SecurityID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.ExaltedLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.HeadLeaderID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
                {
                    id: ROLEINFO.StaffRoles.ModeratorID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
            ];
        case "oryx":
            return [
                {
                    id: CONSTANTS.STDGuildID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.SuspendedID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.MemberID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerJRID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.EventOrganizerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.TrialRaidLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.SecurityID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.ExaltedLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.HeadLeaderID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
                {
                    id: ROLEINFO.StaffRoles.ModeratorID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
            ];
        case "fullskip":
            return [
                {
                    id: CONSTANTS.STDGuildID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.SuspendedID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.MemberID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerJRID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.EventOrganizerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.TrialRaidLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.SecurityID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.FullskipID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.ExaltedLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.HeadLeaderID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
                {
                    id: ROLEINFO.StaffRoles.ModeratorID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
            ];
        case "exalted":
            return [
                {
                    id: CONSTANTS.STDGuildID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.SuspendedID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.MemberID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerJRID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.EventOrganizerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.TrialRaidLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.SecurityID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.ExaltedLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.HeadLeaderID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
                {
                    id: ROLEINFO.StaffRoles.ModeratorID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
            ];
        case "officer":
            return [
                {
                    id: CONSTANTS.STDGuildID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.SuspendedID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.MemberID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerJRID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.Roles.BalerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.EventOrganizerID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.TrialRaidLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.SecurityID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.HallsLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxARLID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OryxLeaderID,
                    type: 0,
                    allow: 0,
                    deny: 523328,
                },
                {
                    id: ROLEINFO.StaffRoles.OfficerID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.ExaltedLeaderID,
                    type: 0,
                    allow: 66624,
                    deny: 2048,
                },
                {
                    id: ROLEINFO.StaffRoles.HeadLeaderID,
                    type: 0,
                    allow: 523328,
                    deny: 0,
                },
                {
                    id: ROLEINFO.StaffRoles.ModeratorID,
                    type: 0,
                    allow: 523344,
                    deny: 0,
                },
            ];
        default: break;
    }
}