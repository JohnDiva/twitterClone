const {Sequelize,Model,Op, DataTypes} = require('sequelize');
//const sequelize = require('../db.js')
const sequelize = new Sequelize('sqlite::memory:');

class User extends Model {}
User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    userNameToken: DataTypes.STRING
},  { sequelize,modelName: "user" });

class Tweet extends Model {}
Tweet.init({
    content: DataTypes.STRING,
    timeCreated: DataTypes.DATE
}, {sequelize, modelName: "tweet"});

class Session extends Model {}
Session.init({
    ssnName: DataTypes.STRING,
    sessionId: DataTypes.UUIDV4
},{sequelize, modelName: "session"});


class Upvote extends Model{}
Upvote.init({
    score: DataTypes.INTEGER,
    text: DataTypes.STRING
},{ sequelize})

Upvote.hasOne(Tweet);
Tweet.belongsTo(Upvote,{foreignKey:"likeId"});

User.hasOne(Session);
Session.belongsTo(User,{foreignKey: "currentUserId"});

User.hasMany(Tweet);
Tweet.belongsTo(User,{foreignKey: "userId"});

(async ()=>{
    await sequelize.sync({force:true})
}) ();


module.exports = {User, Tweet,Session,Upvote}