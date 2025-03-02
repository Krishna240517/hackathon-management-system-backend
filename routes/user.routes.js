const express = require('express');
const router = express.Router();
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const jwtAuth = require('../authmiddleware/jwt');
const upload = require('../config/multerconfig');

const nameInputSchema = zod.string().trim().min(3).max(20);
const emailInputSchema = zod.string().email().trim();
const passwordInputSchema = zod.string().trim().min(8).max(30)

function userSignUp(req,res,next){
    const validateName = nameInputSchema.safeParse(req.body.username);
    const validateEmail = emailInputSchema.safeParse(req.body.email);
    const validatePass = passwordInputSchema.safeParse(req.body.password);
    if (!validateName.success || !validateEmail.success || !validatePass.success) {
        console.log(validateEmail.success);
        console.log(validatePass.success);
        console.log(validateName.success);
        return res.status(403).json({ message: "WRONG INPUT TRY AGAIN" })
    }
    next();
}

function userSignIn(req,res,next){
    const validateName = nameInputSchema.safeParse(req.body.username);
    const validatePass = passwordInputSchema.safeParse(req.body.password);
    if (!validateName.success || !validatePass.success) {
        return res.status(403).json({ message: "WRONG INPUT TRY AGAIN" })
    }
    next();
}


router.get("/", (req, res) => {
    res.render('home');
})


//signup route

router.get("/signup", (req, res) => {
    res.render('index');
})

router.post("/signup", upload.single("photo"), userSignUp, async (req, res) => {
    const { username, email, password, role} = req.body;
    const photopath = req.file ? req.file.path : null;
    const user = await userModel.findOne({ username: username });
    if (user) {
        res.send("USERNAME ALREADY IN USE");
    } else {
        const hashPassword = await bcrypt.hash(password, 10);
        await userModel.create({
            username,
            email,
            password: hashPassword,
            role,
            photo : photopath
        })
    }
    const token = jwt.sign({
        email, username
    }, process.env.JWT_SECRET)
    res.cookie('token',token);
    res.redirect('/home')
})





//login route
router.get("/signin", (req, res) => {
    res.render('index');
})

router.post("/signin", userSignIn, async (req, res) => {
    const { username, password } = req.body;
    const user = await userModel.findOne({
        username: username
    })
    if (!user) {
        return res.status(403).json({ message: "username or password is incorrect" })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(403).json({ message: "username or password is incorrect" });
    }

    const token = jwt.sign({
        email: user.email,
        username: user.username
    }, process.env.JWT_SECRET)
    res.cookie('token', token);
    setTimeout(() => { res.redirect("/home") }, 1000);
})



//logout route
router.get("/logout", jwtAuth, async (req, res) => {
    try {
        res.clearCookie("token");
        return setTimeout(() => { res.redirect("/home/signin") }, 1000);
    } catch (err) {
        res.status(500).send("SOME ERROR");
    }
})

//profile route
router.get("/profile",jwtAuth, async(req,res)=>{
    let userDetail = await userModel.findOne({username : req.user.username});
    // console.log(userDetail);
    res.render('viewprofile',{userDetail});
})

module.exports = router;