const express= require("express");
const path= require("path");
const fs=require("fs");
const sass=require("sass");
const sharp=require("sharp");

const ejs=require('ejs');
const pg = require("pg");

const AccesBD= require("./module_proprii/accesbd.js");
const {Utilizator}=require("./module_proprii/utilizator.js")
const Drepturi = require("./module_proprii/drepturi.js");
const { RolFactory } = require("./module_proprii/roluri.js");
// const pathOferte = path.join(__dirname, 'oferte.json');

app= express();
app.set("view engine", "ejs") //motorul de randare

///3. Calea folderului, calea fisierului si folderul curent
console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

// app.use(function(req, res, next){
//     res.locals.vazutDeToti=[1,2,3];
  
//     next();
// })

// app.get(["/", "/index", "/home"], function(req, res){ //cerinta 8
//     console.log("get on '/' ")
//     res.render("pagini/index", {
//        ip:req.ip
//      }); //trimite pagina catre utilizator
// });

client=new pg.Client({
    database:"cti_2026",
    user:"estera",
    password:"tehniciweb",
    host:"localhost",
    port:5432
})

client.connect()
// citeste din baza de date, la  pornire, pt a adauga in meniu tipurile de jocuri existente
client.query("SELECT unnest(enum_range(null::tipuri_jocuri)) as nume_categorie", function(err, rez) {
    if (err) {
        console.error("Eroare preluare categorii meniu:", err);
    } else {
        app.locals.optiuni = rez.rows;
        // console.log(rez)
        // obGlobal.optiuniMeniu=rez.rows
    }
});

client.query("select * from jocuri", function(err, rez){
    if(err){
        console.log("Eroare:", err);
    }
    else{
        console.log(rez.rows);
        console.log("Numar randuri:", rez.rowCount);
    }
})


// Cerinta 13
obGlobal={
    obErori:null,
    obImagini:null, 
    nrGalerie:0,
    // Etapa 5 - compilare scss - a)
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
    //optiuniMeniu:[],
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
// interval = string (HH:MM-HH:MM)
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

app.get("/contact", function(req, res) {
    res.render("pagini/contact");
});
// Cerinta 19
app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
});


