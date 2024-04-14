const User = require("./models/user.model");

async function seed () {
    //connect mongoDB
    const mongoose = require("mongoose");
    await mongoose.connect("mongodb://127.0.0.1:27017/art-sharing");

    try {
        //
        const admin = new User({email: "admin@gmail.com", password: "123456", role: "admin", name: "Admin"});
        await admin.save();
    
        console.log("Seed successfully");
    } catch(err) {
        console.log("Admin already exist!")
    }

    process.exit(1)
}

seed();