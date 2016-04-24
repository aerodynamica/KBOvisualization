function searchForSector(){
	var sectorSelect = document.getElementById("sectorSearch");
	var searchFor = sectorSelect.options[sectorSelect.selectedIndex].text;
	path.each(function(d){
		if(d.Description == searchFor)
			sunburstClick(d);
	});
}