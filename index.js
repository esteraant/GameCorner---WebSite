const express= require("express");
const path= require("path");
const fs=require("fs");
const sass=require("sass");
const sharp=require("sharp");


app= express();
app.set("view engine", "ejs") //motorul de randare

///3. Calea folderului, calea fisierului si folderul curent
console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

// app.get(["/", "/index", "/home"], function(req, res){ //cerinta 8
//     console.log("get on '/' ")
//     res.render("pagini/index") //trimite pagina catre utilizator
// })

// Cerinta 13
obGlobal={
    obErori:null,
    obImagini:null, 
    // Etapa 5 - compilare scss - a)
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
}


//  Cerinta 20 - ce foldere trb sa existe obligatoriu la pornire
vect_foldere=["temp", "logs", "backup", "fisiere_uploadate"]

for(let folder of vect_foldere){
    let caleFolder = path.join(__dirname, folder);
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder, {recursive:true});
    }
}

app.use("/resurse", express.static(path.join(__dirname, "resurse")));  //6. Folder static
app.use("/dist", express.static(path.join(__dirname, "node_modules/dist")));
//orice caut in /resurse cauta in acest folder

//  Ora curenta pentru galerie 
function esteInInterval(interval) {
    const acum = new Date();
    const oraCurenta = acum.getHours() * 60 + acum.getMinutes();
    
    const [start, sfarsit] = interval.split("-");
    const [hStart, mStart] = start.split(":").map(Number);
    const [hSfarsit, mSfarsit] = sfarsit.split(":").map(Number);
    
    const minStart = hStart * 60 + mStart;
    const minSfarsit = hSfarsit * 60 + mSfarsit;
    
    return oraCurenta >= minStart && oraCurenta <= minSfarsit;
}

app.get(["/", "/index","/home"], function(req, res){
    // Filtrare dupa timp
    let imaginiFiltrate = obGlobal.obImagini.imagini.filter(img => esteInInterval(img.timp));

    // Trunchiere la 10 imagini
    imaginiFiltrate = imaginiFiltrate.slice(0, 10);

    res.render("pagini/index", {
        ip:req.ip,                      // Cerinta 16
        imagini:imaginiFiltrate,
        caleBaza: obGlobal.obImagini.cale_galerie

    });
});

app.get("/despre", function(req, res){
    res.render("pagini/despre");
});


// Cerinta 19
app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
});



function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut) //transforma fisierul JSON intr-un obiect
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine) //completez path-ul complet prin concatenare
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori()



function afisareEroare(res, identificator, titlu, text, imagine){
    //TO DO cautam eroarea dupa identificator
    let eroare=obGlobal.obErori.info_erori.find((elem)=>  //in stilul: v.find(x)=> x%8==0
        elem.identificator==identificator
    )
    //daca sunt setate titlu, text, imagine, le folosim, 
    //altfel folosim cele din fisierul json pentru eroarea gasita
    //daca nu o gasim, afisam eroarea default
    let errDefault=obGlobal.obErori.eroare_default;
    if (eroare?.status)
        res.status(eroare.identificator);
    res.render("pagini/eroare",{            // Cerinta 14
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    });

}

app.get("/eroare", function(req,res){
    afisareEroare(res, 404, "Eroare 404 - Pagina nu a fost gasita");
});


function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleGalerie=obGlobal.obImagini.cale_galerie

    //let caleAbs=path.join(__dirname,caleGalerie);

    // ["mediu", "mic"].forEach(dim => {
    //     let caleDimAbs = path.join(caleAbs, dim);
    //     if (!fs.existsSync(caleDimAbs)) {
    //         fs.mkdirSync(caleDimAbs, { recursive: true });
    //     }
    // });
    
    // for (let imag of vImagini){
    //     [numeFis, ext]=imag.cale_imagine.split("."); //"ceva.png" -> ["ceva", "png"]
    //     let caleFisAbs=path.join(caleAbs,imag.cale_imagine);

    //     // Generam versiunea MEDIE 
    //     let caleFisMediuAbs = path.join(caleAbs, "mediu", numeFis + ".webp");
    //     if (!fs.existsSync(caleFisMediuAbs)) {
    //         sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
    //     }

    //     // Generam versiunea MICA 
    //     let caleFisMicAbs = path.join(caleAbs, "mic", numeFis + ".webp");
    //     if (!fs.existsSync(caleFisMicAbs)) {
    //         sharp(caleFisAbs).resize(200).toFile(caleFisMicAbs);
    //     }


    //     // Salvam caile relative
    //     imag.fisier_mediu=path.join("/", caleGalerie, "mediu", numeFis+".webp" )
    //     imag.fisier_mic = path.join("/", caleGalerie, "mic", numeFis + ".webp");
    //     imag.fisier=path.join("/", caleGalerie, imag.cale_imagine )
        
    // }

    //  Pregatirea cailor pt EJS
    for (let imag of vImagini) {
        let [numeFis, ext] = imag.cale_imagine.split(".");
        imag.fisier_mediu = path.join("/", caleGalerie, "mediu", numeFis + ".webp");
        imag.fisier_mic = path.join("/", caleGalerie, "mic", numeFis + ".webp");
        imag.fisier = path.join("/", caleGalerie, imag.cale_imagine);
    }


    // console.log(obGlobal.obImagini)
}
initImagini();

