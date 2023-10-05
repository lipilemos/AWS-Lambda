const TypesPlans = require("../models/TypesPlans")
const mongoose = require("mongoose")
const Promise = require('bluebird');
mongoose.Promise = Promise;
//get all types plans
module.exports.getAllTypesPlans = async (event, context, callback) =>{
    console.log(event)
    const typesPlans = await TypesPlans.find({}).sort([["createdAt", -1]]).exec()

    callback(null, {
        statusCode: 200,
        body: JSON.stringify(typesPlans),
      })
    return 
    //return res.status(200).json(typesPlans)
}
//get types plans by id
module.exports.getTypesPlansById = async (event, context,   callback) => {
    const {id} = event.pathParameters.id

    const typesPlans = await TypesPlans.findById(new mongoose.Types.ObjectId(id))

    if(!typesPlans)
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({erro:"id invalido"}),
        })
        //return res.status(404).json({erros:["Plano não encontrado"]})

    callback(null, {
        statusCode: 200,
        body: JSON.stringify(typesPlans),
        })
    return 

    //return res.status(200).json(typesPlans)
}

// module.exports = {
//     getAllTypesPlans, getTypesPlansById
// }