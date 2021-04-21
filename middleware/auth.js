const { name } = require('ejs')
const jwt = require('jsonwebtoken')
const {User,Session} = require('../models/User.js')
const { v4: uuidv4 } = require('uuid');
const validate = require("./validate")
const secret = "accessTokenSecret"


const createAndSave = async function(req,res, next){
    let {username, password} = req.body; 

    
    
    (async () => await User.create({
        username:username,
        password: password
    })) ();

    if( await validate.checkDuplicateUsername(username)){
       return res.redirect("/tryAgain")
    }
    next();

}


const signToken = async(req,res,next)=>{
    const {username,password} =req.body;
    let check = await User.findOne({
        where: {
            username: username,
            password: password
        }
    })
    if(check){
        if(username === check.username && password ==check.password){
            let token =jwt.sign({username:username},secret);
            (async () => await User.update({userNameToken:token},{
                where:{
                    username:username,
                    password: password,
                    userNameToken: null
                }
            })) ();
            return next();
        }
        else{
            res.status(403).json({msg:"Crediantials not Correct"})
        }
    }

    else{
        res.status(403).json({msg: "No email and password provided"})
    }
}

const verifyToken = async (req,res,next)=> {

    let user = await User.findOne({
        where: {
            username: req.body.username,
            password: req.body.password
        }}
    );
    try {
    const token = user.userNameToken;
    if(token){
        jwt.verify(token, secret,(err,decoded)=>{
            if(err) {
                req.error = "username Not verified";
                res.redirect("/")
            }
            if(decoded){
                req.decoded = decoded.username

                let id =uuidv4();

               (async () => await Session.create({
                       ssnName: decoded.username,
                       sessionId: id,
                       currentUserId: user.id
                        }
                     )) ();

                     res.cookie('SID',id, { 
                        expires: new Date(Date.now() + 9000000),
                        httpOnly: true 
                    })
                    res.locals.nextId = user.id
                
                next();
            }
        })
    }
    }
    catch(err){
        console.log("errrror at tweet created")
        next();
    }
}


let checkSession = async function(id){
    let check = await Session.findOne({
        where:{
            sessionId: id
        }
    })
    let result =false
    if (check.sessionId=== null || check.sessionId ===undefined){
        result = true
    }
     return result;
}

let checklogIn = function (id){
    let result = false
if (id===undefined || id ===null){
   result = true  
}

return result
}

let getSessionName = async function(id){
    let uname = await Session.findAndCountAll({
        where:{
            sessionId: id
        }
    })
    console.log("find ssn Nameeeeeeeeeeeeeeeee")
    console.log(uname.rows)
    return uname.rows[uname.count-1].dataValues.ssnName;
}


module.exports= {signToken,verifyToken,createAndSave,checkSession,checklogIn, getSessionName}
