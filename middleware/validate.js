const {User} = require('../models/User.js')

let checkDuplicateUsername = async function(entry){
    let user = await User.findAndCountAll({
        attributes: ['username'],
        where:
        {username: entry
        }
    })
    let result = false
    if( user.count >= 2){
        result= true
    }
    console.log('lllllllllllllllllllllllllll')

    return result;
}


module.exports = {checkDuplicateUsername}