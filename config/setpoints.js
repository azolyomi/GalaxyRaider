const CONFIG = require("../config/config");

function setPoints(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";
    else if (args.length < 2) return `You must have two arguments: a type and a value. For more information, do \`.help setpoints\``
    let acceptablePointsTypes = ["keys", "vials", "runes"];
    let type = args.shift();
    if (!acceptablePointsTypes.includes(type)) return `Type must be one of \`[${acceptablePointsTypes.join(", ")}]\``;

    let points = args.shift();
    if (isNaN(points)) return `Point value must be a number.`;
    points = parseInt(points);

    CONFIG.SystemConfig.servers[msg.guildID].logItemPointValues[`${type}`] = points;
    CONFIG.updateConfig(msg.guildID);
    return {
        embed: {
            title: "Success!",
            description: `Successfully updated the point value for **${type}** to \`${points}\``,
            color: 3145463
        }
    }
}

exports.setPoints = setPoints;

exports.helpMessage = 
`SetPoints Command
Used to set the number of points assigned to an <itemType> for item logging purposes.

**Usage**: \`.setpoints <itemType> <points>\`

**<itemType>**: The type of item, one of \`[keys, vials, runes]\`

**<points>**: An integer number of points.

**Example**: \`.setpoints runes 30\` –> Sets each rune to be worth 30 points in the bot database. Does not retroactively affect points from previous logs.`;