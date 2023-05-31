//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema(
    {
        email: {type: String, required: [true, "Must need an email for username"]},
        password: {type: String, required: [true, "Must have a password"]}
    });

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

// creating the table, table name is User and using userSchema
const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) =>
{
    res.render("home");
});

app.route("/login")
    .get((req, res) =>
    {
        res.render("login");
    })
    .post((req, res) =>
    {
        const username = req.body.username;
        const password = req.body.password;
        User.findOne({email: username}).then(user =>
        {
            if (user)
            {
                bcrypt.compare(password, user.password, function(err, result)
                {
                    if (result)
                        res.render("secrets");
                    else
                        res.send("Wrong Password");
                });
            }
            else
                res.send("You have not registered, please check username again");

        }).catch(err =>
        {
            res.send(err);
        });

    });

app.route("/register")
    .get( (req, res) =>
    {
        res.render("register");
    })
    .post((req, res) =>
    {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash)
        {
            const newUser = new User(
                {
                    email: req.body.username,
                    password: hash
                });
            // when calling save after create a new user, it automatically encrypts password
            // when we do find(); it automatically decrypts password
            newUser.save().then(() =>
            {
                res.render("home");
            }).catch(err =>
            {
                res.send(err + " 400 Bad request");
            });

        });
    });



app.listen(3000, ()=>
{
    console.log("Server started on port 3000");
});