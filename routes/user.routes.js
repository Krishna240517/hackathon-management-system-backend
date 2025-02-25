const express = require('express');
const router = express.Router();
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const zod = require('zod');
const jwt = require('jsonwebtoken');

const nameInputSchema = zod.string().trim().min(6).max(20);
const emailInputSchema = zod.string().email().trim();
const passwordInputSchema = zod.string().trim().min(8).max(30)

function validateUserSignUp(req,res,next){
    const validateName = nameInputSchema.safeParse(req.body.username);
    const validateEmail = emailInputSchema.safeParse(req.body.email);
    const validatePass = passwordInputSchema.safeParse(req.body.password);
    if(!validateName.success || !validateEmail.success || !validatePass.success){
        return res.status(403).json({message : "WRONG INPUT"})
    }
    next();
}

function validateUserLogin(req,res,next){
    const validateName = nameInputSchema.safeParse(req.body.username);
    const validatePass = passwordInputSchema.safeParse(req.body.password);
    if(!validateName.success || !validatePass.success){
        return res.status(403).json({message : "WRONG INPUT"})
    }
    next();
}

function jwtAuthCookie(req,res,next){
    const token = req.cookies.token;
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err){
        res.clearCookie("token");
        return res.redirect("/");
    }
}


router.get("/",(req,res)=>{
    res.render('home');
})


//signup route

router.get("/signup",(req,res)=>{
    res.render('index');
})
router.post("/signup",validateUserSignUp,async (req,res)=>{
    const {username,email,password} = req.body;
    const hashPassword = await bcrypt.hash(password,10);


    await userModel.create({
        username,
        email,
        password:hashPassword
    })
})





//login route
router.get("/signin",(req,res)=>{
    res.render('index');
})

router.post("/signin",validateUserLogin,async (req,res)=>{
    const{ username, password} = req.body;
    const user = await userModel.findOne({
        username : username
    })
    if(!user){
        return res.status(403).json({message : "username or password is incorrect"})
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(403).json({message : "usernmae or password is incorrect"});
    }

    const token = jwt.sign({
        userId : user._id,
        email : user.email,
        username : user.username
    },process.env.JWT_SECRET)

    res.cookie(token);
    res.redirect("/home");
})


router.use(jwtAuthCookie());


module.exports = router;