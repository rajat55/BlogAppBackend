const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        require:true
    },
    email: {
        type:String,
        require:true,
        unique:true
    },
    pass:String
})

const UserModel = mongoose.model('userRegister',userSchema);
module.exports = UserModel;