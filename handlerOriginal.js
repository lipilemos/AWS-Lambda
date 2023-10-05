'use strict';
//const AWS = require('aws-sdk')
const serverless = require('serverless-http')
// db connection
require("./config/db.js");
const express = require("express");
const path = require("path");

// const cors = require("cors");
// const port = process.env.PORT;

const app = express();


// Config JSON and form data response
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Solve CORS
//app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
//app.use(cors())

// Upload directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));


// routes
const router = require("./routes/Router.js");

app.use(router);


export const handler = serverless(app)



// app.listen(port, () => {
//   console.log(`App rodando na porta ${port}`);
// });






// module.exports.hello = async ({Records:records}, context) => {

//   try {
//     await Promisse.all(records.map(async records =>{
//       const {key} = records.s3.objct
      
//       const image = await S3.getObject({
//         Bucket: process.env.bucket,
//         Key:key
//       }).promise();
//       }))
//   } catch (error) {
    
//   }
//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Your function executed successfully!',
//         input: event,
//       },
//       null,
//       2
//     ),
//   };

//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };
