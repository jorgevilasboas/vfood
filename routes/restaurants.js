var express = require("express");
var router  = express.Router();
var Restaurant = require("../models/restaurant");
var middleware = require("../middleware");
var request = require("request");

//INDEX - show all restaurants
router.get("/", function(req, res){
    // Get all restaurants from DB
    Restaurant.find({}, function(err, allRestaurants){
       if(err){
           console.log(err);
       } else {
           request('https://maps.googleapis.com/maps/api/geocode/json?address=sardine%20lake%20ca&key=AIzaSyBtHyZ049G_pjzIXDKsJJB5zMohfN67llM', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body); // Show the HTML for the Modulus homepage.
                res.render("restaurants/index",{restaurants:allRestaurants});

            }
});
       }
    });
});

//CREATE - add new restaurant to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to restaurants array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newRestaurant = {name: name, image: image, description: desc, author:author}
    // Create a new restaurant and save to DB
    Restaurant.create(newRestaurant, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to restaurants page
            console.log(newlyCreated);
            res.redirect("/restaurants");
        }
    });
});

//NEW - show form to create new restaurant
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("restaurants/new"); 
});

// SHOW - shows more info about one restaurant
router.get("/:id", function(req, res){
    //find the restaurant with provided ID
    Restaurant.findById(req.params.id).populate("comments").exec(function(err, foundRestaurant){
        if(err){
            console.log(err);
        } else {
            console.log(foundRestaurant)
            //render show template with that restaurant
            res.render("restaurants/show", {restaurant: foundRestaurant});
        }
    });
});

router.get("/:id/edit", middleware.checkUserRestaurant, function(req, res){
    console.log("IN EDIT!");
    //find the restaurant with provided ID
    Restaurant.findById(req.params.id, function(err, foundRestaurant){
        if(err){
            console.log(err);
        } else {
            //render show template with that restaurant
            res.render("restaurants/edit", {restaurant: foundRestaurant});
        }
    });
});

router.put("/:id", function(req, res){
    var newData = {name: req.body.name, image: req.body.image, description: req.body.desc};
    Restaurant.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, restaurant){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/restaurants/" + restaurant._id);
        }
    });
});


//middleware
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     req.flash("error", "You must be signed in to do that!");
//     res.redirect("/login");
// }

module.exports = router;

