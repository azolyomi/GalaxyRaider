const CONSTANTS = require("../config/constants");
const isImageURL = require('valid-image-url');

async function say(msg, args) {
    if (args.length === 0) return "Specify a message to embed!";
    let text = args.join(" ");
    if (text.length >= 2000) return "That's too long of a message to say.";
    let title, description, color, imageurl;
    for (i = 0; i<args.length; i++) {
        if (args[i].startsWith("-title:\"")) {
            let titleText = "-title:\"";
            let titleIndex = text.indexOf(titleText);
            let textRange = text.substring(titleIndex + titleText.length, text.indexOf("\"", titleIndex + titleText.length));
            if (textRange == titleText) return "You're missing a \" somewhere!";
            title = textRange.replace("\\n", "\n");
        }
        else if (args[i].startsWith("-description:\"")) {
            let descriptionText = "-description:\"";
            let descriptionIndex = text.indexOf(descriptionText);
            let textRange = text.substring(descriptionIndex + descriptionText.length, text.indexOf("\"", descriptionIndex + descriptionText.length));
            if (textRange == descriptionText) return "You're missing a \" somewhere!";
            description = textRange.replace("\\n", "\n");
        }
        else if (args[i].startsWith("-image:")) {
            let parseImage = args[i].substring(7);
            if (!await isImageURL(parseImage)) return "The image must be a valid image url. e.g. \`https://via.placeholder.com/300/09f/fff.png\`";
            else {   
                imageurl = parseImage;
            }
        }
        else if (args[i].startsWith("-color:\"")) {
            let colorText = "-color:\"";
            let colorIndex = text.indexOf(colorText);
            let textRange = text.substring(colorIndex + colorText.length, text.indexOf("\"", colorIndex + colorText.length));
            if (textRange == colorText) return "You're missing a \" somewhere!";
            else {
                switch(textRange.toLowerCase()) {
                    case "red":
                        textRange = "FF0000";
                        break;
                    case "darkred":
                        textRange = "A80000"
                        break;
                    case "orange":
                        textRange = "FF7F00"
                        break;
                    case "brown":
                        textRange = "9C4E00"
                        break;
                    case "yellow":
                        textRange = "FFF300"
                        break;
                    case "lime":
                        textRange = "00FF11"
                        break;
                    case "green":
                        textRange = "1EC400"
                        break;
                    case "darkgreen":
                        textRange = "137E00"
                        break;
                    case "aqua":
                        textRange = "00FFFD"
                        break;
                    case "cyan":
                        textRange = "02B9B8"
                        break;
                    case "blue":
                        textRange = "000AFF"
                        break;
                    case "darkblue":
                        textRange = "0015A8"
                        break;
                    case "purple":
                        textRange = "7900FF"
                        break;
                    case "darkpurple":
                        textRange = "43028B"
                        break;
                    case "pink":
                        textRange = "FF00F7"
                        break;
                    case "magenta":
                        textRange = "FF00A8"
                        break;
                    default:
                        break;
                }
                textRange = parseInt(textRange, 16);
                color = textRange;
            }
        }
    }
    if (!title && !description && !color) return {embed:{description: text.replace("\\n", "\n")}};
    else if (!title && !description && color) return "You can't just specify a color! Tell me what to write with the -title or -description flag!";
    return {
        embed: {
            title: title?title:null,
            description: description?description:null,
            color:color?color:null,
            image: {
                url: imageurl?imageurl:null,
            }
        }
    }
}

exports.dashe = say;