function searchForSector(){
	var searchFor = document.getElementById("searchForm").value;
	path.each(function(d){
		if(d.Description == searchFor)
			sunburstClick(d);
	});
}

function changeSearchResults(){
	var searchFor = document.getElementById("searchForm").value.toLowerCase();
	var sectors = [];
	var regex = new RegExp(searchFor+".*");
	path.each(function(d){
		if(regex.test(d.Description.toLowerCase()))
			sectors.push(d);
	});
	var sectorsDOM = document.getElementById("sectors");
	while (sectorsDOM.firstChild) {
		sectorsDOM.removeChild(sectorsDOM.firstChild);
	}
	for(var key in sectors){
		var optionElement = document.createElement("option");
        optionElement.value = sectors[key].Description;
        sectorsDOM.appendChild(optionElement);
	}
}

function checkForEnter(event){
	//check for enter press
	if (event.keyCode == 13) {
		searchForSector();
	}
}