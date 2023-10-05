const express = require("express")
const router = express();

//userRoutes
router.use("/api/users", require("./UserRoutes"))
router.use("/api/plans", require("./PlansRoutes"))
router.use("/api/configuration", require("./ConfigurationRoutes"))

//test router
router.get("/", (event, context, res) => {
    console.log("evento: ", event.body)
    console.log("params: ",event.params)
    res.json("API Working by Felipe Lemos");    
})

module.exports = router