const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
let mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async(req, res) => {
    const { category, search } = req.query;

    let query = {};

    if(category) {
        query.category = category;
    } else if(search) {
        query.country = { $regex: search, $options: "i" }
    }

    const allListings = await Listing.find(query);

    if((category || search) && allListings.length === 0) {
        req.flash("error", `No listings found in this ${category ? "category" : "country"}`);
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
        path: "author"
    },
    })
    .populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async(req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = req.body.listing;
    newListing.owner = req.user._id;

    newListing.geometry =  response.body.features[0].geometry;

    newListing.image = { url, filename };
    let savedListing = await Listing.create(newListing);
    console.log(savedListing);
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}

module.exports.renderEditForm = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    } 

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("error", "Listing Deleted");
    res.redirect("/listings");
}
