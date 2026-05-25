const {Client, Pool}=require("pg");

/**
 * Clasa Singleton pentru accesarea bazei de date PostgreSQL
 */

/**
     * @typedef {object} ObiectQuerySelect
     * @property {string} tabel
     * @property {string[]} campuri
     * @property {string[]} conditiiAnd
 */

 /**
     * @typedef {object} ObiectConexiune
     * @property {string} init
 */


class AccesBD{
    static #instanta=null;
    static #initializat=false;

    /**
     * Constructor privat, arunca eroare daca clasa e deja instantiata
     * @throws {Error} Daca instanta exista deja
     */
    constructor() {
        if(AccesBD.#instanta){
            throw new Error("Deja a fost instantiat");
        }
        else if(!AccesBD.#initializat){
            throw new Error("Trebuie apelat doar din getInstanta; fara sa fi aruncat vreo eroare");
        }
    }

   

    /**
     * Returneaza instanta unica a clasei
     *
     * @param {ObiectConexiune} init - un obiect cu datele pentru query
     * @returns {AccesBD}
     */
    static getInstanta({init="local"}={}){
        if(!this.#instanta){
            this.#initializat=true;
            this.#instanta=new AccesBD();

            //initializarea poate arunca erori
            //vom adauga aici cazurile de initializare 
            //pentru baza de date cu care vrem sa lucram
            try{
                switch(init){
                    case "local":this.#instanta.initLocal();
                }
                //daca ajunge aici inseamna ca nu s-a produs eroare la initializare
                
            }
            catch (e){
                console.error("Eroare la initializarea bazei de date!");
            }

        }
        return this.#instanta;
    }

    /**
     * Initializeaza conexiunea locala la baza de date
     * @returns {void}
     */

    initLocal(){
        this.client= new Client({database:"cti_2026",
            user:"estera", 
            password:"tehiniciweb", 
            host:"localhost", 
            port:5432}
        );
        this.client.connect();
        
    }

    /**
     * Returneaza clientul de conexiune la baza de date
     * @returns {import('pg').Client} Clientul bazei de date
     * @throws {Error} Daca clasa nu a fost instantiata
     */

    getClient(){
        if(!AccesBD.#instanta ){
            throw new Error("Nu a fost instantiata clasa");
        }
        return this.client;
    }

    /**
     * Selecteaza inregistrari din baza de date
     * @param {ObiectQuerySelect} obj- Parametrii query-ului
     * @param {function(Error, Object): void} callback - Functie callback cu eroare si rezultat
     * @returns {void}
     */

    select({tabel="",campuri=[],conditiiAnd=[]} = {}, callback, parametriQuery=[]){
        let conditieWhere="";
        if(conditiiAnd.length>0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`; 
        let comanda=`select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error(comanda);
        /*
        comanda=`select id, camp1, camp2 from tabel where camp1=$1 and camp2=$2;
        this.client.query(comanda,[val1, val2],callback)

        */
        this.client.query(comanda,parametriQuery, callback)
    }

    /**
     * Selecteaza inregistrari asincron din baza de date
     * @param {ObiectQuerySelect} obj - Parametrii query-ului
     * @returns {Promise<Object|null>} Rezultatul query-ului sau null daca a aparut o eroare
     */

    async selectAsync({tabel="",campuri=[],conditiiAnd=[]} = {}){
        let conditieWhere="";
        if(conditiiAnd.length>0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        
        let comanda=`select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error("selectAsync:",comanda);
        try{
            let rez=await this.client.query(comanda);
            console.log("selectasync: ",rez);
            return rez;
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    /**
     * Insereaza o inregistrare in tabel
     * @param {Object} obj - Parametrii inserarii
     * @param {string} obj.tabel - Numele tabelului
     * @param {Object} obj.campuri - Obiect cu perechile camp-valoare de inserat
     * @param {function(Error, Object): void} callback - Functie callback cu eroare si rezultat
     * @returns {void}
     */

    insert({tabel="",campuri={}} = {}, callback){
        console.log("-------------------------------------------")
        console.log(Object.keys(campuri).join(","));
        console.log(Object.values(campuri).join(","));
        let comanda=`insert into ${tabel}(${Object.keys(campuri).join(",")}) values ( ${Object.values(campuri).map((x) => `'${x}'`).join(",")})`;
        console.log(comanda);
        this.client.query(comanda,callback)
    }

     
    // update({tabel="",campuri=[],valori=[], conditiiAnd=[]} = {}, callback, parametriQuery){
    //     if(campuri.length!=valori.length)
    //         throw new Error("Numarul de campuri difera de nr de valori")
    //     let campuriActualizate=[];
    //     for(let i=0;i<campuri.length;i++)
    //         campuriActualizate.push(`${campuri[i]}='${valori[i]}'`);
    //     let conditieWhere="";
    //     if(conditiiAnd.length>0)
    //         conditieWhere=`where ${conditiiAnd.join(" and ")}`;
    //     let comanda=`update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
    //     console.log(comanda);
    //     this.client.query(comanda,callback)
    // }

    /**
     * Actualizeaza inregistrari in tabel
     * @param {ObiectQuerySelect} obj
     * @param {function(Error, Object): void} callback - Functie callback cu eroare si rezultat
     * @returns {void}
     */

    update({tabel="",campuri={}, conditiiAnd=[]} = {}, callback, parametriQuery){
        let campuriActualizate=[];
        for(let prop in campuri)
            campuriActualizate.push(`${prop}='${campuri[prop]}'`);
        let conditieWhere="";
        if(conditiiAnd.length>0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        let comanda=`update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda,callback)
    }

    updateParametrizat({tabel="",campuri=[],valori=[], conditiiAnd=[]} = {}, callback, parametriQuery){
        if(campuri.length!=valori.length)
            throw new Error("Numarul de campuri difera de nr de valori")
        let campuriActualizate=[];
        for(let i=0;i<campuri.length;i++)
            campuriActualizate.push(`${campuri[i]}=$${i+1}`);
        let conditieWhere="";
        if(conditiiAnd.length>0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        let comanda=`update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1111",comanda);
        this.client.query(comanda,valori, callback)
    }


    //TO DO
    // updateParametrizat({tabel="",campuri={}, conditiiAnd=[]} = {}, callback, parametriQuery){
    //     let campuriActualizate=[];
    //     for(let prop in campuri)
    //         campuriActualizate.push(`${prop}='${campuri[prop]}'`);
    //     let conditieWhere="";
    //     if(conditiiAnd.length>0)
    //         conditieWhere=`where ${conditiiAnd.join(" and ")}`;
    //     let comanda=`update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
    //     this.client.query(comanda,valori, callback)
    // }

    /**
     * Sterge inregistrari din tabel
     * @param {ObiectQuerySelect} obj
     * @param {function(Error, Object): void} callback - Functie callback cu eroare si rezultat
     * @returns {void}
     */

    delete({tabel="",conditiiAnd=[]} = {}, callback){
        let conditieWhere="";
        if(conditiiAnd.length>0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        
        let comanda=`delete from ${tabel} ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda,callback)
    }

    query(comanda, callback){
        this.client.query(comanda,callback);
    }

}

module.exports=AccesBD;