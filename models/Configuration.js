const mongoose = require("mongoose");
const {Schema} = mongoose;

const configurationSchema = new Schema(
    {
        name:String,
        groupMessage:Boolean,
        selfMessage:Boolean,
        sharedMessage:Boolean,
        translateMessage:Boolean,
        saveMessage:Boolean,
        numberPhoneWhatsapp:String,
        onlyContactList:Boolean,
        listContact:Array,
        sdkOpenIA:String,
        qrCode:String,        
        userId:mongoose.ObjectId,        
        userName:String,
        active:Boolean,
        isAuthenticate:Boolean
    },
    {
        timestamps:true
    }
)

const Configuration = mongoose.model("Configuration", configurationSchema);

module.exports = Configuration;