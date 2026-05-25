

//setCookie("a",10, 1000)
function setCookie(nume, val, timpExpirare){//timpExpirare in milisecunde
    d=new Date();
    d.setTime(d.getTime()+timpExpirare)
    document.cookie=`${nume}=${val}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(nume){
    vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"]
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1]
    }
    return null;
}

function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`)
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}; path=/`;
}

function deleteAllCookies() {
    let vectorParametri = document.cookie.split(";");
    for (let param of vectorParametri) {
        let nume = param.trim().split("=")[0];
        deleteCookie(nume);
    }
}

window.addEventListener("load", function(){
    if (getCookie("acceptat_banner")){
        document.getElementById("banner_cookie").style.display="none";
    }

    this.document.getElementById("ok_cookies").onclick=function(){
        setCookie("acceptat_banner",true,7 * 24 * 60 * 60 * 1000);  // o saptamana: 7 * 24 * 60 * 60 * 1000;;;; 5000
        document.getElementById("banner_cookie").style.display="none"
    }


    // al doilea cookie - ulitmul produs accesat
    let ultimulProdus = getCookie("ultimul_produs");
    let ultimulProdusNume = getCookie("ultimul_produs_nume");
    let divUltimul = document.getElementById("ultimul-produs-accesat");
    if (ultimulProdus && divUltimul) {
        divUltimul.innerHTML = `Ultimul produs accesat: <a href="/produs/${ultimulProdus}">${ultimulProdusNume || ultimulProdus}</a>`;
        divUltimul.style.display = "block";
    }
})
