/*
   Author: Behnam Azizi
   Date: Sept. 19, 2014

*/

document.getElementsByTagName('head')[0].innerHTML += "<img src=\"button.png\" id=\"bttnImage\"></img>\n";
document.getElementsByTagName('head')[0].innerHTML += "<img src=\"button_over.png\" id=\"bttnImageOver\"></img>\n";
document.getElementsByTagName('head')[0].innerHTML += "<img src=\"button_pushed.png\" id=\"bttnImagePushed\"></img>\n";

function Button(canvas, x, y, w, height){

	setTextColor = function(tColor){
		this.textColor = tColor;
		this.draw();
	};

	setColor = function(color){
		this.color = color;
		this.draw();
	};

	this.setText = function(txt){
		this.text = txt;
		this.width = (w > 10*this.text.length)? w : 10*this.text.length;
		this.draw();
	};

	this.clear = function(){
		this.ctx.fillStyle = "White";
		this.ctx.fillRect(this.x, this.y, this.width, this.height);
		this.ctx.fillStyle = this.color;

	};

	this.draw = function(){
		this.clear();
		this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		//ctx.fillRect(x, y, this.width, this.height);
		this.ctx.fillStyle = this.textColor;
		this.ctx.font="14px Georgia";
		this.ctx.fillText(this.text, this.x + this.width/2 - this.text.length*3 - 7, this.y + this.height/2 + 3);
	};


	this.addMouseDownAction = function  (trigger) {
		var _self = this;
		function clickFunction(evt){
			if((evt.clientX >= x && evt.clientX <= x + _self.width && evt.clientY >= y && evt.clientY <= y + _self.height)){
				if(trigger != null) trigger();
				_self.image = _self.pushedImage;
				_self.draw();
				_self.clickDown = true;
			}

		};

		_self.canvas.addEventListener("mousedown", clickFunction, false);

	};


	this.addMouseUpAction = function(trigger){
		var _self = this;
		canvas.addEventListener("mouseup", function (evt) {

			if(_self.clickDown && evt.clientX >= x && evt.clientX <= x + _self.width && evt.clientY >= y && evt.clientY <= y + _self.height){
				if(trigger != null) trigger();
				//console.log("clicked")
			}
			_self.clickDown = false;
			_self.image = _self.defaultImage;
			_self.draw();

		}, false);

	};

	this.addClickAction = function(trigger){
		this.addMouseUpAction(trigger);
		this.addMouseDownAction(null);

	}

	this.addMouseOverAction = function (trigger){
		document.body.style.cursor = "";
		var _self = this;
		function mouseOverFunction(evt){
			//console.log("- Mouse moved");
			if(evt.clientX >= x && evt.clientX <= x + _self.width && evt.clientY >= y && evt.clientY <= y + _self.height){
				document.body.style.cursor = "pointer";
				//console.log("- Mouse over");
				if(trigger != null) trigger();
				_self.image = _self.overImage;

			}else{
				//console.log("- Mouse away");
				_self.image = _self.defaultImage;
			}

			if(_self.clickDown) _self.image = _self.pushedImage;
			_self.draw();
			
		};
		_self.canvas.addEventListener("mousemove", mouseOverFunction, false);
	};


	this.canvas = canvas;
	this.ctx = this.canvas.getContext("2d");

	this.x  = x;
	this.y = y;
	this.text = "Click Me";
	console.log(w + " " + this.text.length)
	this.width = (w > 10*this.text.length)? w : 10*this.text.length;
	this.height = (this.height > 40)? this.height : 40;


	this.textColor = "Black";
	this.color = "Black";

	this.overImage = document.getElementById("bttnImageOver");
	this.pushedImage = document.getElementById("bttnImagePushed");
	this.defaultImage = document.getElementById("bttnImage");

	this.image = this.defaultImage;
	this.clickDown = false;
	
	this.draw();
	//this.addMouseDownAction(null);
	this.addMouseOverAction(null);
	//this.addMouseUpAction(null);
}

