'use strict';
const mongoose = require('mongoose');
const Promise = require('bluebird');
const validator = require('validator');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require('./models/User.js');
const Plans = require('./models/Plans.js');
const Configuration = require('./models/Configuration.js');
const TypesPlans = require('./models/TypesPlans.js');

mongoose.Promise = Promise;

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
const jwtSecret = process.env.JWT_SECRET

//const aws_access_key = process.env.AWS_ACCESS_KEY
//const aws_secret_key = process.env.AWS_SECRET_KEY

const mongoString = `mongodb+srv://${user}:${pass}@clustertramposfloripa.4hhozte.mongodb.net/ZapGPT?retryWrites=true&w=majority`;

const generateToken = (id) => {
  return jwt.sign({id},jwtSecret, {expiresIn:"7d"})
}

const createErrorResponse = async (statusCode, message) => (
  {
    statusCode: statusCode || 501,
    headers: { 'Content-Type': 'text/json' },
    body: message || 'Incorrect id'
  }
);

const dbExecute = (db, fn) => db.then(fn);

const dbConnectAndExecute = async (dbUrl, fn) => {  
  return dbExecute(mongoose.connect(dbUrl),fn);
}
//#region types plans
//get type plan by id
module.exports.getTypesPlansById = async (event, context) => {
  const {id} = event.pathParameters

  const typesPlans = await dbConnectAndExecute(mongoString, async () => (
    TypesPlans.findById(new mongoose.Types.ObjectId(id))
    ));  
  
  if(!typesPlans)
      return {
        statusCode: 404,
        body: JSON.stringify({erros:["Plano não encontrado"]})
      };
  return {
    statusCode: 200,
    body: JSON.stringify(typesPlans)
  };
}
//get all types plans
module.exports.getAllTypesPlans = async (event, context) => {

  const types = await dbConnectAndExecute(mongoString, async () => (TypesPlans.find({}).sort([["createdAt", -1]]))); 
  if(!types)
      return {
        statusCode: 404,
        body: JSON.stringify({erros:["Tipos de planos não encontrados"]})
      }; 
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      'Access-Control-Allow-Origin':'*',  
    },    
    body: JSON.stringify(types)
  };

};
//#endregion
//#region plans
//get all plans
module.exports.getAllPlans = async (event, context) => {

  const plans = await dbConnectAndExecute(mongoString, async () => (Plans.find({}).sort([["createdAt", -1]]).exec()));   

  if(!plans)
      return {
        statusCode: 404,
        body: JSON.stringify({erros:["Planos não encontrados"]})
      }; 
  return {
    statusCode: 200,
    body: JSON.stringify(plans)
  };
}
//get User plans
module.exports.getUserPlans = async (event, context) => {
  const {id} = event.pathParameters
  const plans = await dbConnectAndExecute(mongoString, async () => (Plans.findOne({userId:id, active:true}).sort([["createdAt", -1]]).exec()));   
  
  if(!plans)
  return {
    statusCode: 404,
    body: JSON.stringify({erros:["Plano não encontrado"]})
  }; 
return {
statusCode: 200,
body: JSON.stringify(plans)
};
}
//get plans by id
module.exports.getPlansById = async (event, context) => {

  const {id} = event.pathParameters
  const plans = await dbConnectAndExecute(mongoString, async () => (Plans.findById(new mongoose.Types.ObjectId(id))));   

  if(!plans)
  return {
    statusCode: 404,
    body: JSON.stringify({erros:["Plano não encontrado"]})
  }; 
return {
statusCode: 200,
body: JSON.stringify(plans)
};
}
//update a plans
module.exports.updatePlans = async (event, context) => {
  const {id} = event.pathParameters
  const {planId, active, usageChamadasAPI,usageUso,paymentId} = event.body

  const reqUser = event.user
  const plans = await dbConnectAndExecute(mongoString, async () => (Plans.findById(id)));   
  if(!plans)
  {
    return {
      statusCode: 404,
      body: JSON.stringify({erros:["Plano não encontrado"]})
    }
  }
  //check if plan is user 
  if(!plans.userId.equals(reqUser._id))
  {
    return {
      statusCode: 422,
      body: JSON.stringify({erros:["Ocorreu um erro, tente novamente mais tarde."]})
    };  
  }
  if(paymentId)
  {
      plans.paymentId = paymentId
  }
  if(active)
  {
      plans.active = active
  }
  if(planId) 
  {
      plans.planId = planId
  }    
  if(usageChamadasAPI) 
  {
      plans.usageChamadasAPI = usageChamadasAPI
  }
  if(usageUso) 
  {
      plans.usageUso = usageUso
  }

  await plans.save()

  return {
  statusCode: 200,
  body: JSON.stringify(plans)
  };
}

