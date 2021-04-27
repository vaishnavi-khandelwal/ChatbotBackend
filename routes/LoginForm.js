const router = require("express").Router();
var cors = require('cors')
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
router.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const { key } = require("../config/key");
//AWS.config.update({key})
router.use(bodyParser.json());

// 1.1 ********** server test api **************
router.get("/", (req, res) => res.json('welcome'));


//1.2 ************ UI - login api*************
router.post("/loginRoute",cors(corsOptions), (req, res) => {
    console.log("reqBody:" + JSON.stringify(req.body));
    var {
      Email,
      pass
    }=req.body;

    var params={
      TableName:'Admin',
     Key:{
        "email":Email
      
      },
      
      KeyConditionExpression:'email = :Email ',

      ExpressionAttributeValues:{
        ":Email":Email
      },

      "projectionExpression":"email,password"

    };
    if(Email && pass){
     
    docClient.get(params,function(err,data){

      console.log("response from db: ",JSON.stringify(data))
      if(err){
        console.log(err);
      }
      else{
        console.log("data length : "+data);
        if(data.hasOwnProperty("Item") && data.Item.email==Email && data.Item.password==pass)
        {
          console.log("sucessful Login",data.Item); 
          var object = { message : 'login Successfull',statusCode : '200' , statusMessage : 'success'};
          res.json(object);          
        }
        else{
          console.log("invalid user")
          //console.log(data.Item);
          var object = { message : 'Invalid User',statusCode : '403' , statusMessage : 'success'};
          res.json(object);          
        }
      }
    });
  }
  else{
    var object = { message : 'please enter email and password',statusCode : '403' , statusMessage : 'success'};
    res.json(object);
  }    //console.log('Email : '+JSON.stringify(email));
   
  });
  module.exports = router;
