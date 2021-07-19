const CONSTANTS = require("./constants");
const CONFIG = require("./config");

async function showInstructions(msg, args) {
    return `https://github.com/theurul/GalaxyRaider/blob/master/README.md#setup-instructions`;
}

exports.showInstructions = showInstructions;