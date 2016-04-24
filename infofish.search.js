function searchForSector(){
	var searchFor = document.getElementById("searchForm").value;
	path.each(function(d){
		if(d.Description == searchFor)
			sunburstClick(d);
	})
}

function changeSearchResults(){
	var searchFor = document.getElementById("searchForm").value;
	
}

function checkForEnter(event){
	//check for enter press
	if (event.keyCode == 13) {
		
	}
}