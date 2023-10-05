const mongoose = require("mongoose");

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
//connection
const conn = async () =>{
    try {
        const dbConn = await mongoose.connect(`mongodb+srv://${user}:${pass}@clustertramposfloripa.4hhozte.mongodb.net/ZapGPT?retryWrites=true&w=majority`);
        console.log("CONECTADO AO BANCO ");
        return dbConn;
    } catch (e) {
        console.log(e)
    }
}
conn();

module.exports = conn;