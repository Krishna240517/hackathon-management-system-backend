const express = require('express');
const app = express();
const path = require('path');

//for connecting backend to frontend
app.set('view engine', 'ejs');
app.use(express.static('public'));


//for dotenv config
require('dotenv').config();


//for connecting to database
const connectDB = require('./config/db');
connectDB();

//for body reading
app.use(express.json())
app.use(express.urlencoded({extended : true}))

//cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//for requiring user routes
app.use("/home", require('./routes/user.routes')); 

app.listen(3000);
