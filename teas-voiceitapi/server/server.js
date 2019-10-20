const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const config = require('./config')
const teasVoiceIt = require('../backend')
const app = express()
const port = 3000
const mysql = require('mysql');


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: 'supersecretsessionkey',
  resave: false,
  saveUninitialized: true,
}))
// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// for parsing multipart/form-data
const multer = require('multer')()
// serve all static files in public directory
app.use(express.static('public'))

var sess;
app.get('/login', function (req, res) {
  sess = req.session;
  if(req.query.email === config.DEMO_EMAIL && req.query.password === config.DEMO_PASSWORD){
    const myVoiceIt = new teasVoiceIt(config.API_KEY, config.API_TOKEN);
    const generatedToken = myVoiceIt.generateTokenForUser(config.USERID);
    res.json({
      'ResponseCode': 'SUCC',
      'Message' : 'Successfully authenticated user',
      'Token' : generatedToken
    });
  } else if (req.query.password !== config.DEMO_PASSWORD){
    res.json({
      'ResponseCode': 'INPW',
      'Message' : 'Incorrect Password'
    });
  } else {
    res.json({
      'ResponseCode': 'UNFD',
      'Message' : 'User not found'
    });
  }
});


// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'bio'

// });
// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected!');
// });


// connection.query('SELECT * FROM NavVariation', (err,rows) => {
//   if(err) throw err;
//   const nav_data = rows
//   res.render('console.html', nav_data);
//   // console.log('Data received from Db:\n');
//   // console.log(rows);
// });

// connection.query('SELECT * FROM AssetAllocation', (err,rows) => {
//   if(err) throw err;
//   const asset_data = rows
//   res.render('console.html', asset_data);
//   // console.log('Data received from Db:\n');
//   // console.log(rows);
// });

// connection.query('SELECT * FROM TransactionStatus', (err,rows) => {
//   if(err) throw err;
//   const trans_data = rows
//   res.render('console.html', trans_data);
//   // console.log('Data received from Db:\n');
//   // console.log(rows);
// });




app.get('/logout', function (req, res) {
  sess = req.session;
  req.session.destroy(function(err) {
  if(err) {
    console.log(err);
  } else {
    res.redirect('/');
  }
  });
});

app.get('/console', function (req, res) {
  sess = req.session;
  if(sess.userId){
    res.render('console.html');
  } else {
    res.redirect('/');
  }
})

app.post('/example_endpoint', multer.any(), function (req, res) {
    sess = req.session;
    const myVoiceIt = new teasVoiceIt(config.API_KEY, config.API_TOKEN);
    myVoiceIt.initBackend(req, res, function(jsonObj){
      const callType = jsonObj.callType.toLowerCase();
      const userId = jsonObj.userId;
      if(jsonObj.jsonResponse.responseCode === "SUCC"){
        // Activate Session with userId
        sess.userId = userId;
        console.log('Session Set')
      }
    });
});


app.listen(port, () => console.log(`Server running on port ${port}`))
