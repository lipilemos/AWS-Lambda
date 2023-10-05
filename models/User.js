const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema(
    {
        name:String,
        cpf:String,
        email:String,
        password:String,
        profileImage:String,
        comment:String,
        active:Boolean
    },
    {
        timestamps:true
    }
)

const User = mongoose.model("User", userSchema);

module.exports = User;