
/**
 @typedef Drepturi
 @type {Object}
 @property {Symbol} vizualizareUtilizatori Dreptul de a intra pe  pagina cu tabelul de utilizatori.
 @property {Symbol} stergereUtilizatori Dreptul de a sterge un utilizator
 @property {Symbol} cumparareProduse Dreptul de a cumpara

 @property {Symbol} vizualizareGrafice Dreptul de a vizualiza graficele de vanzari

 @property {Symbol} adaugareProduse Dreptul de a adauga jocuri noi in baza de date.
 @property {Symbol} stergereProduse Dreptul de a sterge un joc din baza de date.
 @property {Symbol} modificareProduse Dreptul de a edita pretul sau detaliile unui joc existent.
 @property {Symbol} adaugareRecenzii Dreptul utilizatorilor logati de a lasa un review.
 */


/**
 * @name module.exports.Drepturi
 * @type Drepturi
 */
const Drepturi = {
	vizualizareUtilizatori: Symbol("vizualizareUtilizatori"),
	stergereUtilizatori: Symbol("stergereUtilizatori"),
	cumparareProduse: Symbol("cumparareProduse"),
	vizualizareGrafice: Symbol("vizualizareGrafice"),

	adaugareProduse: Symbol("adaugareProduse"),
	stergereProduse: Symbol("stergereProduse"),
	modificareProduse: Symbol("modificareProduse"),
	adaugareRecenzii: Symbol("adaugareRecenzii")
}

module.exports=Drepturi;