const crypto = require('crypto')

function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 60, 'sha512').toString('hex');
    return hash === hashVerify;
}
function genPassword(password) {
    let salt = crypto.randomBytes(64).toString('hex')
    let newHash = crypto.pbkdf2Sync(password, salt, 10000, 60, 'sha512').toString('hex');
    return {salt:salt, hash:newHash};
}

module.exports = {
    validPassword,
    genPassword
}