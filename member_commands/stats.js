const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

function fetchStats(msg, args) {
    // get info on a user and print out in embed
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";

    let user = msg.member;

    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let itemLogsEntry = await dbo.collection("GalaxyItemLogs").findOne({UID: user.id, guildID: msg.guildID});
        let keys = 0, vials = 0, runes = 0, points = 0;
        if (itemLogsEntry) {
            keys = itemLogsEntry.keys;
            vials = itemLogsEntry.vials;
            runes = itemLogsEntry.runes;
            points = itemLogsEntry.points;
        }
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "User Stats",
                description: 
                `**Name:** ${user.nick?user.nick:user.username}
                **Mention:** ${user.mention}
                **Keys:** ${keys}
                **Vials:** ${vials}
                **Runes:** ${runes}
                **Points:** ${points}
                `,
                color: 3145463
            }
        })
        db.close();
    })

}

exports.fetchStats = fetchStats;

exports.helpMessage = 
`Fetch User Stats Command

Displays logged items for the user.`;