const mongoose = require("mongoose");
const {Schema} = mongoose;

const typesPlansSchema = new Schema(
    {
        name:String,
        price:String,
        recursos: [String],
        limiteCaracteres: Number,
        limiteChamadasAPI: Number,
        limiteUso: Number,
    },
    {
        timestamps:true
    }
)

const TypesPlans = mongoose.model("TypesPlans", typesPlansSchema);

module.exports = TypesPlans;