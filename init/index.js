const mongoose = require("mongoose");
const initData = require("../init/data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlustdb";

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

let initDB = async() => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "685a8c2e51a1f25620b9f4d2"}));
    let insertedListings = await Listing.insertMany(initData.data);
    console.log(insertedListings);
    console.log("data was initialized");
}

initDB();
