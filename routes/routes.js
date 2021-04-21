const {Router, json} = require('express')
const {User,Tweet,Session,Upvote} = require('../models/User.js')
const router = Router();
const auth = require('../middleware/auth');
const { readyException } = require('jquery');

router.get('/', async function(req, res) {
try{
    let id = req.cookies.SID
    if (await auth.checklogIn(id) && await auth.checkSession(id)){
        return  res.render("pages/NotLogIndex.ejs")
        }

    
    let tweets = await Tweet.findAll({include:[{model:User},{model:Upvote}]});
    
    let loginUser = await auth.getSessionName(id);
    let data = {tweets, uname: loginUser}
    res.render('pages/index.ejs', data)
}

catch(err){
    
    res.redirect("/logOut")
}
})


router.get('/createUser', function(req,res){
 let data= {note: ""}
    res.render('pages/createUser.ejs',data)
})

router.get('/logIn',async function(req,res){

     if( req.cookies.SID === undefined || req.cookies.SID ===null){
    let data = {
        note: ""
    }
    res.render('pages/logIn.ejs', data)
}

else {
    res.redirect("/logOut")

}
})

router.post('/createUser',auth.createAndSave, auth.signToken, function(req,res){
    
    res.redirect('/logIn')
})


router.post('/logIn',auth.verifyToken, async function(req,res){ 
     let a = "a";
     let b = res.locals.nextId;
     let total = await User.count();
     if(total <= 1){

    (async ()=> await Tweet.create({
        content:a,
        timeCreated:null,
        userId: b,
    })) ();
    
}
try {
  
       let test = req.decoded;
       if (test ===undefined){
        let data = { note: "Unable To verify your username to yourself so you cannot log in; Click the link below"}
        res.render('pages/logIn.ejs', data)
       }

       
       res.redirect('/')
}
catch(err){
    let data = { note: "Unable To verify your username to yourself so you cannot log in; Click the link below"}
    res.render('pages/logIn.ejs', data)
}})

router.get("/myProfile/:loginUser", async function(req,res){
    let loginUser = req.params.loginUser;
    let userInfo = await User.findOne({
        where: {
            username: loginUser
        }
    })

    let nowUserId = userInfo.id;

    let tweets = await Tweet.findAll({
        where:{
            userId: nowUserId
        }
    })

    let data = {tweets, uname: loginUser}

    res.render ("pages/userHomePage.ejs", data)

} )


router.post('/createTweet',async function(req,res){
    let id = req.cookies.SID
    let {content} = req.body
try{
    let session = await Session.findOne({
        where: {
             sessionId: id }
    });
    
    
        (async() => await Tweet.destroy({
            where: {
            content: 'a',
            timeCreated:null,
            userId: session.currentUserId
            }
         }))();

 let upvote = await Upvote.create({
    score: 0,
    text: content
})

let tweet= await Tweet.create({   
    content:content,
    timeCreated: new Date(),
    userId: session.currentUserId,
    likeId: upvote.id
    })


res.redirect("/")

}
catch(err) {

      res.redirect("/logOut")
}

})



router.get("/upvote/:tweeText/:likes", async function(req,res){
    let intLikes = parseInt(req.params.likes)
    let nextInt = intLikes + 1

    let updateLikes =await Upvote.update({score:nextInt},
        {where:{
            score:intLikes,
            text: req.params.tweeText
        }})

     

    

    res.redirect("/")

})


router.get('/tryAgain', function(req,res){
    let data = {
        note: "Someone has already used this username, Please Choose a Different Username"
    }
    res.render('pages/createUser.ejs',data)
})


router.get('/logOut', function(req,res){
try {
    (async () =>{
    await Session.destroy(
        {where:{
            sessionId: req.cookies.SID
        }}
    )
    }) ();

    res.cookie('SID','', { 
        expires: new Date(Date.now()),
        httpOnly: true 
    })

    res.render('pages/NotLogIndex.ejs')
}
catch(err) {
    res.render('pages/NotLogIndex.ejs')
}
})


module.exports = router;
