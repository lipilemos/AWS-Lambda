const mongoose = require("mongoose");
const {Schema} = mongoose;

const plansSchema = new Schema(
    {
        name:String,
        planId:mongoose.ObjectId,
        price:String,
        userId:mongoose.ObjectId,
        active:Boolean,
        paymentId:String,
        usageChamadasAPI: Number,
        usageUse: Number,
    },
    {
        timestamps:true
    }
)

const Plan = mongoose.model("Plan", plansSchema);

module.exports = Plan;