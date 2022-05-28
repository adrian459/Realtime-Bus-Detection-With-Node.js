const { urlencoded } = require('express');
const express = require('express')
const app = express()
const request = require('request');
//https://api.openweathermap.org/data/2.5/weather?q=surabaya&appid=0e3a19612cfeb37aebbe8a7568e54848&units=metric

//validator
const { body, validationResult, check } = require('express-validator');
//import connection database
require('./model/database');
//import model database
const users = require('./model/database')
//npm i express-sessiom
const session = require('express-session')
app.use(session({
    cookie : {maxAge : 6000},
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}))
//npm i cookie parser
const cookieParser = require('cookie-parser')
app.use(cookieParser('secret'))
//npm i connect-flash 
const flash = require('connect-flash');
app.use(flash())

const port = 3003

app.set('view engine', 'ejs')
app.use(express.static('static'))
app.use(express.urlencoded({ extended: false }))

//Video Upload
var path = require("path");
var fs = require("fs");
var upload_file = require("./file_upload.js");
//var upload_image = require("./image_upload.js");
//var upload_video = require("./video_upload.js");
// File POST handler.
app.post('/upload_video', (req,res)=>{
    //????
})
app.post("/file_upload", function (req, res) {
    upload_file(req, function(err, data) {
        if (err) {
            return res.status(404).end(JSON.stringify(err));
        }
    
        res.send(data);
    });
});
    
    // Image POST handler.
app.post("/image_upload", function (req, res) {
    upload_image(req, function(err, data) {
    
    if (err) {
        return res.status(404).end(JSON.stringify(err));
    }
    
        res.send(data);
    });
});
    
    // Video POST handler.
app.post("/video_upload", function (req, res) {
    upload_video(req, function(err, data) {
    
        if (err) {
            return res.status(404).end(JSON.stringify(err));
        }
    
        res.send(data);
    });
});
    
    // Create folder for uploading files.
var filesDir = path.join(path.dirname(require.main.filename), "uploads");
    
if (!fs.existsSync(filesDir)){
    fs.mkdirSync(filesDir);
}
    


app.use(express.static(__dirname + "/"));

app.get('/register', (req,res)=>{
    res.render('register')
})

//Importing unixTime
const unixToTime = require('./unixTime');
app.get('/main', async(req,res)=>{
    //const userData = await users.findOne({email : req.flash('email')}) //kirim flash variabel dari login 
    var request = require('request')
    request('https://api.openweathermap.org/data/2.5/weather?q=surabaya&appid=0e3a19612cfeb37aebbe8a7568e54848&units=metric', 
        function(error, response, body){
            let data = JSON.parse(body)
            if(response.statusCode === 200){
                //console.log(data.weather[0].main) inside object there's an array use the []
                //console.log(unixToTime(data.sys.sunrise))
                res.render('base', {
                    //name : userData.nama,
                    //email : userData.email,
                    temp : data.main.temp,
                    lat : data.coord.lat,
                    lon : data.coord.lon,
                    weather_main : data.weather[0].main,
                    weather_desc : data.weather[0].description,
                    sunrise : unixToTime(data.sys.sunrise),
                    sunset : unixToTime(data.sys.sunset),
                    city : data.name 
                })
            }
        }
    )
})
app.get('/', (req,res)=>{
    // users.find().then((user)=>{
    //     res.send(user)
    // }) bentuk promise
    res.render('homepage',{
        msg : req.flash('msg')
    })
    //console.log(req.flash('msg'))
})
app.get('/experimental', async(req,res)=>{
    const user = await users.find()
    res.render('experimental', {
        user
    })
})
app.post('/login', [
    body('email').custom(async(value)=>{
        const unfinded = await users.findOne({email : value})
        if(unfinded === null){
            throw new Error('Email not found')
        }
        return true
    }),
    body('password').custom(async(value)=>{
        const unfinded = await users.findOne({password : value})
        if(unfinded === null){
            throw new Error('Invalid Password')
        }
        return true
    })
    ], 
    (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.render('login',{
            errors : errors.array()
        })
    }else{
        req.flash('email', req.body.email)
        res.redirect('/main')
        // console.log(req.body.email)
        // console.log(typeof req.body)
    }
})
app.post('/register', [
    body('nama').custom(async(value)=>{
        const duplicate = await users.findOne({nama : value})
        if(duplicate){
            throw new Error('Name has already exist')
        }
        return true
    }),
    body('password').custom(async(value)=>{
        const duplicate = await users.findOne({password : value})
        if(duplicate){
            throw new Error('Password has already exist')
        }
        return true
    }),
    body('email').custom(async(value)=>{
        const duplicate = await users.findOne({email : value})
        if(duplicate){
            throw new Error('Email has already exist')
        }
        return true
    }),
    body('email', 'email format invalid').isEmail(),
    body('password', 'password length less than 5 character').isLength({min : 5})
    ],
    (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('register', {
            errors : errors.array()
        })
        //console.log(errors.array())
    }else{
        users.insertMany(req.body)
        req.flash('msg','Data successfully add')
        res.redirect('/') //root route
        //console.log(errors.array())
    }
})

app.get('/login', (req,res)=>{
    res.render('login')
})
app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`)
})