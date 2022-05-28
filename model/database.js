const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://Adrian:LdOa9PxWDEHJruph@computervison.8ipsi.mongodb.net/?retryWrites=true&w=majority`);
//Make schema
const users = mongoose.model('users',{
    nama : {
        type : String,
    },
    email : {
        type: String
    },
    password: {
        type : String
    }
})
module.exports = users

//module.exports = users
//Add 1 data
// const user = new users({
//     nama : "Adrian Arman",
//     email : "adrian.arman02@gmail.com",
//     password : "arman123"
// })
// //simpan ke collection 
//user.save().then((users)=>console.log(users));