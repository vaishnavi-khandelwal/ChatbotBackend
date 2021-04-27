const router = require("express").Router();
var cors = require('cors')
var AWS =require('aws-sdk');
var fs=require('fs');
var multer  = require('multer');
var multerS3 = require('multer-s3');

var awsconfig={"region":"ap-south-1",
"endpoint":"http://dynamodb.ap-south-1.amazonaws.com",
"accessKeyId":'',
"secretAccessKey":''}


AWS.config.update(awsconfig)
var docClient=new AWS.DynamoDB.DocumentClient();

var corsOptions = {
  origin: 'http://localhost:8081',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.use(cors(corsOptions))

const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { exists } = require("fs");
router.use(
  bodyParser.urlencoded({
    extended: true
  })
);
router.use(bodyParser.json());
let V_email=[]


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage },{ dest: 'uploads/' });

const s3=new AWS.S3({"region":"ap-south-1",
"endpoint":"http://s3.ap-south-1.amazonaws.com",
"accessKeyId":'',
"secretAccessKey":''});
  

//const bucket_name='requesters-bucket';
var uploads = multer({
storage: multerS3({
    s3: s3,
    bucket: 'volunteerfeedback',
    key: function (req, file, cb) {
        console.log(file);
        cb(null, file.originalname+ '-' + Date.now()); //use Date.now() for unique file keys
    }
})
});

// 1.1 ********** server test api **************
router.get("/donorRoute", cors(corsOptions),(req, res) => {  
  var params={
    TableName:'Donor',
    projectionExpression:'Addresss,email'
  
  };

  docClient.scan(params,function(err,donors_data){
    console.log("response from db(Donor): ",JSON.stringify(donors_data))
    if(err){
      console.log(err);
    }
    else{
      let donors_adress=[];
      let donors_email=[];
      var i=0;
      //console.log("sucessful data fetch",data.Items); 
      donors_data.Items.forEach((record) => {
        donors_adress[i]=record.Address;
        donors_email[i]=record.email;
        i++;
        console.log("donors address:"+record.Address)
      })

   console.log("Donors address"+donors_adress)

    let D_adress=Object.values(donors_adress); 
    let D_email=Object.values(donors_email);
    
    console.log("sucessful data fetch from donors",donors_data.Item); 
 
     //volunteer's data  
var params={
  TableName:'Volunteers',
  projectionExpression:"Addresss,fullName,email"
};
docClient.scan(params,function(err,volunteer_data){
  console.log("response from db(Volunteer): ",JSON.stringify(volunteer_data))
  if(err){
    console.log(err);
  }
  else{
    let volunteer_adress=[];
    let volunteer_name=[];
    let volunteer_email=[];
    var i=0;
    volunteer_data.Items.forEach((record) => {
      volunteer_adress[i]=record.Address;
      volunteer_email[i]=record.email;
      volunteer_name[i]=record.FullName;
      i++;
      console.log("volunteer adress"+record.Address)
      
    })
    
    let V_adress=Object.values(volunteer_adress);
    let V_name=Object.values(volunteer_name);
    let V_email=Object.values(volunteer_email);
    
    for(var i=0;i<(V_adress).length;i++)
    {
      for(var j=0;j<(D_adress).length;j++){
      if(V_adress[i]==D_adress[j]){
        console.log("Matched...donors")
        let Name=V_name[i];
        var params={
          TableName:'Donor',
          Key:{
            "email": D_email[j]
          },
          KeyConditionExpression:'Address = :address ',
    
          ExpressionAttributeValues:{
            ":address":D_adress[j]
          },
    
          //"projectionExpression":"fullName,mobileNo,Address,email,OfferProduct"
        }
        docClient.get(params,function(err,don_data){
          console.log("response from db(donors(update)): ",JSON.stringify(don_data))
          if(err){
            console.log(err);
          }else{
            
            console.log(Name);
            don_data.Item.VolunteerName=Name
            console.log("sucessful data fetch",don_data.Item);
            var object = { message : ' Successfull fetched donors',statusCode : '200' , statusMessage : 'success', 'data' : don_data};
            res.json(object);      
         }
          })
      }
    } 
    }
  }
  })
  }
});
});

router.get("/requesterRoute", cors(corsOptions),(req, res) => {

//Requesters Data
  var params={
    TableName:'requester',
    projectionExpression:'Address,email'

  };
  docClient.scan(params,function(err,requesters_data){
  console.log("response from db(Requester): ",JSON.stringify(requesters_data))
  if(err){
    console.log(err);
  }
  else{
    let requester_adress=[];
    let requester_email=[];
    var i=0;
  
    requesters_data.Items.forEach((record) => {
      requester_adress[i]=record.Address;
      requester_email[i]=record.email;
      i++;
      console.log("requesters address:"+record.Address)
    })

  let R_adress=Object.values(requester_adress)
  let R_email=Object.values(requester_email)   
      console.log("sucessful data fetch from requesters",requesters_data.Item); 

//volunteer's data
var params={
TableName:'Volunteers',
projectionExpression:"Addresss,email"

};

docClient.scan(params,function(err,volunteer_data){
console.log("response from db(Volunteer): ",JSON.stringify(volunteer_data))
if(err){
  console.log(err);
}
else{
  let volunteer_adress=[];
  let volunteer_name=[];
  let volunteer_email=[];
  var i=0;
  volunteer_data.Items.forEach((record) => {
    volunteer_adress[i]=record.Address;
    volunteer_email[i]=record.email;
    volunteer_name[i]=record.FullName;
    i++;
    console.log("volunteer adress"+record.Address)
    
  })
    console.log("sucessful data fetch from Volunteer",volunteer_data.Item); 
        
  let V_adress=Object.values(volunteer_adress);
  let V_name=Object.values(volunteer_name);
   let V_email=Object.values(volunteer_email);

  for(var i=0;i<(V_adress).length;i++)
  {
    for(var j=0;j<(R_adress).length;j++){
    if(V_adress[i]==R_adress[j]){
      console.log("Matched...requester")
      var params={
        TableName:'requester',
        Key:{
          "email": R_email[j]
        },
        KeyConditionExpression:'Address = :address ',
  
        ExpressionAttributeValues:{
          ":address":R_adress[j]
        },
  
        //"projectionExpression":"fullName,mobileNo,Address,RequestProduct"
      }
      docClient.get(params,function(err,req_data){
        console.log("response from db(requesters(update)): ",JSON.stringify(req_data))
        if(err){
          console.log(err);
        }else{
          console.log("sucessful data fetch",req_data);
          var object1 = { message : ' Successfull fetched donors',statusCode : '200' , statusMessage : 'success', 'data' : req_data};
          res.json(object1);     
       }
        })
      
    }
  } 
  }
}
})
}

});
});

router.post("/FileUploadRoute", cors(corsOptions),uploads.single('file'),(req, res) => {
  console.log("reqFile:" + JSON.stringify(req.file));

    // s3 upload

    const file = req.file;
    if (!file) {
      const error = new Error('Please choose files')
      error.httpStatusCode = 400
      console.error(error);
      res.json("file upload failed....")
    }   
  
    res.json("Successfully INserted to S3..")


})


  module.exports = router;
