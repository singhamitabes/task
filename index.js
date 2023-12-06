const express = require("express")
var cors = require('cors')

const dbConnect = require("./DbConnect/dbConnect")
dbConnect()
const app = express()


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}))                  
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

app.use("/task", require('./Route/route') )

app.listen(4000,()=>console.log("server is start"))