let canvas = document.getElementById("cv");
let x_blocks = Math.floor(window.innerWidth * 0.99 / 80);
canvas.width = x_blocks * 80;
let y_blocks = Math.floor(window.innerHeight / 80);
canvas.height = y_blocks * 80;
let block_side = 80;
let c = canvas.getContext("2d");

let Default_Map, Default_Player, Villains = [];
let updating, fps = 25, playerScore = 0, survivalTime = 0;
let inst_time = -1000, cur = new Image(), keys = [], mous = {
	distance_to: target => {
		return Math.sqrt((mous["x"] - target.x_coord) ** 2 + (mous["y"] - target.y_coord) ** 2);
	}
};

//Classes
class block {
	constructor(iden /*1:grass;2:sand;3:water*/, hv_apple, hv_villain) {
		this.iden = iden;
		this.hv_apple = hv_apple;
		this.hv_villain = hv_villain;
	}
	
	friction = function () {
		switch (this.iden) {
			case 1:
				return 0.9; break;
			case 2:
				return 0.9; break;
			case 3:
				return 0.9; break;
		}
	}
}
class map {
	constructor(x, y, difficulty /*0:peaceful;1:easy;2:normal;3:hard*/) {
		this.x = x;
		this.y = y;
		this.difficulty = difficulty;
	}
	
	map_data = [];
	
	img_apple = new Image();
	
	corr_block = function (creature) {
		return [Math.floor(creature.y_coord / block_side), Math.floor(creature.x_coord / block_side)];
	}
	
	gen_map = function () {
		for (let n = 0; n < x_blocks; n++) {
			this.map_data.push([]);
		}
		
		for (let i = 0; i < this.x; i++) {
			for (let j = 0; j < this.y; j++) {
				let rnd = Math.floor(Math.random()*3 + 1);
				this.map_data[j][i] = new block(rnd, false, false);
			}
		}
	}
	
	print_map = function () {
		for (let i = 0; i < this.x; i++) {
			for (let j = 0; j < this.y; j++) {
				switch (this.map_data[j][i].iden) {
					case 1:
						c.fillStyle = "#66FF66"; break;
					case 2:
						c.fillStyle = "#FFFFAA"; break;
					case 3:
						c.fillStyle = "rgba(0, 0, 255, 0.75)"; break;
				}
			c.fillRect(block_side * i, block_side * j, block_side, block_side);
			}
		}
	}
	
	gen_apple = function(apple_num) {
		let apple_count = 0, i, j;
		do {
			i = Math.floor(Math.random() * x_blocks);
			j = Math.floor(Math.random() * y_blocks);
			if (!this.map_data[j][i].hv_apple && this.map_data[j][i].iden == 1) {
				this.map_data[j][i].hv_apple = true;
				apple_count++;
			}
		} while (apple_count < apple_num);
	}
	
	spawn_apple = function () {
		this.img_apple.src = "./feature_pack/item/apple.png";
		for (let i = 0; i < x_blocks; i++) {
			for (let j = 0; j < y_blocks; j++) {
				//check for eaten apple
				if (this.map_data[j][i].hv_apple && this.corr_block(Default_Player)[0] == j && this.corr_block(Default_Player)[1] == i) {
					playerScore += 1;
					Default_Player.health += 10;
					if (Default_Player.health > 100) {
						Default_Player.health = 100;
					}
					this.map_data[j][i].hv_apple = false;
					this.gen_apple(1);
				}
				
				if (this.map_data[j][i].hv_apple) {
					c.drawImage(this.img_apple, block_side * (i + 0.5) - this.img_apple.width / 2, block_side * (j + 0.5) - this.img_apple.height / 2);
				}
			}
		}
	}
}
class creature {
	constructor(name, x_coord, y_coord, img_src) {
		this.name = name;
		this.x_coord = x_coord;
		this.y_coord = y_coord;
		this.img_src = img_src;
	}
	
	img = new Image();
	exist = true;
	