app.get("/produse", function(req, res){
    let clauzaWhere=""
    // daca utilizatorul a venit de pe un link de filtrare rapida in url
    if(req.query.tip)
        clauzaWhere = ` WHERE tip_joc = '${req.query.tip}'::tipuri_jocuri `
    const coloaneRelevante = "id, nume, pret, durata_minute, complexitate, min_jucatori, max_jucatori, tip_joc, categorie, are_mod_solo, imagine, data_adaugarii, varsta_minima, descriere"; 
    client.query(`SELECT ${coloaneRelevante} FROM jocuri ${clauzaWhere} ORDER BY id ASC`, function(err, rez) {
        if (err){
            console.log("EROARE EXACTA:", err.message)
            afisareEroare(res, 2)
        }
        else{
            for(let joc of rez.rows){
                joc.categorie=(typeof joc.categorie==='string') ? joc.categorie.split(',').map(s => s.trim()) : [];
                
                // formatare data: 'zi nume_luna an [zi_saptamana]'
                const luni=["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", 
                        "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
                const zileSaptamana=["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
                
                let d=new Date(joc.data_adaugarii);
                joc.data_formatata=`${d.getDate()} ${luni[d.getMonth()]} ${d.getFullYear()} [${zileSaptamana[d.getDay()]}]`;
            
            }
            client.query("select unnest(enum_range(null::tipuri_jocuri)) as nume_categorie", function(err, rezOptiuni){
            if(err){
                afisareEroare(res, 2)
            }
            else{
                res.render("pagini/produse",{
                    produse: rez.rows,
                    optiuni:rezOptiuni.rows
                    })
             }
            })
        }
})

})


app.get("/produs/:id", function(req, res){
    console.log("ID cerut:", req.params.id)
    
    client.query(`select * from jocuri where id=${req.params.id}`, function(err, rez){
        if(err){
            console.log("Eroare", err)
            afisareEroare(res, 2)
        }
        else{
            if(rez.rowCount == 0)
                afisareEroare(res, 404, "Produsul nu a fost gasit")
            else
                res.render("pagini/produs", { prod: rez.rows[0] })
        }
    })
})



//          BONUS ETAPA 4
function valideazaErori() {
    const caleJSON = path.join(__dirname, "resurse/json/erori.json");

    // A. verificare existenta fisier erori.json
    if (!fs.existsSync(caleJSON)) {
        console.error("EROARE: Fișierul 'erori.json' lipsește");
        console.error("Remediere: Verificati ca fisierul este in folderul resurse/json/.");
        process.exit(); // inchidere aplicatie
    }

    let continut = fs.readFileSync(caleJSON).toString("utf-8");



    // F. proprietati duplicate
    // impartim textul in functie de acolade
    let segmente = continut.split("}"); 

    for (let segment of segmente) {
        // curatam de spatii
        let textObiect = segment.trim();
        if (!textObiect) continue;

        let cheiDeVerificat = ["identificator", "titlu", "text", "imagine"];

        for (let cheie of cheiDeVerificat) {
            // cautam de cate ori apare cheia in formatul "cheie"
            // {titlu: A, titlu: B}  --> "{", ": A, ", ": B}"
            let numarAparitii = textObiect.split(`"${cheie}"`).length - 1;

            if (numarAparitii > 1) {
                console.error(`EROARE: Proprietatea "${cheie}" apare de ${numarAparitii} ori în obiectul: \n ${textObiect}}`);
            }
        }
    }

   let obJson = JSON.parse(continut);

    // B. proprietati obligatorii
    let propNecesare = [
        "info_erori",
        "cale_baza",
        "eroare_default"
    ];

    for(let prop of propNecesare){
        if(!(prop in obJson)){
            console.error(
                `EROARE: lipseste proprietatea ${prop}`
            );
        }
    }

     // C. default
    let defaultNecesare=[
        "titlu",
        "text",
        "imagine"
    ];

    for(let prop of defaultNecesare){
        if(!(prop in obJson.eroare_default)){
            console.error(
                `EROARE: eroare_default nu are ${prop}`
            );
        }
    }


    // D. folder baza nu exista in fisiere
    let caleFolder = path.join(__dirname, obJson.cale_baza);

    if(!fs.existsSync(caleFolder)){
        console.error(
            `EROARE: folderul ${obJson.cale_baza} nu exista`
        );
    }

    // E. imagini existente
    let toateErorile = [ obJson.eroare_default, ...obJson.info_erori];

    for(let err of toateErorile){
        let caleImg = path.join(__dirname, obJson.cale_baza, err.imagine);

        if(!fs.existsSync(caleImg)){
            console.error(
                `EROARE: imagine inexistenta: ${err.imagine}`
            );
        }
    }

     // G. identificatori duplicati in vectorul info_erori
    let identificatoriVazuti = [];
    let duplicateGasite = {};

    for (let eroare of obJson.info_erori) {
        let id = eroare.identificator;

        if (identificatoriVazuti.includes(id)) {
            if (!duplicateGasite[id]) {
                // adaugam si prima aparitie
                let primaAparitie = obJson.info_erori.find(e => e.identificator === id);
                duplicateGasite[id] = [primaAparitie];
            }
            duplicateGasite[id].push(eroare);
        } else {
            identificatoriVazuti.push(id);
        }
    }

    for (let id in duplicateGasite) {
        console.error(`EROARE: Identificatorul "${id}" apare de mai multe ori în vectorul "info_erori". Erorile duplicate sunt:`);
        for (let eroare of duplicateGasite[id]) {
            // afisam toate proprietatile mai putin identificator
            let { identificator, ...restProprietati } = eroare;
            console.error(`  - ${JSON.stringify(restProprietati)}`);
        }
        console.error(`Remediați prin eliminarea sau modificarea erorilor duplicate din erori.json.`);
    }
}
valideazaErori();

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


app.get("/galerie-dinamica", function(req, res) {
    // filtram pozele cu < 12 caractere
    let imaginiEligibile = obGlobal.obImagini.imagini.filter(img => img.cale_imagine.length < 12);
    
    // alegem aleator 4, 9 sau 16
    const variante = [4, 9, 16];
    const nrImagini = variante[Math.floor(Math.random() * variante.length)];
    
    const n = Math.sqrt(nrImagini); // nr de coloane/randuri
    
    obGlobal.nrGalerie = nrImagini;
    // selectam imagini distincte, amestecandu-le
    let selectate = imaginiEligibile.sort(() => 0.5 - Math.random()).slice(0, nrImagini);
    const ordini = {
        4: [0, 2, 1, 3],           // grid 2x2
        9: [0, 2, 1, 6, 3, 4, 8, 7, 5],  // grid 3x3
        16: [0,2,1,3, 12,4,5,6, 8,13,9,7, 15,14,11,10] // grid 4x4
    };

    let ordine = ordini[nrImagini];
    let selectateOronate = ordine.map(i => selectate[i]);
    
    res.render("pagini/galerie-dinamica", {
        imaginiAnimatie: selectate,
        nGrid: n,
        nrImagini: nrImagini,
        // imagini: imaginiStatice
    });
});


app.get("/galerie-animata.css",function(req, res){

    var sirScss=fs.readFileSync(path.join(__dirname,"resurse/scss_ejs/galerie_animata.scss")).toString("utf8");
    var culori=["navy","black","purple","grey"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator]; 

    rezScss=ejs.render(sirScss,{
            culoare: culoareAleatoare,
            nrimag: obGlobal.nrGalerie
        });

    console.log(rezScss);
    var caleScss=path.join(__dirname,"temp/galerie_animata.scss")
    fs.writeFileSync(caleScss,rezScss);
    try {
        rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
        var caleCss=path.join(__dirname,"temp/galerie_animata.css");
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        res.sendFile(caleCss);
    }
    catch (err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
});


function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    // transf textul in obiesct javascript
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

    // BONUS 5 - ETAPA 5
function valideazaImagini() {
    const caleJSON = path.join(__dirname, "resurse/json/galerie.json");
    let continut = fs.readFileSync(caleJSON).toString("utf-8");
    let obJson = JSON.parse(continut);

    // 1. Verificare folder cale_galerie
    let caleGalerie = path.join(__dirname, obJson.cale_galerie);
    if (!fs.existsSync(caleGalerie)) {
        console.error(
            `EROARE: Folderul galeriei "${obJson.cale_galerie}" nu exista. Creati folderul sau corectati proprietatea "cale_galerie" din galerie.json.`
        );
    }

    // 2. Verificare existenta fisiere imagini
    for (let imag of obJson.imagini) {
        let caleImag = path.join(__dirname, obJson.cale_galerie, imag.cale_imagine);
        if (!fs.existsSync(caleImag)) {
            console.error(
                `EROARE: Imaginea "${imag.cale_imagine}" specificata in galerie.json nu exista in folderul "${obJson.cale_galerie}". Verificati ca fisierul exista si ca numele este scris corect in JSON.`
            );
        }
    }
}
valideazaImagini();

function compileazaScss(caleScss, caleCss){
    // gestionare nume fisier CSS daca lipseste
    if(!caleCss){

        // let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        // let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        let numeFis = path.basename(caleScss, ".scss");     // BONUS 4 - ETAPA 5
        caleCss=numeFis+".css"; // output: a.css
    }
    
    // transf in cai absolute daca sunt relative 
    // cale abs - drumul intreg de la radacina pana la fisier
    // cale relativa -  drumul catre un fisier pornind din locul in care suntem atunci
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

    let numeFisCss=path.basename(caleCss); // salveaza numele fisierului rezultat
    if (fs.existsSync(caleCss)){ // daca exista deja un fis cu acelasi nume
        let numeFaraExt = path.basename(caleCss, ".css");  // a.css -> a
        let timestamp = Date.now();
        let numeFisBackup = `${numeFaraExt}_${timestamp}.css`;    // BONUS 3 - ETAPA 5
        let caleDestinatieBackup = path.join(obGlobal.folderBackup, "resurse/css", numeFisBackup);

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
app.get("/galerie-Statica", async function(req, res) {
    let imaginiFiltrate = obGlobal.obImagini.imagini.filter(img => esteInInterval(img.timp));
    imaginiFiltrate = imaginiFiltrate.slice(0, 10);

    const caleGalerie = obGlobal.obImagini.cale_galerie;
    const caleAbs = path.join(__dirname, caleGalerie); // transf calea relativa in absoluta

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

    // verificam doar pt imaginile care vor fi afisate acum
    for (let imag of imaginiFiltrate) {
        let numeFis = path.basename(imag.fisier, path.extname(imag.fisier)); // extragem numele fara extensie
        let caleOriginalaAbs = path.join(__dirname, imag.fisier);

        // generare mediu daca nu exista
        // defineste calea de salvare pt varianta optimizata
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


//      BONUS 12 - ETAPA 6 
// configurare intervale
// const T = 60000;      // o oferta noua la fiecare minut
// const T2 = 120000;     // stergem ofertele expirate de mai mult de 2 minute

// function pornesteSistemOferte(clientSql) {
//     setInterval(async () => {
//         try {
//             // preluam categoriile unice din baza de date dinamic
//             const rez = await clientSql.query("SELECT DISTINCT nume_categorie FROM categorii"); 
//             // ajusteaza query-ul de mai sus in functie de tabela, ex: SELECT DISTINCT tip_joc FROM jocuri
//             const categorii = rez.rows.map(row => row.nume_categorie || row.tip_joc);

//             if (categorii.length === 0) return;

//             // citim fisierul JSON existent
//             let dateJson = { oferte: [] };
//             if (fs.existsSync(pathOferte)) {
//                 dateJson = JSON.parse(fs.readFileSync(pathOferte, 'utf8'));
//             }

//             // determinam ultima categorie folosita ca sa nu o repetam consecutiv
//             const ultimaCategorie = dateJson.oferte.length > 0 ? dateJson.oferte[0].categorie : null;
            
//             let categorieAleasa;
//             do {
//                 categorieAleasa = categorii[Math.floor(Math.random() * categorii.length)];
//             } while (categorieAleasa === ultimaCategorie && categorii.length > 1);

//             // alegem o reducere aleatorie
//             const reduceriPosibile = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
//             const reducereAleasa = reduceriPosibile[Math.floor(Math.random() * reduceriPosibile.length)];

//             // calculam datele: incepere acum, finalizare peste intervalul T
//             const acum = new Date();
//             const finalizare = new Date(acum.getTime() + T);

//             const nouaOferta = {
//                 "categorie": categorieAleasa,
//                 "data-incepere": acum.toISOString(),
//                 "data-finalizare": finalizare.toISOString(),
//                 "reducere": reducereAleasa
//             };

//             // adaugam noua oferta la inceputul vectorului
//             dateJson.oferte.unshift(nouaOferta);

//             // stergem ofertele mai vechi de T2 decat momentul expirarii lor
//             const limitaStergere = acum.getTime() - T2;
//             dateJson.oferte = dateJson.oferte.filter(o => {
//                 return new Date(o["data-finalizare"]).getTime() > limitaStergere;
//             });

//             // salvam inapoi in fisier
//             fs.writeFileSync(pathOferte, JSON.stringify(dateJson, null, 2), 'utf8');
//             console.log(`Ofertă nouă: Categorie: ${categorieAleasa}, Reducere: ${reducereAleasa}%`);

//         } catch (eroare) {
//             console.error("Eroare la generarea ofertei:", eroare);
//         }
//     }, T);
// }

// // trimitem ultima oferta din JSON in locals pentru a fi accesibila in toate paginile EJS
// function adaugaOfertaInLocals(req, res, next) {
//     try {
//         if (fs.existsSync(pathOferte)) {
//             const dateJson = JSON.parse(fs.readFileSync(pathOferte, 'utf8'));
//             if (dateJson.oferte && dateJson.oferte.length > 0) {
//                 const primaOferta = dateJson.oferte[0];
//                 // verificam daca oferta curenta inca este valida
//                 if (new Date(primaOferta["data-finalizare"]) > new Date()) {
//                     res.locals.ofertaCurenta = primaOferta;
//                 } else {
//                     res.locals.ofertaCurenta = null;
//                 }
//             }
//         }
//     } catch (e) {
//         res.locals.ofertaCurenta = null;
//     }
//     next();
// }

// app.use(adaugaOfertaInLocals);
// pornesteSistemOferte(dbClient); 


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