//update usage API
module.exports.updateUsageAPI = async (event, context) => {
    const {id} = event.pathParameters
        
    const userPlans = await dbConnectAndExecute(mongoString, async () => (Plans.findOne({userId:id})));   
    const typesPlans = await dbConnectAndExecute(mongoString, async () => (TypesPlans.findById(userPlans.planId)));   

  if (!userPlans)
  {        
    return {
      statusCode: 404,
      body: JSON.stringify({erros:["Plano não encontrado"]})
    }  }
  if(!typesPlans)
  {
    return {
      statusCode: 404,
      body: JSON.stringify({erros:["Tipo de plano não encontrado"]})
    }  }
  if(userPlans.usageChamadasAPI < typesPlans.limiteChamadasAPI){
      userPlans.usageChamadasAPI += 1
      userPlans.usageUse += 1
  }
  if(userPlans.usageChamadasAPI >= typesPlans.usageChamadasAPI)
      return {
        statusCode: 402,
        body: JSON.stringify({erros:["Plano excedeu o limite de uso Diario!"]})
      }

  await userPlans.save()

  return {
    statusCode: 200,
    body: JSON.stringify({plans, message:"Plano atualizado com sucesso!"})
    
    };
  
}
//update usage API
module.exports.resetUsageAPI = async (event, context) => {        
    const userPlans = await dbConnectAndExecute(mongoString, async () => (Plans.updateMany({usageChamadasAPI: 0})));       
  
    return {
      statusCode: 200,
      body: JSON.stringify({userPlans, message:"Planos atualizados com sucesso!"})
      
      };  
}
//update usage Total
module.exports.updateUsageUse = async (event, context) => {
    const {id} = event.pathParameters
  
    const userPlans = await dbConnectAndExecute(mongoString, async () => (Plans.findOne({userId:id})));       
    const typesPlans = await dbConnectAndExecute(mongoString, async () => (TypesPlans.findById(userPlans.planId)));       


    if (!userPlans)
    {        
      return {
        statusCode: 404,
        body: JSON.stringify({erros:["Plano não encontrado"]})
      }  }
    if(!typesPlans)
    {
      return {
        statusCode: 404,
        body: JSON.stringify({erros:["Tipo de plano não encontrado"]})
      }  }

  if(userPlans.usageUse < typesPlans.limiteUso)
      userPlans.usageUse += 1
  if(userPlans.usageUse >= typesPlans.limiteUso)
    return {
      statusCode: 402,
      body: JSON.stringify({erros:["Plano excedeu o limite de uso!"]})
    }


  await userPlans.save()

 return {
      statusCode: 200,
      body: JSON.stringify({userPlans, message:"Planos atualizados com sucesso!"})
      
      };   
}
//#endregion
//#region configuration
module.exports.getAllConfiguration = async (event, context) => {

  const configuration = await dbConnectAndExecute(mongoString, async () => (Configuration.find({active:true}).sort([["createdAt", -1]]).exec()));   

  return {
    statusCode: 200,
    body: JSON.stringify(configuration)    
    };   
}
module.exports.getUserConfiguration = async (event, context) => {
  const {id} = event.pathParameters
  const configuration = await dbConnectAndExecute(mongoString, async () => (Configuration.findOne({userId:id}).sort([["createdAt", -1]]).exec()));       

  return {
    statusCode: 200,
    body: JSON.stringify(configuration)
    
    };   
}
module.exports.getConfigurationByPhone = async (event, context) => {
  const {id} = event.pathParameters
  const configuration = await dbConnectAndExecute(mongoString, async () => (Configuration.findOne({numberPhoneWhatsapp:id})));       
  const plan = await dbConnectAndExecute(mongoString, async () => (Plans.findOne({userId:configuration.userId})));       
  
  if(!configuration)
  return {
    statusCode: 404,
    body: JSON.stringify({errors:["Configuração não encontrada"]})
    
    };  
  if(plan)
      configuration.plan = plan
  
      return {
        statusCode: 200,
        body: JSON.stringify({configuration, plan})
        
        };  
}
module.exports.getConfigurationByIdApp = async (event, context) => {
  const {id} = event.pathParameters
  const configuration = await dbConnectAndExecute(mongoString, async () => (Configuration.findOne({_id:id})));       
  const plan = await dbConnectAndExecute(mongoString, async () => (Plans.findOne({userId:configuration.userId})));       
  
  if(!configuration)
  return {
    statusCode: 404,
    body: JSON.stringify({errors:["Configuração não encontrada"]})
    
    };  
  if(plan)
      configuration.plan = plan
  
      return {
        statusCode: 200,
        body: JSON.stringify({configuration, plan})
        
        };  
}
module.exports.updateActiveConfiguration = async (event, context) => {

  const {id} = event.pathParameters
  const {active, userId} = event.body

  const configuration = await dbConnectAndExecute(mongoString, async () => (Configuration.findById(id)));       

  if(!configuration)
  {
    return {
      statusCode: 404,
      body: JSON.stringify({errors:["Configuração não encontrada"]})
      
      };    
  }    
  //check if photo is user 
  if(!configuration.userId.equals(userId))
  {
    return {
      statusCode: 422,
      body: JSON.stringify({errors:["Ocorreu um erro, tente novamente mais tarde."]})
      
      };  
  }  
  if(active != configuration.active)
  {
      configuration.active = active
  }

  await configuration.save();
  return {
    statusCode: 200,
    body: JSON.stringify({configuration, message: "Configuração atualizada com sucesso!"})
    
    };  
}
module.exports.updateQrCode = async (event, context) => {
  const {id} = event.pathParameters
  const {qrCode, userId, isAuthenticate} = JSON.parse(event.body)
  console.log(event.body)

  const configuration = await dbConnectAndExecute(mongoString, async () => (Configuration.findById(id)));       
  if(!configuration)
  {
    return {
      statusCode: 404,
      body: JSON.stringify({errors:["Configuração não encontrada"]})
      
      };        
  }      
   if(qrCode) 
   {
       configuration.qrCode = qrCode
   }
   if(isAuthenticate != configuration.isAuthenticate) 
   {
       configuration.isAuthenticate = isAuthenticate
   }  
    
   await configuration.save()

  return {
    statusCode: 200,
    body: JSON.stringify({configuration, message: "Configuração atualizada com sucesso!"})
    
    };  
}
module.exports.clearQrCode = async (event, context) => {
  const {id} = event.pathParameters
  const configuration = await dbConnectAndExecute(mongoString, async () => (Configuration.findById(id)));       
  
  if(!configuration)
  {
    return {
      statusCode: 404,
      body: JSON.stringify({errors:["Configuração não encontrada"]})
      
      };        
  }    
  configuration.qrCode = ""
  configuration.save()

  return {
    statusCode: 200,
    body: JSON.stringify({configuration, message: "Configuração atualizada com sucesso!"})
    
    };  
}
//#endregion
//#region user
//register new user
module.exports.register = async (event, context, callback) => {
  const {name, email, password} = JSON.parse(event.body)
  
  //find User on mongoose(findOne)
  const userdb = await dbConnectAndExecute(mongoString, async () => (User.findOne({email})));       

  //if User exists
  if(userdb){
    return {
      statusCode: 422,
      body: JSON.stringify({errors:["E-mail já cadastrado"]})
      
      }; 
  }  
  //generate hash + salt =(349u82h5r237rh223yt32h8t726245h2340gf572g2h938ghTg)
  const salt = await bcrypt.genSalt()
  const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({
      name,
      email,
      password:passwordHash,
      active:true
    });
  
    if (user.validateSync()) {
      callback(null, createErrorResponse(400, 'Incorrect user data'));
      return;
    }
  
    dbConnectAndExecute(mongoString, () => (user.save()));

    return {
      statusCode: 200,
      body: JSON.stringify({
        _id: newUser._id,
        token: generateToken(newUser._id)})      
    }; 
};
//login user
module.exports.login = async (event, context, callback) => {
  //get body da requisição
  const {email, password} = JSON.parse(event.body)  
  //find user by email on mongoose
  const user = await dbConnectAndExecute(mongoString, async () => (User.findOne({email})));       

  //if User not exists
  if(!user){
    return {
      statusCode: 404,
      body: JSON.stringify({errors:["Usuário não encontrado"]})      
      }; 
  }

  //compare password decrypted
  if(!(await bcrypt.compare(password, user.password)))
  {
    return {
      statusCode: 422,
      body: JSON.stringify({errors:["Senha inválida"]})      
      }; 
  }
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      _id: user._id,
      profileImage:user.profileImage,
      token: generateToken(user._id),
      //getconfiguration
  })      
    }; 
}
//get current user 
module.exports.getCurrentUser = async (event, context, callback) => {

  const user = JSON.parse(event.user)
  return {
    statusCode: 200,
    body: JSON.stringify(user)      
    }; 
}
//get user by ID
module.exports.getUserById = async (event, context, callback) => {
  const {id} = event.pathParameters

  try {
    const user = await dbConnectAndExecute(mongoString, async () => (User.findById(new mongoose.Types.ObjectId(id)).select("-password")));       

    //if user exists
    if(!user){
      return {
        statusCode: 404,
        body: JSON.stringify({errors:["Usuário não encontrado"]})      
        }; 
    }
    return {
      statusCode: 200,
      body: JSON.stringify(user)      
      }; 
  } catch (error) {
      return {
        statusCode: 404,
        body: JSON.stringify({errors:["Usuário não encontrado"]})      
        }; 
  }        
}
//update image 
module.exports.update = async (event, context, callback) => {
  const {name, password, comment, cpf, active} = JSON.parse(req.body)
  let profileImage = null

  if(JSON.parse(req.file))
      profileImage = JSON.parse(req.file.filename)
  console.log(event.body)
  const reqUser = JSON.parse(event.user)
  const user = await dbConnectAndExecute(mongoString, async () => (User.findById(new mongoose.Types.ObjectId(reqUser._id)).select("-password")));       


  if(name)
  user.name = name

  if(password){
      const salt = await bcrypt.genSalt()
      const passwordHash = await bcrypt.hash(password, salt)
      user.password = passwordHash
  }
  if(cpf)
      user.cpf = cpf

  if(active)
      user.active = active

  if(profileImage)
      user.profileImage = profileImage
  
  if(comment)
  user.comment = comment

  await user.save()
  
  return {
    statusCode: 200,
    body: JSON.stringify(user)      
    }; 
}

