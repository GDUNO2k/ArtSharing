 const querystring = require('querystring');

 // req.pagination
 function paginate(req,res,next){
     // pagination
    const page = parseInt(req.query.page) || 1;
    const perPage = 5;
    delete req.query.page;
    const paramstring = querystring.stringify(req.query);

    const numPages = 0;

    req.pagination = {
        page,
        perPage,
        numPages,
        paramstring
    }

    next()
 }

 module.exports = paginate;