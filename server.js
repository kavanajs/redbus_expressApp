//importing installed packages
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");

 const Handlebars = require("handlebars");
 const HandlebarsIntl = require("handlebars-intl");

const exphbs = require("express-handlebars");

const multer = require("multer");//multer is used for uploading files
const methodOverride = require('method-override');

//Top level function
const app = express();

//import profile schema
require("./Model/Profile");
const Profile = mongoose.model("profile");

//express handlebars middlebars
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

//connect to database
const CloudUrl =
"mongodb+srv://redbus:redbus123@cluster0-xwpa3.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(
  CloudUrl,
  { useUnifiedTopology: true, useNewUrlParser: true },
  err => {
    if (err) throw err;
    console.log("Database connected");
  }
);

//serve static files in expressjs by using express.static() method
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node-modules/jquery/dist"));
app.use(express.static(__dirname + "/node_modules/bootstrap/dist"));

//bodyparser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//method-override middleware for put and delete method because html doesnot have put and delete method
// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'));
//override with POST having ?_method=DELETE
app.use(methodOverride('_method'));



//format js middleware
HandlebarsIntl.registerWith(Handlebars);

//multer middleware here for uploading files
Handlebars.registerHelper('trimArray', function(passedString) {
  var theArray = [...passedString].splice(6).join("");//trim first 6 character---that is public
  return new Handlebars.SafeString(theArray);
});



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const upload = multer({storage:storage});

//Basic routing
app.get("/", (req, res) => {
  //res.send("OK");
  res.render("home");
});

//create addprofile routing
app.get("/profile/addprofile", (req, res) => {
  res.render("profiles/addprofile");
});

//edit profile route here
app.get('/profile/editprofile/:id', (req, res) => {//:id represents query string
  //find mongodb objectid through findOne method
  Profile.findOne({ _id: req.params.id })
    .then(profile => {
      console.log(profile);
      res.render('profiles/editprofile', {//to print in web browser
        profile: profile
      })
    })
    .catch(err => console.log(err));
});

//create profiles routing
app.get('/profile/profiles', (req, res) => {
  // res.render('/profiles/profiles');
   //find data from mongodb database by using mongodb find method
   Profile.find({}).then(profile => {
       res.render('profiles/profiles', {
           profile
       })
   }).catch(err => console.log(err));
});

//create profile through http post method
app.post("/profile/addprofile", upload.single('photo') ,(req, res) => {
  //copy the path and paste in action part in form
  // res.send("OK");
  const errors = [];
  if (!req.body.firstname) {
    errors.push({ text: "First name is required" });
  }
  if (!req.body.lastname) {
    errors.push({ text: "Last name is required" });
  }
  if (!req.body.email) {
    errors.push({ text: "Email is required" });
  }
  if (!req.body.phonenumber) {
    errors.push({ text: "Phone number is required" });
  }
  
  if (errors.length > 0) {
    res.render("profiles/addprofile", {
      errors,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phonenumber: req.body.phonenumber
    });
  } else {
    const newProfile = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      photo: req.file,
      email: req.body.email,
      phonenumber: req.body.phonenumber
    };

    //save to database
    new Profile(newProfile).save().then(profile => {
      res.redirect("/", 301, { profile });
    });
  }
});


//put req here for updating data
app.put("/profile/editprofile/:id", upload.single("photo"), (req, res) => {
  //should tell which object want to modify
  Profile.findOne({ _id: req.params.id }).then(profile => {
    //console.log(profile);
    //existing value: new value
    profile.photo = req.file,
      profile.firstname = req.body.firstname,
      profile.lastname = req.body.lastname,
      profile.email = req.body.email,
      profile.phonenumber = req.body.phonenumber
    
    //save new data to mongodb
    profile.save().then(profile => {
      res.redirect('/profile/profiles', 301, (profile));
    }).catch(err => console.log(err));

  }).catch(err => console.log(err));
});

//delete data --http delete method..
app.delete("/profile/deleteprofile/:id", (req, res) => {
  Profile.remove({ _id: req.params.id })
    .then(profile => {
    res.redirect('/profile/profiles', 301, (profile));
  }).catch(err => console.log(err));
});

//wild card page
app.get("**", (req, res) => {
  res.render("404");
});

const port = process.env.PORT || 5000;
app.listen(port, err => {
  if (err) throw err;
  console.log(`Server is running on port ` + port);
});