	x_vel = 0;
	y_vel = 0;
	health = 100;
	attack = function (target) {
		target.health -= this.damage;
	}
	
	gen_creature = function () {
		c.fillStyle = "black";
		c.font = "bold 20px Arial";
		c.textAlign = "center";
		
		this.img.src = this.img_src;
		c.drawImage(this.img, this.x_coord - this.img.width / 2, this.y_coord - this.img.height / 2);

		c.strokeStyle = 'black';
		c.lineWidth = 6;
		c.strokeText(this.name, this.x_coord, this.y_coord - block_side / 2);
		c.strokeText("HP: " + this.health + "%", this.x_coord, this.y_coord + block_side * 0.75);
		c.fillStyle = 'white';
		c.fillText(this.name, this.x_coord, this.y_coord - block_side / 2);
		if (this.health > 20 && this.health <= 60) {
            c.fillStyle = "#FFCC00";
        } else if (this.health > 0 && this.health <= 20) {
            c.fillStyle = "red";
        } else {
			c.fillStyle = "white";
        }
		c.fillText("HP: " + this.health + "%", this.x_coord, this.y_coord + block_side * 0.75);
	}
	
	distance_to = function (target) {
		return Math.sqrt((this.x_coord - target.x_coord) ** 2 + (this.y_coord - target.y_coord) ** 2);
	}
	
	approach_to = function (target) {
		if (target.x_coord < this.x_coord) {
			move(this, "left");
		} else if (target.x_coord > this.x_coord) {
			move(this, "right");
		}
		if (target.y_coord < this.y_coord) {
			move(this, "up");
		} else if (target.y_coord > this.y_coord) {
			move(this, "down");
		}
	}
}
class player extends creature {
	max_speed = this.health / 100 * 20;
	damage = 40;
	attack_range = 160;
	
	die = function () {
		alert(`You die! \nYour score is ${playerScore} and \nyour survival time is ${survivalTime / 1000} seconds.`);
		location.reload();
	}
}
class villain extends creature {
	max_speed = Default_Map.difficulty * 0.75;
	sight = Default_Map.difficulty * 150;
	damage = Default_Map.difficulty * 10;
	attack_range = Default_Map.difficulty * 25;
	
	die = function () {
		this.exist = false;
	}
}

//UI and control
function validation() {
	if (document.getElementById("Name").value.trim().length > 0 && document.getElementById("Name").value.trim().length < 17) {
		init();
	} else {
		alert("Your player name must be of length between 1 to 16.");
	}
}
function BGM_switch() {
	document.getElementById("bgm").muted = !document.getElementById("bgm").muted;
	if (document.getElementById("bgm").muted) {
		document.getElementById("bgm").pause();
	} else {
		document.getElementById("bgm").play();
	}
}
function init() {
	canvas.style.cursor = "none";
	
	playerScore = 0;
	survivalTime = 0;
	
	c.clearRect(0, 0, canvas.width, canvas.height);
	Default_Map = new map(x_blocks, y_blocks, document.getElementById("Difficulty").value);
	Default_Player = new player(document.getElementById("Name").value.trim(), canvas.width / 2, canvas.height / 2, "./feature_pack/creature/player.png")
	Default_Map.gen_map();
	Default_Map.print_map();
	Default_Player.gen_creature();
	Default_Map.gen_apple(4);
	Default_Map.spawn_apple();
	
	update();
}

//Events
document.body.onkeydown = e => {
	//console.log(e.keyCode);
    keys[e.keyCode] = true;
}
document.body.onkeyup = e => {
    keys[e.keyCode] = false;
}
canvas.onmousemove = e => {
	mous["x"] = e.offsetX;
	mous["y"] = e.offsetY;
}
canvas.onmousedown = e => {
	mous["left"] = true;
}
canvas.onmouseup = e => {
	mous["left"] = false;
}
canvas.addEventListener("contextmenu", e => {
	e.preventDefault();
});

