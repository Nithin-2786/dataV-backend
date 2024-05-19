const mongoose= require("mongoose");
const connectdb=async()=>{
    try{
        const connect =await mongoose.connect("mongodb+srv://challanithin2002:Nithin@cluster1.74kvjum.mongodb.net/userdata?retryWrites=true&w=majority")
        console.log("connection to mongodb is successfull",connect.connection.host,connect.connection.name)

    }
    catch(err){
        console.log(err)
        process.exit(1)
    }
    
}
module.exports=connectdb
