const mongoose = require("mongoose");
const Item = require("./Item");


const ListSchema = new mongoose.Schema({
    name: String,
    items: [Item.schema]
}
);

module.exports = mongoose.model("List", ListSchema);

