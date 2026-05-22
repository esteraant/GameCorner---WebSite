window.onload=function(){  //asteapta ca toata pagina sa fie incarcata in browser
    
    document.getElementById("inp-pret").onchange=function(){
        // citeste valoarea numerica noua si ii elimina din spatii daca exista
        let val=this.value.trim()
        // scrie numarul curent intre ()
        document.getElementById("infoRange").innerHTML=`(${val})`
        
    }

    // Textarea
    document.getElementById("inp-note").oninput = function() {
        // Daca textul are 0 caractere sau are minim 3, e valid
        if (this.value.trim().length >= 3 || this.value.trim().length == 0) {
            this.classList.remove("is-invalid");
        } else {
            // Altfel (dacă are 1 sau 2 caractere), e invalid
            this.classList.add("is-invalid");
        }
    }


    // a-textul cautat, b-numele real
    function cuvantGresit(a, b) {
        let dp = [];

        // construim liniile si coloanele tabelului
        for(let i = 0; i <= a.length; i++) {
            dp[i] = [];
            for(let j = 0; j <= b.length; j++) {
                // daca primul cuvant este gol, transformarea este egala cu lungimea celui de-al doilea
                if(i == 0) dp[i][j] = j;
                // daca al doilea cuvant este gol, transf este egala cu lungimea primului cuvant
                else if(j == 0) dp[i][j] = i;
                // altfel, pentru restul celulelor din tabel, pune valoarea initiala 0
                else dp[i][j] = 0;
            }
        }

        // calculam exact diferenta dintre cuvinte
        for(let i = 1; i <= a.length; i++) {
            for(let j = 1; j <= b.length; j++) {

                // daca sunt egale literele, atunci cost este 0
                let cost = (a[i-1] == b[j-1]) ? 0 : 1;

                // adaugam in celula curenta costul minim
                dp[i][j] = Math.min(
                    dp[i-1][j] + 1,   // stergere
                    dp[i][j-1] + 1,   // inserare
                    dp[i-1][j-1] + cost  // inlocuire
                );
            }
        }

        // valoarea finala = val din coltul din dreapta jos
        return dp[a.length][b.length];
    }


    function valideazaInputuri() {
        // selecteaza elem HTML pentru campul de nume si cel de notite
        let inpNume = document.getElementById("inp-nume");
        let inpNote = document.getElementById("inp-note");

        // resetam stilul - eliminam clasele de eroare din trecut
        inpNume.classList.remove("is-invalid", "input-invalid");
        inpNote.classList.remove("is-invalid", "input-invalid");

        // verificare nume - nu poate fi doar cifre
        if (inpNume.value.trim() !== "" && /^\d+$/.test(inpNume.value.trim())) {
            inpNume.classList.add("is-invalid");
            alert("Numele jocului nu poate fi format doar din cifre!");
            return false;
        }

        // verificare nume - fara caractere speciale < > ;
        if (/[<>;]/.test(inpNume.value)) {
            inpNume.classList.add("is-invalid");
            alert("Numele nu poate conține < > sau ;");
            return false;
        }

        // verificare textarea - minim 3 caractere daca e completata
        if (inpNote.value.trim().length > 0 && inpNote.value.trim().length < 3) {
            inpNote.classList.add("is-invalid");
            alert("Notițele trebuie să aibă cel puțin 3 caractere!");
            return false;
        }

        return true;
    }

    let textarea=document.getElementById("inp-note");
    textarea.oninput=function(){
        let valid=this.value.trim()=="" || this.value.trim().length>=3;
        if(valid){
            this.classList.remove("is-invalid");
        }
        else{
            this.classList.add("is-invalid");
        }
    }


    document.getElementById("filtrare").onclick=function(){
        if (!valideazaInputuri()) return;

        let inpNume=document.getElementById("inp-nume").value.trim().toLowerCase();
        let inpNote = document.getElementById("inp-note").value.trim().toLowerCase();

        let grupRadio=document.getElementsByName("gr_rad");
        let durataMin, durataMax, isToate=false;

        for(let rad of grupRadio){
            if(rad.checked){
                if(rad.value != "toate"){
                        [durataMin, durataMax]=rad.value.split(":")
                        durataMin=parseInt(durataMin)
                        durataMax=parseInt(durataMax)

                    }
                else{
                        isToate=true
                    }
                    break
                }
            }

        let inpPretMin=parseFloat(document.getElementById("inp-pret").value.trim())

        // complexitate
        let inpComplexitate = document.getElementById("inp-complexitate").value.trim().toLowerCase();

        //numar de jucatori (datalist)
        let inpNrJucatori = document.getElementById("inp-nr-jucatori").value.trim();
        

        // varsta minima (select multiplu)
        let selectVarsta = document.getElementById("inp-varsta");
        // transf varstele selectate in vector si extrage doar valoarea  
        let varsteSelectate = Array.from(selectVarsta.selectedOptions).map(o => o.value);
        // apare filtrareVarsta daca toate nu este selectat
        let filtrareVarsta = !varsteSelectate.includes("toate");


        // checkbox-uri categorii cu are/nu are
        // retine doar checkbox-urile selectate
        let chkCat = document.querySelectorAll(".chk-cat:checked");
        let catAre = [], catNuAre = [];
        for (let chk of chkCat) {
            let val = chk.value;
            // cauta butonul selectat din dreptul sau
            let rad = document.querySelector(`input[name="rad-${val}"]:checked`);

            if (rad.value == "are") 
                catAre.push(val);
            else catNuAre.push(val);
        }


        let produse=document.getElementsByClassName("produs")
        let produseVizibile = 0;   // contor pt jocurile de pe ecran
        for(let prod of produse){
            
            let nume=prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            let descriere = (prod.querySelector(".descriere-scurta")?.innerHTML || "").trim().toLowerCase();
            let durata=parseInt(prod.getElementsByClassName("val-durata")[0].innerHTML.trim());
            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
            let categoriiElem = Array.from(prod.getElementsByClassName("val-categorie"));
            let complexitate = prod.getElementsByClassName("val-complexitate")[0].innerHTML.trim().toLowerCase();
            let minJ = parseInt(prod.querySelector(".min_jucatori").innerText); 
            let maxJ = parseInt(prod.querySelector(".max_jucatori").innerText); 
            let varstaElem = prod.querySelector(".val-varsta"); 
            let categoriiText = prod.querySelector(".val-categorie").innerText.toLowerCase();

            // momentan ascundem jocul
            prod.style.display="none"

            let cond1 = inpNume == "" || nume.includes(inpNume) || cuvantGresit(inpNume, nume) <= 2;
            let cond2 = (durata>=durataMin && durata<durataMax) || isToate;
            let cond3 = pret>=inpPretMin;
            let cond4 = (inpNote == "" || descriere.includes(inpNote));
            let cond5 = inpComplexitate == "toate" || complexitate == inpComplexitate;
            let cond6 = (inpNrJucatori == "" || (parseInt(inpNrJucatori) >= minJ && parseInt(inpNrJucatori) <= maxJ));
            let cond7 = true;

            //  daca filtrarea dupa varsta este activa si elementul exista in structura jocului
            if (filtrareVarsta && varstaElem) {
                let varsta = parseInt(varstaElem.innerHTML.trim());
                // functia .some() returneaza adevarat daca macar una dintre optiunile 
                // bifate de utilizator este mai mare sau egala cu varsta jocului
                cond7 = varsteSelectate.some(v => varsta <= parseInt(v));
            }

            // .every() - toate sa fie selectate
            let cond8 = catAre.every(cat => categoriiText.includes(cat)) &&
                        catNuAre.every(cat => !categoriiText.includes(cat));

            if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8){
                prod.style.display = "block"; 
                produseVizibile++;
            }
            
        }

        let mesajLipsa = document.getElementById("mesaj-lipsa-produse");
        if (produseVizibile === 0) {
            mesajLipsa.classList.remove("d-none");
        } else {
            mesajLipsa.classList.add("d-none");  // Ascundem mesajul daca exista jocuri
        }

    }

    document.getElementById("resetare").onclick = function() {
        if (confirm("Vrei sa resetezi filtrele?") == true) {
            // Resetare valori inputuri
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = "0";
            document.getElementById("infoRange").innerHTML = "(0)";
            document.getElementById("i_rad4").checked = true;
            document.getElementById("inp-complexitate").value = "toate";
            document.getElementById("inp-nr-jucatori").value = "";
            document.getElementById("inp-note").value = "";

            let selVarsta = document.getElementById("inp-varsta");
            // parcurge toate optiunile din lista 
            for (let i = 0; i < selVarsta.options.length; i++) {
                // seteaza proprietatea selected pe true doar pentru prima opțiune (i === 0, cea cu "oricare")
                // pentru restul opțiunilor (6+, 8+), starea devine false (le deselecteaza)
                selVarsta.options[i].selected = (i === 0);
            }

            document.querySelectorAll(".chk-cat").forEach(chk => {
                chk.checked = false;
                // cauta abutonul radio cu valoarea "are" din dreptul categoriei curente si il bifeaza la loc
                document.querySelector(`input[name="rad-${chk.value}"][value="are"]`).checked = true;
            });

            // reordonare dupa id initial - anulam sortarea
            let container = document.querySelector(".grid-produse");    // unde stau toate produsele
            let listaProduse = Array.from(document.getElementsByClassName("produs"));
            
            listaProduse.sort(function(a, b) {
                // extragem id-urile celor doua
                let idA = parseInt(a.id.replace("artc-", ""));
                let idB = parseInt(b.id.replace("artc-", ""));
                // sortam matematic in functie de id
                return idA - idB;
            });

            // afisare si mutare fizica in structurra paginii
            for (let prod of listaProduse) {
                // appendChild muta fizic elem article la finalul containerului
                container.appendChild(prod); // anuleaza sortarea vizuala
                prod.style.display = "block";   // afisam produsul
            }

            // eliminam clasele de eroare
            document.getElementById("inp-nume").classList.remove("is-invalid", "input-invalid");
            document.getElementById("inp-note").classList.remove("is-invalid", "input-invalid");

            document.getElementById("mesaj-lipsa-produse").classList.add("d-none");
        
        }
    }

    function sortare(semn){
        if (!valideazaInputuri()) return;
            produse=document.getElementsByClassName("produs")
            let vProduse=Array.from(produse)
            vProduse.sort(function(a,b){ //a, b sunt taguri <article> din produse.ejs
                let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim())
                let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim())
                let durataA = parseInt(a.getElementsByClassName("val-durata")[0].innerHTML.trim())
                let durataB = parseInt(b.getElementsByClassName("val-durata")[0].innerHTML.trim())
                
                let raportA = durataA / pretA
                let raportB = durataB / pretB
                
                if(raportA == raportB){
                    // daca sunt egale, sortam dupa complexitate
                    let complexA = a.getElementsByClassName("val-complexitate")[0].innerHTML.trim()
                    let complexB = b.getElementsByClassName("val-complexitate")[0].innerHTML.trim()
                    return complexA.localeCompare(complexB) * semn
                }
                return (raportA - raportB) * semn
            })

            for(let prod of vProduse){
                prod.parentElement.appendChild(prod) //il muta la finalul containerului

            }
    }

    document.getElementById("sortCrescNume").onclick=function(){sortare(1)}
    document.getElementById("sortDescrescNume").onclick=function(){sortare(-1)}


    document.getElementById("calculeaza").onclick = function(){
        if (!valideazaInputuri()) return;
        let produse = document.getElementsByClassName("produs")
        let suma = 0
        for(let prod of produse){
            if(prod.style.display != "none"){
                suma += parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            }
        }

        // afisarea sumei pe ecran
        // daca exista deja caseta cu id-ul infosuma
        let div = document.getElementById("infoSuma")
        // daca e prima oara cand apasa butonul, il creeaza
        if(!div){
            div = document.createElement("div")
            div.id = "infoSuma"
            div.innerHTML = `Suma prețurilor: ${suma.toFixed(2)} RON`
            // insereaza noul div creat la sfarsitul corpului paginii
            document.body.appendChild(div)

            // stergerea dupa 2s
            setTimeout(function(){
                // cauta elemtnul sumei din pagina
                let d = document.getElementById("infoSuma")
                if(d) 
                    d.remove()
            }, 2000)
        } else {
            // daca exista deja il reactualizeaza
            div.innerHTML = `Suma prețurilor: ${suma.toFixed(2)} RON`
        }
    }

    // window.onkeydown=function(e){
    //     if(e.key=="c" && e.altKey==true){
    //         let produse=document.getElementsByClassName("produs")
    //         let suma=0
    //         for(let prod of produse){
    //             if(prod.style.display!="none")
    //             {
    //                 let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
    //                     suma+=pret
    //             }
                
    //         }
    //         let p=document.getElementById("infoSuma")
    //         if(!p){
    //             let p=document.createElement("p") //<p>
    //             p.innerHTML=suma
    //             p.id="infoSuma"
    //             let sectiuneProduse=this.document.getElementById("produse")
    //             sectiuneProduse.parentElement.insertBefore(p, sectiuneProduse)
    //             this.setTimeout(function(){
    //                 let p1=document.getElementById("infoSuma")
    //                 if(p1){
    //                     p1.remove()
    //                 }
    //             }, 2000)
    //         }
    //         else{
    //             p.innerHTML=suma
    //         }
    //     }


    // }
}
