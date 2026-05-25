
const Drepturi=require('./drepturi.js');

/**
 * Clasa de baza pentru rolurile utilizatorilor
 * Contine codul rolului si metoda de verificare a drepturilor
 */

class Rol{
    /**
     * Returneaza tipul rolului
     * @returns {string} Tipul rolului
     */

    static get tip() {return "generic"}

    /**
     * Returneaza lista drepturilor asociate rolului
     * @returns {Symbol[]} Lista de drepturi
     */

    static get drepturi() {return []}
    /**
     * Creeaza o instanta de Rol si seteaza codul rolului
     */
    constructor (){
        this.cod=this.constructor.tip;
    }

    /**
     * Verifica daca rolul are un anumit drept
     * @param {Symbol} drept - Dreptul de verificat (din drepturi.js)
     * @returns {boolean} true daca are dreptul, false altfel
     */
    areDreptul(drept){ //drept trebuie sa fie tot Symbol
        console.log("in metoda rol!!!!")
        return this.constructor.drepturi.includes(drept); //pentru ca e admin
    }
}

/**
 * Rolul de administrator, are absolut toate drepturile.
 * @extends Rol
 */
class RolAdmin extends Rol{
    
    static get tip() {return "admin"}
    constructor (){
        super();
    }

    /**
     * Suprascrie metoda din clasa de baza; adminul are mereu dreptul
     * @returns {boolean} Mereu true
     */

    areDreptul(){
        return true; //pentru ca e admin
    }
}

/**
 * Rolul de moderator; are drepturi legate de utilizatori
 * Nu poate cumpara sau gestiona produse
 * @extends Rol
 */
class RolModerator extends Rol{
    
    static get tip() {return "moderator"}
    static get drepturi() { return [
        Drepturi.vizualizareUtilizatori,
        Drepturi.stergereUtilizatori
    ] }
    constructor (){
        super()
    }
}

/**
 * Rolul de client; poate cumpara produse
 * @extends Rol
 */
class RolClient extends Rol{
    static get tip() {return "comun"}
    static get drepturi() { return [
        Drepturi.cumparareProduse
    ] }
    constructor (){
        super()
    }
}

/**
 * Factory pentru crearea obiectelor de tip Rol
 * Implementeaza design pattern-ul Factory
 */
class RolFactory{
    /**
     * Creeaza si returneaza un obiect Rol corespunzator tipului dat
     * @param {string} tip - Codul rolului ("admin", "moderator", "comun")
     * @returns {Rol} Instanta rolului corespunzator
     */
    static creeazaRol(tip) {
        switch(tip){
            case RolAdmin.tip : return new RolAdmin();
            case RolModerator.tip : return new RolModerator();
            case RolClient.tip : return new RolClient();
        }
    }
}


module.exports={
    RolFactory:RolFactory,
    Rol: Rol
    // RolAdmin:RolAdmin
}