const multer = require('multer');


//diskstorage setup
const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'uploads/');
    },
    filename : function(req,file,cb){
        const suffix = Date.now();
        cb(null,suffix+"-"+file.originalname);
    }
});
// upload variable creation and export it
const upload = multer({storage});

module.exports = upload;