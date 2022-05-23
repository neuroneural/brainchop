const pt = {
	groupDelimiter:".",
	groupSize:3,
	decimalDelimiter:",",
	decimalSize:2,

	dateFormat:"%d/%m/%Y",
	timeFormat:"%G:%i",
	longDateFormat:"%d de %F de %Y",
	fullDateFormat:"%d de %F de %Y %G:%i",

	am:null,
	pm:null,
	price:"R$ {obj}",
	priceSettings:{
		groupDelimiter:".",
		groupSize:3,
		decimalDelimiter:",",
		decimalSize:2
	},
	fileSize: ["b","Kb","Mb","Gb","Tb","Pb","Eb"],
	calendar:{
		monthFull:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
		monthShort:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
		dayFull:["Domingo","Segunda-Feira","Terça-Feira","Quarta-Feira","Quinta-Feira","Sexta-Feira","Sábado"],
		dayShort:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
		hours: "Horas",
		minutes: "Minutos",
		done:"Feito",
		clear: "Limpar",
		today: "Hoje"
	},

	dataExport:{
		page:"Página",
		of:"de"
	},
	PDFviewer:{
		of:"de",
		automaticZoom:"Zoom automático",
		actualSize:"Tamanho atual",
		pageFit:"Tamanho da página",
		pageWidth:"Largura da página",
		pageHeight:"Altura da página",
		enterPassword:"Digite a senha",
		passwordError:"Senha incorreta"
	},
	aria:{
		calendar:"Calendário",
		increaseValue:"Aumentar o valor",
		decreaseValue:"Diminuir o valor",
		navMonth:["Mês anterior", "Próximo mês"],
		navYear:["Ano anterior", "Próximo ano"],
		navDecade:["Década anterior", "Próxima década"],
		dateFormat:"%d de %F de %Y",
		monthFormat:"%F de %Y",
		yearFormat:"%Y",
		hourFormat:"Horas: %G",
		minuteFormat:"Minutos: %i",
		removeItem:"Remover elemento",
		pages:["Primeira página", "Página anterior", "Próxima página", "Última página"],
		page:"Página",
		headermenu:"Menu de títulos",
		openGroup:"Grupo coluna aberta",
		closeGroup:"Fechar grupo de colunas",
		closeTab:"Fechar tab",
		showTabs:"Mostre mais tabs",
		resetTreeMap:"Мoltar à vista original",
		navTreeMap:"Upar",
		nextTab:"Próximo tab",
		prevTab:"Anterior tab",
		multitextSection:"Adicionar elemento",
		multitextextraSection:"Remover elemento",
		showChart:"Exposição chart",
		hideChart:"Esconder chart",
		resizeChart:"Redimensionar chart"
	},
	richtext:{
		underline: "Sublinhado",
		bold: "Negrito",
		italic: "itálico"
	},
	combo:{
		select:"Selecionar",
		selectAll:"Selecionar tudo",
		unselectAll:"Desmarque todos"
	},
	message:{
		ok:"OK",
		cancel:"Cancelar"
	},
	comments:{
		send: "Enviar",
		confirmMessage: "Comentário será removido. Você tem certeza?",
		edit: "Editar",
		remove: "Excluir",
		placeholder: "Digite aqui..",
		moreComments:"Mais comentários"
	},
	filter:{
		less: "menos",
		lessOrEqual: "menor ou igual",
		greater: "maior",
		greaterOrEqual: "maior ou igual",
		contains: "contém",
		notContains: "não contém",
		equal: "igual",
		notEqual: "não é igual",
		beginsWith: "começa com",
		notBeginsWith: "não começa com",
		endsWith: "termina com",
		notEndsWith: "não termina com",
		between: "entre",
		notBetween: "não entre"
	},
	timeboard:{
		seconds: "segundos"
	}
};

export default pt;