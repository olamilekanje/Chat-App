const crypto = require("crypto");

function generateUniqueChars(lenght = 32){
    return crypto
    .randomBytes(Math.ceil(lenght/2))
    .toString("hex")
    .slice(0, lenght)


}

module.exports.generateUniqueChars = generateUniqueChars;