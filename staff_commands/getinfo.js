const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const find = require("./find");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

function getInfo(msg, args) {
    // get info on a user and print out in embed
    // info should include suspend history, currently suspended?, keys, vials, runes, POINTS
    // -> update it so you can set points for each log type
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";
    else if (msg.mentions.length < 0) return "You need to mention a user. To mention a user, type <@userid>";

    let user = msg.mentions[0];

    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let suspensionEntry = await dbo.collection("GalaxySuspensions").findOne({UID: user.id, guildID: msg.guildID});
        let currentlySuspended = false, history = null;
        if (suspensionEntry) {
            currentlySuspended = suspensionEntry.currentlySuspended;
            history = suspensionEntry.history;
        }
        let itemLogsEntry = await dbo.collection("GalaxyItemLogs").findOne({UID: user.id, guildID: msg.guildID});
        let keys = 0, vials = 0, runes = 0, points = 0;
        if (itemLogsEntry) {
            keys = itemLogsEntry.keys;
            vials = itemLogsEntry.vials;
            runes = itemLogsEntry.runes;
            points = itemLogsEntry.points;
        }
        let fields = [];
        if (history) {
            let count = 1;
            history.forEach(item => {
                fields.push({
                    name: `Suspension #${count++}`,
                    value: 
                    `Date: ${item.date}
                    Duration: ${item.duration} minute(s)
                    Reason: ${item.reason}
                    Suspender: <@${item.suspenderID}>`,
                    inline: true
                })
            })
        }

        while (fields.length > 3) {
            CONSTANTS.bot.createMessage(msg.channel.id, {
                embed: {
                    title: "Information Request",
                    description: 
                    `**Username:** ${user.username}
                    **Mention:** ${user.mention}
                    **Keys:** ${keys}
                    **Vials:** ${vials}
                    **Runes:** ${runes}
                    **Points:** ${points}
    
                    **Currently Suspended?:** ${currentlySuspended}
                    **Suspension History:**
                    `,
                    fields: fields.splice(0, 3),
                    color: 3145463
                }
            })
        }
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "Information Request",
                description: 
                `**Username:** ${user.username}
                **Mention:** ${user.mention}
                **Keys:** ${keys}
                **Vials:** ${vials}
                **Runes:** ${runes}
                **Points:** ${points}

                **Currently Suspended?:** ${currentlySuspended}
                **Suspension History:**
                `,
                fields: fields,
                color: 3145463
            }
        })
        db.close();
    })

}

exports.getInfo = getInfo;

exports.helpMessage = 
`Get Info Command
Used to get server-related info regarding the specified user.

**Usage**: \`.getinfo <@user>\`

**<@user>**: A mention of the user. To mention a user, type <@userid>.

**Example**: \`.getinfo <@myID>\` -> returns info for the user that matches the specified ID.`;