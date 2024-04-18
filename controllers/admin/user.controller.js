const User = require("../../models/user.model");

// index
async function index (req,res){
    const query = User.find();

    // filter by name
    if (req.query.keyword) { 
        query.where({ name: { $regex: req.query.keyword, $options: 'i' } })
    }
    

    // pagination
    req.pagination.perPage = 6;
    const totalResults = await query.clone().countDocuments();
    req.pagination.numPages = Math.ceil(totalResults/req.pagination.perPage);

    query.skip((req.pagination.page-1) * req.pagination.perPage).limit(req.pagination.perPage);

    const users = await query.sort({ createdAt: -1 }).exec();

    res.render('admin/user/index', {users})
}

// req.user
async function findOrFail(req,res,next){
    const user = await User.findById(req.params.id).exec();

    if (!user) {
        return res.redirect('/not-found')
    } 

    req.user = user; 
    next();
}

async function ban(req,res) { 
    req.user.active = false; 

    await req.user.save();

    req.flash.success("user has been banned!");
    
    // redirect
    res.redirect(`back`);
}

async function unban(req,res) {
    req.user.active = true; 

    await req.user.save();

    req.flash.success("user has been unbaned!");
    
    // redirect
    res.redirect(`back`);
}

module.exports = {
    index,

    findOrFail,
    ban,
    unban,
}