//#endregion

//#region test
module.exports.test = async (event, context) => {  
  console.log(event)
  return {
    statusCode: 200,
    event,
    body: JSON.stringify({message:"Sucesso"})
  };
};
//#endregion

//#region exemplos
// module.exports.user = (event, context, callback) => {
//   if (!validator.isAlphanumeric(event.pathParameters.id)) {
//     callback(null, createErrorResponse(400, 'Incorrect id'));
//     return;
//   }

//   dbConnectAndExecute(mongoString, () => (
//     User
//       .find({ _id: event.pathParameters.id })
//       .then(user => callback(null, { statusCode: 200, body: JSON.stringify(user) }))
//       .catch(err => callback(null, createErrorResponse(err.statusCode, err.message)))
//   ));
// };


// module.exports.createUser = (event, context, callback) => {
//   const data = JSON.parse(event.body);

//   const user = new User({
//     name: data.name,
//     firstname: data.firstname,
//     birth: data.birth,
//     city: data.city,
//     ip: event.requestContext.identity.sourceIp,
//   });

//   if (user.validateSync()) {
//     callback(null, createErrorResponse(400, 'Incorrect user data'));
//     return;
//   }

//   dbConnectAndExecute(mongoString, () => (
//     user
//       .save()
//       .then(() => callback(null, {
//         statusCode: 200,
//         body: JSON.stringify({ id: user.id }),
//       }))
//       .catch(err => callback(null, createErrorResponse(err.statusCode, err.message)))
//   ));
// };

