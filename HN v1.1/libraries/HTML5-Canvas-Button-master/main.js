/*
	Author: Behnam Azizi
	Date: Sep. 19, 2014
	
*/
$(document).ready(function(){
	var canvas = document.getElementById("gameCanvas");

	var startBttn = new Button(canvas, 200, 200, 100, 70);
	///*
	startBttn.addClickAction(function(){
			console.log("Clicked");
		}
	);
	//*/
	startBttn.setText("Start Game");


	var instrBttn = new Button(canvas, 200, 300, 100, 70);
	instrBttn.addClickAction(function  () {
		console.log("second Clicked")
	});

	instrBttn.setText("Instructions");
});
