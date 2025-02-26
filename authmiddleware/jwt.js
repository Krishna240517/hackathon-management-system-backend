const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next)=>{
    //extract the token from the request headers
    const token = req.cookies.token;
    if(!token) return res.status(401).json({error : "TOKEN NOT FOUND"});
    
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err){
        console.error(err);
        res.status(401).json({error : "Invalid token"});
    }
}

module.exports = jwtAuthMiddleware;