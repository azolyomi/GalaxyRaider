const CONFIG = require("../config/config");

function setRunPoints(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";
    else if (args.length < 2) return `You must have two arguments: a type and a value. For more information, do \`.help setrunpoints\``
    let acceptablePointsTypes = ["void", "cult", "fullskip", "shatters", "nest", "fungal", "o3", "misc"];

    let type = args.shift();
    if (!acceptablePointsTypes.includes(type)) return `Type must be one of \`[${acceptablePointsTypes.join(", ")}]\``;

    let points = args.shift();
    if (isNaN(points)) return `Point value must be a number.`;
    points = parseInt(points);

    CONFIG.SystemConfig.servers[msg.guildID].runpoints[`${type}`] = points;
    CONFIG.updateConfig(msg.guildID);
    return {
        embed: {
            title: "Success!",
            description: `Successfully updated the point value for **${type}** to \`${points}\``,
            color: 3145463
        }
    }
}

exports.setRunPoints = setRunPoints;

exports.helpMessage = 
`SetRunPoints Command
Used to set the number of points assigned to a <runType> for run logging purposes.

**Usage**: \`.setrunpoints <runType> <points>\`

**<runType>**: The type of item, one of \`[void, cult, fullskip, shatters, nest, fungal, o3, misc]\`

**<points>**: An integer number of points.

**Example**: \`.setrunpoints void 30\` –> Sets each void run to be worth 30 points in the bot database. Does not retroactively affect points from previous logs.`;