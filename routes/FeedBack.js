const router = require("express").Router();
var cors = require('cors')
const fs = require("fs");
var AWS =require('aws-sdk');
var awsconfig={"region":"ap-south-1","endpoint":"http://dynamodb.ap-south-1.amazonaws.com","acessKeyId":'',
"secretAcessKey":''}

AWS.config.update(awsconfig)
var docClient=new AWS.DynamoDB.DocumentClient();

var corsOptions = {
  origin: 'http://localhost:8081',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.use(cors(corsOptions))

const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { FSx } = require("aws-sdk");
router.use(
  bodyParser.urlencoded({
    extended: true
  })
);

//const { key } = require("../config/key");
//AWS.config.update({key})
router.use(bodyParser.json());

// 1.1 ********** server test api **************
router.get("/", (req, res) => res.json('welcome'));


//1.2 ************ UI - Feedback api*************
router.post("/feedbackRoute",cors(corsOptions), async(req, res) => {
    console.log("reqBody:" + JSON.stringify(req.body));
    const {
      fullName,
      email,
      mob,
      feedback,
      suggestions
    } = req.body;
 
    console.log('fullname : '+JSON.stringify(fullName));
     //write code for adding new users to database...
     var params = { 
      TableName:"Feedback",
      Item: {  
          "email": email, 
          "FullName": fullName,
          "mobile No": mob,
          "feedback": feedback,
          "suggestions": suggestions
      }
  };

docClient.put(params).promise().then(data =>
  console.log(data.Attributes)).catch(console.error);

  
    res.json("Successfully Inserted to Database..")
  });
  module.exports = router
