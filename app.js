//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const Item = require("./models/Item");
const List = require("./models/List");
const dotenv = require("dotenv");
const _ = require("lodash");

dotenv.config();

const app = express();

const day = date.getDate();

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

//multiple lists, dynamic routes
app.get("/:costumListName", function(req,res){
  const costumListName = _.capitalize(req.params.costumListName);

  List.findOne({name:costumListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new List
        const list = new List({
          name:costumListName,
          items:defaultItems
        });
      
        list.save();
        res.redirect("/" + costumListName);
      } else {
        //show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
})

//add items to db
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  //insert new item into DB
  const item = new Item({
    name: itemName
  });

  if (listName === day){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

//delete document from collection
app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listName}, {$pull:{items: {_id:checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
    }
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started");
});
