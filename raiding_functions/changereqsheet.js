const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const RAIDCONSTANTS = require("./RAIDCONSTANTS");
const ReactionHandler = require('eris-reactions');
const isImageURL = require('valid-image-url');

function changereqsheet(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";

    let dungeon = args.shift();
    if (!dungeon || (!RAIDCONSTANTS.acceptableRunTypes.includes(dungeon) && dungeon != "all" && dungeon != "defaults")) return `Dungeon type must be one of \`[all, defaults, ${RAIDCONSTANTS.acceptableRunTypes.join(", ")}]\``;
    if (dungeon == "defaults") {
        CONFIG.SystemConfig.servers[msg.guildID].defaultreqsheets = [
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194516922073118/CultVoid.png`, // high-reqs void
            `https://cdn.discordapp.com/attachments/826194483992461383/826194540309905408/Fullskip_Void.png`, //fullskip
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194516922073118/CultVoid.png`,//fullclear highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194516922073118/CultVoid.png`, //cult highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png`, //shats highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png`, //nest highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`,
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png`, //fungal highreqs 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194539169579038/O3.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194539169579038/O3.png`,  // o3 highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`,
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png` // misc highreqs
          ];
        CONFIG.updateConfig(msg.guildID);
        return ("All requirement sheets reset to defaults.");
    }
    else {
        let url = args.shift();
        if (!isImageURL(url)) return "Image URL must be a valid image and a valid URL. To use a discord image, right click it and hit 'Copy Link'.";
        if (dungeon == "all") {
            CONFIG.SystemConfig.servers[msg.guildID].defaultreqsheets = CONFIG.SystemConfig.servers[msg.guildID].defaultreqsheets.map(slot => url);
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
    

    
}

exports.changereqsheet = changereqsheet;

exports.helpMessage = 
`Change Req Sheet Command
Used to alter the default req sheet posted in the AFK check for a specific AFK check type.

**Usage**: \`.changereqsheet <dungeonType> <newReqSheetURL>\`

**<dungeonType>**: The type of dungeon, one of \`[all, defaults, ${RAIDCONSTANTS.acceptableRunTypes.join(", ")}]\`. Defaults will reset req sheets to initial settings.

**<newReqSheetURL>** The URL for the new req sheet. Must be a valid image URL. To use a Discord image, right click it and hit 'Copy Link'. If using the \`defaults\` type, this is an unnecessary field.

**Examples**: 
    \`.changereqsheet all https://xyz.com/abc.png\` -> will set all req sheets to this URL. (Note: this is an invalid URL and will not work.)
    \`.changereqsheet defaults\` –> will reset all req sheets to original settings.`