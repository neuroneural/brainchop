const fr = {
	groupDelimiter:" ",
	groupSize:3,
	decimalDelimiter:",",
	decimalSize:2,

	dateFormat:"%d/%m/%Y",
	timeFormat:"%H:%i",
	longDateFormat:"%d %F %Y",
	fullDateFormat:"%d.%m.%Y %H:%i",

	price:"{obj} €",
	priceSettings:null, //use number defaults
	
	calendar:{
		monthFull:["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
		monthShort:["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aôu", "Sep", "Oct", "Nov", "Déc"],	
		dayFull:["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
		dayShort:["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
		hours: "Heures",
		minutes: "Minutes",
		done:"Fini",
		clear: "Effacer",
		today: "Aujourd'hui"
	},

	dataExport:{
		page:"Page",
		of:"sur"
	},
	PDFviewer:{
		of:"sur",
		automaticZoom:"Zoom automatique",
		actualSize:"Taille actuelle",
		pageFit:"Taille de la page",
		pageWidth:"Largeur de la page",
		pageHeight:"Hauteur de page",
		enterPassword:"Entrez le mot de passe",
		passwordError:"Mauvais mot de passe"
	},
	aria:{
		calendar:"Сalendrier",
		increaseValue:"Augmenter la valeur",
		decreaseValue:"Diminution de la valeur",
		navMonth:["Le mois précédent", "Le mois prochain"],
		navYear:["Année précédente", "L'année prochaine"],
		navDecade:["Décennie précédente", "Suivant décennie"],
		dateFormat:"%d %F %Y",
		monthFormat:"%F %Y",
		yearFormat:"%Y",
		hourFormat:"Heures: %H",
		minuteFormat:"Minutes: %i",
		removeItem:"Retirer l'élément",
		pages:["Première page", "Page précédente", "Page suivante", "Dernière page"],
		page:"Page",
		headermenu:"Menu de titre",
		openGroup:"Ouvrir groupe de colonnes ",
		closeGroup:"Fermer groupe de colonnes",
		closeTab:"Fermer tab",
		showTabs:"Montrer plus tabs",
		resetTreeMap:"Revenir à la vue originale",
		navTreeMap:"Niveau supérieur",
		nextTab:"Prochain tab",
		prevTab:"Précédent tab",
		multitextSection:"Ajouter l'élément",
		multitextextraSection:"Retirer l'élément",
		showChart:"Montrer chart",
		hideChart:"Cacher chart",
		resizeChart:"Redimensionner chart"
	},
	richtext:{
		underline: "Souligner",
		bold: "Gras",
		italic: "Italique"
	},
	combo:{
		select:"Sélectionner",
		selectAll:"Tout sélectionner",
		unselectAll:"Tout déselectionner"
	},
	message:{
		ok:"OK",
		cancel:"Annuler"
	},
	comments:{
		send: "Envoyer",
		confirmMessage: "Le commentaire sera supprimé. Êtes-vous sûr?",
		edit: "Modifier",
		remove: "Effacer",
		placeholder: "Écrivez ici..",
		moreComments:"Plus de commentaires"
	},
	filter:{
		less: "moins",
		lessOrEqual: "inférieur ou égal",
		greater: "plus grand",
		greaterOrEqual: "supérieur ou égal",
		contains: "contient",
		notContains: "ne contient",
		equal: "égal",
		notEqual: "pas égal",
		beginsWith: "commence par",
		notBeginsWith: "ne commence par",
		endsWith: "se termine par",
		notEndsWith: "pas se termine par",
		between: "entre",
		notBetween: "pas entre"
	},
	timeboard:{
		seconds: "secondes"
	}
};

export default fr;