// module.exports.deleteUser = (event, context, callback) => {
//   if (!validator.isAlphanumeric(event.pathParameters.id)) {
//     callback(null, createErrorResponse(400, 'Incorrect id'));
//     return;
//   }

//   dbConnectAndExecute(mongoString, () => (
//     User
//       .remove({ _id: event.pathParameters.id })
//       .then(() => callback(null, { statusCode: 200, body: JSON.stringify('Ok') }))
//       .catch(err => callback(null, createErrorResponse(err.statusCode, err.message)))
//   ));
// };

// module.exports.updateUser = (event, context, callback) => {
//   const data = JSON.parse(event.body);
//   const id = event.pathParameters.id;

//   if (!validator.isAlphanumeric(id)) {
//     callback(null, createErrorResponse(400, 'Incorrect id'));
//     return;
//   }

//   const user = new User({
//     _id: id,
//     name: data.name,
//     firstname: data.firstname,
//     birth: data.birth,
//     city: data.city,
//     ip: event.requestContext.identity.sourceIp,
//   });

//   if (user.validateSync()) {
//     callback(null, createErrorResponse(400, 'Incorrect parameter'));
//     return;
//   }

//   dbConnectAndExecute(mongoString, () => (
//     User.findByIdAndUpdate(id, user)
//       .then(() => callback(null, { statusCode: 200, body: JSON.stringify('Ok') }))
//       .catch(err => callback(err, createErrorResponse(err.statusCode, err.message)))
//   ));
// };
//#endregion