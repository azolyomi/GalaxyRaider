const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const RAIDCONSTANTS = require("./RAIDCONSTANTS");
const ReactionHandler = require('eris-reactions');
const isImageURL = require('valid-image-url');

function changereqsheet(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";

    let dungeon = args.shift();
    if (!dungeon || (!RAIDCONSTANTS.acceptableRunTypes.includes(dungeon) && dungeon != "all")) return `Dungeon type must be one of ${RAIDCONSTANTS.acceptableRunTypes.join(", ")}`;
    let url = args.shift();
    if (!isImageURL(url)) return "Image URL must be a valid image and a valid URL. To use a discord image, right click it and hit 'Copy Link'.";
    if (dungeon == "all") {
        CONFIG.SystemConfig.servers[msg.guildID].defaultreqsheets.forEach(slot => {
            slot = url
        })
        CONFIG.updateConfig(msg.guildID);
        return ("All requirement sheets updated.");
    }
    else {
        let index = RAIDCONSTANTS.acceptableRunTypes.indexOf(dungeon);
        CONFIG.SystemConfig.servers[msg.guildID].defaultreqsheets[index] = url;
        CONFIG.updateConfig(msg.guildID);
        return (`Requirement sheet for \`${dungeon}\` updated.`);
    }
    

    
}

exports.changereqsheet = changereqsheet;

exports.helpMessage = 
`Change Req Sheet Command
Used to alter the default req sheet posted in the AFK check for a specific AFK check type.

**Usage**: \`.changereqsheet <dungeonType> <newReqSheetURL>\`

**<dungeonType>**: The type of dungeon, one of \`[all, ${RAIDCONSTANTS.acceptableRunTypes.join(", ")}]\`

**<newReqSheetURL>** The URL for the new req sheet. Must be a valid image URL. To use a Discord image, right click it and hit 'Copy Link'.

**Example**: \`.changereqsheet all https://xyz.com/abc.png\` -> will set all req sheets to this URL. (Note: this is an invalid URL and will not work.)`