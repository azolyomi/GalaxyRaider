const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

function suspendList(msg, args) {
    let fields = [];

    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        await dbo.collection("GalaxySuspensions").find({guildID: msg.guildID, currentlySuspended: true}).forEach(entry => {
            fields.push({
                name: `Suspension for: ${entry.UNAME}`,
                value:
                `**Mention:** <@${entry.UID}>
                **Remaining Time:** ${entry.duration} minutes
                **Previous Roles:** ${entry.previousRoleIDs.filter(item => item != CONFIG.SystemConfig.servers[msg.guildID].suspendrole).map(item => {return `<@&${item}>`}).join(", ")}
                **Reason:** ${entry.reason}
                **Suspender:** <@${entry.suspenderID}>
                **Date Suspended:** ${entry.date}
                **Date Unsuspended:** ${new Date(new Date().getTime() + entry.duration*60000).toUTCString()}`,
                inline: true,
            })
        })

        while (fields.length > 4) {
            let messageFields = fields.splice(0, 4);
            CONSTANTS.bot.createMessage(msg.channel.id, {
                embed: {
                    title: "Suspend List",
                    fields: messageFields,
                    color: 3145463
                }
            })
        }
    
        let messageFields = fields.splice(0, fields.length);
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: "Suspend List",
                fields: messageFields,
                color: 3145463
            }
        })

        db.close();
    })  
}

exports.suspendList = suspendList;

exports.helpMessage = 
`SuspendList command.
Used to print out a list of all currently suspended users.`
