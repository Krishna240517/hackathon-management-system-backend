const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        trim : true,
        unique : true,
    },
    email : {
        type : String,
        required : true,
        trim : true
    },
    password : {
        type : String,
        required : true,
        trim : true,
    },
    role : {
        type : String,
        required : true,
    },
    photo : {
        type : String,
        required : false
    }
})




const user = mongoose.model('user',userSchema);

module.exports = user;