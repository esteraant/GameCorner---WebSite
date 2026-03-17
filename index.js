const express= require("express");
const path= require("path");

app= express();
app.set("view engine", "ejs")

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

app.use("/resurse", express.static(path.join(__dirname, "resurse")))

app.get("/cale", function(req,res){
    console.log("S-a accesat <b style='color:red;'>ruta</b> /cale");
    res.send("S-a accesat <b style='color:red;'>ruta</b> /cale");
})


app.get("/cale2", function(req,res){
    res.write("123");
    res.write("456");
    res.end();
})

app.get("/", function(req, res){
    res.render("pagini/index");
})


app.listen(8080);
console.log("Serverul a pornit!");