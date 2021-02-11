var express = require("express");
var app =express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var PORT = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost/memesDB");

//schema setup
var memeSchema = new mongoose.Schema({
    name : String,
    caption:String,
    memeurl:String
});

var Meme = mongoose.model("Meme",memeSchema);

//This function is made to populate the DB
// Meme.create(
//     {name:"Satyam",
//     caption:"first meme",
//      memeurl:"https://i.redd.it/1mgi7d76tsc31.jpg"},function(err,meme)
// {
//     if(err)
//     {
//         console.log(err);
//     } else
//     {
//         console.log("new meme stored in database");
//         console.log(meme);
//     }
// });
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");


app.get("/",function(req,res)
{
    res.redirect("/memes");
});

app.get("/memes",function(req,res){
    //get all memes from memesDB
    Meme.find({},function(err,allMemes)
    {
        if(err)
        {
            console.log(err);
        } else
        {
            if(req.header('Accept').includes('application/json')){
                res.send(allMemes);
               }else{
                res.render("homePage",{memes:allMemes});
               }
        
        }
    }).sort({_id: -1}).limit(100);
});



app.get("/memes/:id",function(req,res){
    Meme.findById(req.params.id,function(err,foundMeme){
        if(err)
        {
            console.log(err);
            res.status(err.status).render("error");
        }
        else
        {
            res.render("singlememe",{meme:foundMeme});
        }
    });
});

app.post("/memes",function(req,res){
    
    var name = req.body.name;
    var caption = req.body.caption;
    var memeurl = req.body.memeurl;
    var newMeme = {name:name,caption:caption,memeurl:memeurl};
    
    Meme.insertMany(newMeme,function(err,justCreated)
    { 
        //JSON.stringify(justCreated);
        if(err)
        {
            console.log(err);
        }
        else
        {
            justCreated = justCreated[0];
            console.log("Meme has been added successfully in the DB");
            if(req.header('Content-Type').includes('application/json') ){
                var obj = {
                    id: justCreated._id
                }
                res.send(obj);
               }
               else{
                var obj = {
                    id: justCreated._id
                }
                console.log(justCreated);
                res.redirect("/memes");
               }  
        }
     });
});

app.get("*",function(req,res)
{
    res.status(404).send("Invalid Request");
});

app.listen(PORT,function()
{
    console.log("XMeme Website server has started");
});
