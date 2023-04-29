const moongose = require('mongoose');
const userSchema = require('./UserSchema');

const PostSchema = new moongose.Schema({

 title:String,
 description:String,
 imgUrl:String,
 article:String,
 author:{
    type: moongose.Schema.Types.ObjectId,
    ref: 'userRegister'
}
},
 {
    timestamps:true
});

const Post  = moongose.model('Post',PostSchema);
module.exports = Post;

