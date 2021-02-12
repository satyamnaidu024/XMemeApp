var express = require("express");
var app =express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var PORT = process.env.PORT || 3000;

//mongoose.connect("mongodb://localhost/memesDB");
mongoose.connect("mongodb+srv://satyamnaidu:satyamnaidu@cluster0.dcljf.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

//schema setup
var memeSchema = new mongoose.Schema({
    name : String,
    caption:String,
    memeurl:String
},{ versionKey: false });

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
app.use(methodOverride("_method"));


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
                allMemes = JSON.parse(JSON.stringify(allMemes).split('"_id":').join('"id":'));
                allMemes = JSON.parse(JSON.stringify(allMemes).split('"memeurl":').join('"url":'));
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
            res.status(404).render("error");
        }
        else
        {
            if(req.header('Accept').includes('application/json')){
                foundMeme = JSON.parse(JSON.stringify(foundMeme).split('"_id":').join('"id":'));
                foundMeme = JSON.parse(JSON.stringify(foundMeme).split('"memeurl":').join('"url":'));
                res.send(foundMeme);
               }
               else{

            res.render("singlememe",{meme:foundMeme});
               }
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

app.get("/memes/:id/edit",function(req,res)
{
    Meme.findById(req.params.id,function(err,foundMeme){
        if(err)
        {
            console.log(err);
            res.status(404).render("error");
        }
        else
        {
            res.render("editMeme",{meme:foundMeme});
        }
    })
    
});

app.patch("/memes/:id",function(req,res)
{
    // Meme.findByIdAndUpdate(req.params.id,req.body.meme,function(err,updatedMeme){
    //     if(err)
    //     {
    //         res.redirect("error");
    //     }
    //     else
    //     {   console.log(req.params.caption); 
    //         console.log(updatedMeme);   
    //         res.redirect("/memes/"+req.params.id);
    //     }
    //     })
    
        var caption = req.body.caption;
        var memeurl = req.body.memeurl;
    Meme.findById(req.params.id,function(err,data){
        data.caption = caption?caption:data.caption;
        data.memeurl = memeurl?memeurl:data.memurl;
        data.save(function(err){
            if(err)
            {
                res.redirect("error");
            }
            else
            {
                res.redirect("/memes/"+req.params.id);
                console.log("Meme has been updated successfully");
            }
        })
    })
});

app.get("*",function(req,res)
{
    res.status(404).render("error");
});

app.listen(PORT,function()
{
    console.log("XMeme Website server has started");
});