function compileazaScss(caleScss, caleCss){
    // gestionare nume fisier CSS daca lipseste
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
    }
    
    // transf in cai absolute daca sunt relative 
    // cale abs - drumul intreg de la radacina pana la fisier
    // cale relatica -  drumul catre un fisier pornind din locul in care suntem atunci
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    // pregatire folder backup
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        let caleDestinatieBackup = path.join(obGlobal.folderBackup, "resurse/css", numeFisCss);

        try {
            fs.copyFileSync(caleCss, caleDestinatieBackup);
        } catch (err) {
            console.error("Eroare backup - Nu s-a putut salva fisierul vechi");
        }
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    
}

//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}
// compilare pe parcurs
fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (numeFis && path.extname(numeFis) === ".scss")
        if (eveniment=="change" || eveniment=="rename"){
            let caleCompleta=path.join(obGlobal.folderScss, numeFis);
            if (fs.existsSync(caleCompleta)){
                compileazaScss(caleCompleta);
            }
        }
})


// async - poate face mai multe lucruri asincron
app.get("/galerie-statica", async function(req, res) {
    let imaginiFiltrate = obGlobal.obImagini.imagini.filter(img => esteInInterval(img.timp));
    imaginiFiltrate = imaginiFiltrate.slice(0, 10);

    const caleGalerie = obGlobal.obImagini.cale_galerie;
    const caleAbs = path.join(__dirname, caleGalerie);

    try {
        if (!fs.existsSync(path.join(caleAbs, "mediu"))) {
            fs.mkdirSync(path.join(caleAbs, "mediu"), { recursive: true });
            console.log("Creat folder mediu");
        }
        if (!fs.existsSync(path.join(caleAbs, "mic"))) {
            fs.mkdirSync(path.join(caleAbs, "mic"), { recursive: true });
            console.log("Creat folder mic");
        }
    } catch (e) {
        console.error("Eroare la crearea folderelor:", e);
    }

    // verificam si verificam doar pt imaginile care vor fi afisate acum
    for (let imag of imaginiFiltrate) {
        let numeFis = path.basename(imag.fisier, path.extname(imag.fisier)); // extragem numele fara extensie
        let caleOriginalaAbs = path.join(__dirname, imag.fisier);

        // generare mediu daca nu exista
        let caleMediuAbs = path.join(caleAbs, "mediu", numeFis + ".webp");
        if (!fs.existsSync(caleMediuAbs)) {
            await sharp(caleOriginalaAbs).resize(300).toFile(caleMediuAbs);
            console.log(`Generat mediu pentru: ${numeFis}`);
        }

        // generare mic daca nu exista
        let caleMicAbs = path.join(caleAbs, "mic", numeFis + ".webp");
        if (!fs.existsSync(caleMicAbs)) {
            await sharp(caleOriginalaAbs).resize(150).toFile(caleMicAbs);
            console.log(`Generat mic pentru: ${numeFis}`);
        }
    }

    res.render("pagini/galerie-statica", {
        imagini: imaginiFiltrate,
        caleBaza: caleGalerie
    });
});

app.get("/*pagina", function(req, res){
    console.log("Pagina ceruta", req.url);
    if(req.url.startsWith("/resurse") && path.extname(req.url) == ""){
        afisareEroare(res, 403);
        return;
    }
    if(path.extname(req.url) == ".ejs"){
        afisareEroare(res, 400);
        return;
    }
    try{  // 10. Eroare 404
        res.render("pagini" + req.url, function(err, rezRandare){
            if(err){
                if(err?.message.includes("Failed to lookup view")){
                    afisareEroare(res, 404);            
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                res.send(rezRandare);
            }
        })
    }
    catch(err){
        if(err?.message.includes("Cannot find module")){
            afisareEroare(res, 404);            
        }
    }
});

app.listen(8080);
console.log("Serverul a pornit!");