function update() {
	checkKey();
	
	c.clearRect(0, 0, canvas.width, canvas.height);
	Default_Map.print_map();
	Default_Map.spawn_apple();
	Default_Player.gen_creature();
	
	if (survivalTime % 10000 == 0 && survivalTime != 0) {
		for (let n = 0, l = Villains.length; n <= l; n++) {
			if (l == 0 || !Villains[n].exist) {
				Villains.push(new villain("Villain", Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height), "./feature_pack/creature/villain.png"));
			} else {
				Villains[n].exist = true;
			}
			break;
		}
	}
	for (let n = 0, l = Villains.length; n < l; n++) {
		if (Villains[n].exist) {
			Villains[n].gen_creature();
			if (Villains[n].distance_to(Default_Player) <= Villains[n].sight) {
				Villains[n].approach_to(Default_Player);
				if (Villains[n].distance_to(Default_Player) <= Villains[n].attack_range && survivalTime % 1000 == 0) Villains[n].attack(Default_Player);
			}
			if (Villains[n].health <= 0) Villains[n].die();
		}
	}
	
	if (Default_Player.health <= 0) {
		clearTimeout(updating);
		Default_Player.die();
	}
	
	checkMou();
	
	document.getElementById("Score").value = playerScore;
	document.getElementById("Time").value = survivalTime / 1000;
	survivalTime += 1000 / fps;
    updating = setTimeout(update, 1000 / fps);
}
function checkKey() { //13:enter;16:shift:87:W;83:S;65:A;68:D;
	let isDiag = ((keys[87] && keys[65]) || (keys[87] && keys[68]) || (keys[83] && keys[65]) || (keys[83] && keys[68]));
	
	if (keys[87]) move(Default_Player, "up", keys[16], isDiag);
	if (keys[83]) move(Default_Player, "down", keys[16], isDiag);
	if (keys[65]) move(Default_Player, "left", keys[16], isDiag);
	if (keys[68]) move(Default_Player, "right", keys[16], isDiag);
}
function checkMou() {
	cur.src = "./feature_pack/ui/cursor.png";
	c.drawImage(cur, mous["x"] - cur.width / 2, mous["y"] - cur.height / 2);
	
	if (mous["left"]) {
		if (survivalTime - inst_time >= 1000) {
			for (let vln of Villains) {
				if (mous["distance_to"](Default_Player) <= Default_Player.attack_range && vln.distance_to(Default_Player) <= Default_Player.attack_range) {
					Default_Player.attack(vln);
				}
			}
			
			inst_time = survivalTime;
		}
	}
}
function move(creature, control, is_speed_boost, is_diag) {
	switch (control) {
		case "up":
			if (creature.y_vel > -creature.max_speed) creature.y_vel--; break;
		case "down":
			if (creature.y_vel < creature.max_speed) creature.y_vel++; break;
		case "left":
			if (creature.x_vel > -creature.max_speed) creature.x_vel--;	break;
		case "right":
			if (creature.x_vel < creature.max_speed) creature.x_vel++; break;
	}
	
	//set speed and displacement
	creature.x_vel *= is_speed_boost ? 0.95 : 0.9;//Default_Map.map_data[Default_Map.corr_block(Default_Player)[0]][Default_Map.corr_block(Default_Player)[0]].friction;
	creature.x_coord += creature.x_vel * (is_diag ? 0.5 : 1);
	creature.y_vel *= is_speed_boost ? 0.95 : 0.9;//Default_Map.map_data[Default_Map.corr_block(Default_Player)[0]][Default_Map.corr_block(Default_Player)[0]].friction;
	creature.y_coord += creature.y_vel * (is_diag ? 0.5 : 1);
	
	//set boundaries
	if (creature.x_coord >= canvas.width) {
        creature.x_coord = canvas.width;
    } else if (creature.x_coord <= 0) {
        creature.x_coord = 0;
    }
    if (creature.y_coord >= canvas.height) {
        creature.y_coord = canvas.height;
    } else if (creature.y_coord <= 0) {
        creature.y_coord = 0;
    }
}