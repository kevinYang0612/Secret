//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FaceBookStrategy = require("passport-facebook");
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session(
    {
        secret: "Our little secret.",
        resave: false,
        saveUninitialized: false,
    }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema(
    {
        email: String,
        password: String,
        googleId: String,
        secret: String
    });

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// creating the table, table name is User and using userSchema
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

passport.use(new GoogleStrategy(
    {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets"
    },
    // following callback function is where Google sends back an access token
    // that allows us to get data related to that user for a longer time
    function(accessToken, refreshToken, profile, cb)
    {
        console.log(profile);
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get("/", (req, res) =>
{
    res.render("home");
});

app.get("/auth/google",
            passport.authenticate('google', { scope: ["profile"] })
       );

app.get("/auth/google/secrets",
    passport.authenticate('google', { failureRedirect: "/login" }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
    });


app.route("/submit")
    .get((req, res) =>
    {
        if (req.isAuthenticated())
            res.render("submit");
        else
            res.redirect("/login");
    })
    .post((req, res) =>
    {
        const submittedSecret = req.body.secret;

        User.findById(req.user.id).then(foundUser =>
        {
            if (foundUser)
            {
                foundUser.secret = submittedSecret;
                foundUser.save().then(()=>
                {
                    res.redirect("/secrets");
                });
            }
        }).catch(err => {res.send("No such user" + err)});
    });

app.route("/login")
    .get((req, res) =>
    {
        res.render("login");
    })
    .post((req, res) =>
    {
        const user = new User(
            {
                username: req.body.username,
                password: req.body.password
            });
        // login() function comes from passport
        req.login(user, err =>
        {
            if (err) res.send("Error, please go back and try again");
            else passport.authenticate("local")(req, res, ()=>
            {
                res.redirect("/secrets");
            });
        });
        /** Following Section of code is for Level 4 security, Hashing and Salting*/
        // const username = req.body.username;
        // const password = req.body.password;
        // User.findOne({email: username}).then(user =>
        // {
        //     if (user)
        //     {
        //         bcrypt.compare(password, user.password, function(err, result)
        //         {
        //             if (result)
        //                 res.render("secrets");
        //             else
        //                 res.send("Wrong Password");
        //         });
        //     }
        //     else
        //         res.send("You have not registered, please check username again");
        //
        // }).catch(err =>
        // {
        //     res.send(err);
        // });

    });

app.route("/secrets")
    .get((req, res) =>
    {
        User.find({"secret": {$ne: null}}).then(foundUser =>
        {
            if (foundUser)
            {
                res.render("secrets", {usersWithSecrets: foundUser});
            }
        }).catch(err => {res.send(err)});
    });

app.route("/logout")
    .get((req, res, next)=>
    {
        req.logout((err) =>
        {
            if (err)
                return next(err);
            res.redirect("/");
        });
    });

app.route("/register")
    .get( (req, res) =>
    {
        res.render("register");
    })
    .post((req, res) =>
    {
        User.register({username: req.body.username}, req.body.password, function(err, user)
        {
            if (err)
            {
                console.log(err);
                res.redirect("/register");
            }
            else
            {
                passport.authenticate("local")(req, res, ()=>
                {
                    res.redirect("/login");
                });
            }
        });
        // bcrypt.hash(req.body.password, saltRounds, function(err, hash)
        // {
        //     const newUser = new User(
        //         {
        //             email: req.body.username,
        //             password: hash
        //         });
        //     // when calling save after create a new user, it automatically encrypts password
        //     // when we do find(); it automatically decrypts password
        //     newUser.save().then(() =>
        //     {
        //         res.render("home");
        //     }).catch(err =>
        //     {
        //         res.send(err + " 400 Bad request");
        //     });

        // });
    });



app.listen(3000, ()=>
{
    console.log("Server started on port 3000");
});