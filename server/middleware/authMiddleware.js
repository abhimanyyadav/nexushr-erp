const isAuthenticated=(req,res,next)=>{
   if(!req.session.user){
    return res.status(401).json({
        message:"Unauthorised - please login"
    })
   }
   next();
}
module.exports=isAuthenticated;