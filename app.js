//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const Item = require("./models/Item");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

//allow ejs in app
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);

//connect to mongoDB
mongoose.connect(process.env.MONGO_URL)
.then(console.log("Connected to Mongoose"))
.catch(err => console.log(err));

//create new Documents
const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Welcome to your todolist1!"
});

const item3 = new Item ({
  name: "Welcome to your todolist3!"
});

const defaultItems = [item1, item2, item3];



//get items from db
app.get("/", function(req, res) {

const day = date.getDate();

  //find items from db
  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      //insert new Documents into DB
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
        });
        res.redirect("/");
    } else {
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });
});

//add items to db
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  
  //insert new item into DB
  const item = new Item({
    name: itemName
  });
  item.save();

  res.redirect("/");
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
