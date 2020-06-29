//Math tools
function R2D(radian) {
	return radian * 180 / Math.PI;
}
function D2R(degree) {
	return degree * Math.PI / 180;
}

//declarations
let canvas = document.getElementById("cv");
let x_blocks = Math.floor(window.innerWidth * 0.99 / 80);
canvas.width = x_blocks * 80;
let y_blocks = Math.floor(window.innerHeight / 80);
canvas.height = y_blocks * 80;
let block_side = 80;
let c = canvas.getContext("2d");

let Default_Map, Default_Player, Villains;
let updating, fps = 25, playerScore, survivalTime, timeSlot;
let cur = new Image(), keys = [], mous = {
	"distance_to": target => {
		return Math.sqrt((mous["x_coord"] - target.x_coord) ** 2 + (mous["y_coord"] - target.y_coord) ** 2);
	},

	"angle_to": target => {
		let a = R2D(Math.atan((mous["y_coord"] - target.y_coord) / (mous["x_coord"] - target.x_coord)));

		if (mous["y_coord"] > target.y_coord && mous["x_coord"] > target.x_coord) {
			null;
		} else if (mous["x_coord"] < target.x_coord) {
			a += 180;
		} else if (mous["y_coord"] < target.y_coord && mous["x_coord"] > target.x_coord) {
			a += 360;
		} else if (mous["x_coord"] >= target.x_coord && mous["y_coord"] == target.y_coord) {
			a = 0;
		} else if (mous["x_coord"] == target.x_coord && mous["y_coord"] > target.y_coord) {
			a = 90;
		} else if (mous["x_coord"] == target.x_coord && mous["y_coord"] < target.y_coord) {
			a = 270;
		}

		return a;
	}
};

//Classes
class block {
	constructor(iden /*0:void;1:grass;2:sand;3:water*/, hv_apple, hv_villain) {
		this.iden = iden;
		this.hv_apple = hv_apple;
		this.hv_villain = hv_villain;

		Default_Map.block_num[iden]++;
	}

	probit = 0;

	friction = function () {
		switch (this.iden) {
			case 0:
				return 0; break;
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
	constructor(x, y, difficulty /*0:peaceful;1:easy;2:normal;3:hard*/, type /*0:Messy;1:Island*/) {
		this.x = x;
		this.y = y;
		this.difficulty = parseInt(difficulty);
		this.type = parseInt(type);
	}

	map_data = [];
	block_num = [0, 0, 0, 0];

	img_apple = new Image();

	corr_block = function (obj) {
		return {y: Math.floor(obj.y_coord / block_side), x: Math.floor(obj.x_coord / block_side)};
	}
	highlight_block = function () {
		c.lineWidth = 2;
		c.strokeStyle = "black";
		c.strokeRect(block_side * Default_Map.corr_block(mous)["x"], block_side * Default_Map.corr_block(mous)["y"], block_side, block_side);
	}

	gen_map = function () {
		for (let n = 0; n < x_blocks; n++) {
			this.map_data.push([]);
		}

		switch (this.type) {
			case 0: {
				for (let i = 0; i < this.x; i++) {
					for (let j = 0; j < this.y; j++) {
						let rnd = Math.floor(Math.random()*3 + 1);
						this.map_data[j][i] = new block(rnd, false, false);
					}
				}

				break;
			}
			case 1: {
				let startPoint = {y: Math.floor(this.y / 2), x:Math.floor(this.x / 2)};
				for (let i = 0; i < this.x; i++) {
					for (let j = 0; j < this.y; j++) {
						this.map_data[j][i] = new block(3, false, false);
					}
				}

				/*let rnd = Math.floor(Math.random()*2 + 1);
				this.map_data[startPoint.y][startPoint.x] = new block(rnd, false, false);*/

				let randomMaxSizeProbit = 0.5 + Math.random() / 2;
				for (let i = 0; i < this.x; i++) {
					for (let j = 0; j < this.y; j++) {
						this.map_data[j][i].probit = Math.sqrt((Math.sin(D2R(i * 180 / this.x)) ** 2 + Math.sin(D2R(j * 180 / this.y)) ** 2) / 2);
						if (this.map_data[j][i].probit * Math.sqrt(Math.random()) > 0.8) {
							this.map_data[j][i] = new block(Math.floor(Math.random() * 2) + 1, false, false);
						} else if (this.map_data[j][i].probit > randomMaxSizeProbit) {
							this.map_data[j][i] = new block(Math.floor(Math.random() * 2) + 1, false, false);
						}
					}
				}

				/*decideNextX(Math.floor(Math.random()*3 - 1), Math.floor(this.x * ));
				function decideNextX(dir, lim) {
					if (dir == 0) {
						decideNextY(Math.floor(Math.random()*3 - 1));
						break;
					}
					let r = Math.floor(Math.random()*3 + 1)
				}
				function decideNextY(dir, lim) {
					if (dir == 0) {
						decideNextX(Math.floor(Math.random()*3 - 1));
						break;
					}
				}*/
			}
		}
	}

	print_map = function () {
		for (let i = 0; i < this.x; i++) {
			for (let j = 0; j < this.y; j++) {
				switch (this.map_data[j][i].iden) {
					case 1:
						c.fillStyle = "#33BB33"; break;
					case 2:
						c.fillStyle = "#FFFFAA"; break;
					case 3:
						c.fillStyle = "rgba(0, 0, 255, 0.75)"; break;
				}
			c.fillRect(block_side * i, block_side * j, block_side, block_side);
			}
		}
		this.highlight_block();
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
		} while (apple_count < apple_num && apple_count < this.block_num[1]);
	}

	spawn_apple = function () {
		this.img_apple.src = "./feature_pack/item/apple.png";
		for (let i = 0; i < x_blocks; i++) {
			for (let j = 0; j < y_blocks; j++) {
				//check for eaten apple
				if (this.map_data[j][i].hv_apple && this.corr_block(Default_Player).y == j && this.corr_block(Default_Player).x == i) {
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

	x_vel = 0;
	y_vel = 0;
	health = 100;

	isSprinting = false;
	isDiagMoving = false;

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

	move_creature = function () {
		//set speed and displacement
		this.x_vel *= this.isSprinting ? 0.95 : 0.9;//Default_Map.map_data[Default_Map.corr_block(Default_Player).y][Default_Map.corr_block(Default_Player).y].friction;
		this.x_coord += this.x_vel;// * (this.isDiagMoving ? 0.5 : 1);
		this.y_vel *= this.isSprinting ? 0.95 : 0.9;//Default_Map.map_data[Default_Map.corr_block(Default_Player).y][Default_Map.corr_block(Default_Player).y].friction;
		this.y_coord += this.y_vel;// * (this.isDiagMoving ? 0.5 : 1);

		//set boundaries
		if (this.x_coord >= canvas.width) {
      this.x_coord = canvas.width;
    } else if (this.x_coord <= 0) {
      this.x_coord = 0;
    }
    if (this.y_coord >= canvas.height) {
      this.y_coord = canvas.height;
    } else if (this.y_coord <= 0) {
      this.y_coord = 0;
    }
	}

	distance_to = function (target) {
		return Math.sqrt((this.x_coord - target.x_coord) ** 2 + (this.y_coord - target.y_coord) ** 2);
	}

	angle_to = function (target) {
		let angle = R2D(Math.atan((this.y_coord - target.y_coord) / (this.x_coord - target.x_coord)));

		if (this.y_coord > target.y_coord && this.x_coord > target.x_coord) null;
		else if (this.x_coord < target.x_coord) angle += 180;
		else if (this.y_coord < target.y_coord && this.x_coord > target.x_coord) angle += 360;
		else if (this.x_coord >= target.x_coord && this.y_coord == target.y_coord) angle = 0;
		else if (this.x_coord == target.x_coord && this.y_coord > target.y_coord) angle = 90;
		else if (this.x_coord == target.x_coord && this.y_coord < target.y_coord) angle = 270;

		return angle;
	}

	approach_to = function (target) {
		if (target.x_coord < this.x_coord) {
			set_move(this, "left");
		} else if (target.x_coord > this.x_coord) {
			set_move(this, "right");
		}
		if (target.y_coord < this.y_coord) {
			set_move(this, "up");
		} else if (target.y_coord > this.y_coord) {
			set_move(this, "down");
		}
	}
}
class player extends creature {
	isAttacking = false;

	attack_speed = 4;
	max_speed = this.health / 100 * 20;
	damage = 20;
	attack_range = 160;
	attack_angle = 50;

	die = function () {
		alert(`You die! \nYour score is ${playerScore} and \nyour survival time is ${survivalTime / 1000} seconds.`);
		location.reload();
	}
}
class villain extends creature {
	spawn_time = survivalTime;
	isSpecial = false; //despawn randomly?

	max_speed = Default_Map.difficulty * 1.1;
	sight = Default_Map.difficulty * 150;
	damage = Default_Map.difficulty * 10;
	attack_range = Default_Map.difficulty * 25;
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
	clearTimeout(updating);
	canvas.style.cursor = "none";

	playerScore = 0;
	survivalTime = 0;
	timeSlot = {
		"inst": -1000,

		"ani": 0
	};

	c.clearRect(0, 0, canvas.width, canvas.height);
	Default_Map = new map(x_blocks, y_blocks, document.getElementById("Difficulty").value, document.getElementById("Type").value);
	Default_Player = new player(document.getElementById("Name").value.trim(), canvas.width / 2, canvas.height / 2, "./feature_pack/creature/player.png")

	Villains = [];

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
	mous["x_coord"] = e.offsetX;
	mous["y_coord"] = e.offsetY;
}
canvas.onmousedown = e => {
	mous[e.button] = true;
	if (e.button == 1) return false;
}
canvas.onmouseup = e => {
	mous[e.button] = false;
}
canvas.oncontextmenu = e => {
	e.preventDefault();
}

function update() {
	checkKey();

	c.clearRect(0, 0, canvas.width, canvas.height);
	Default_Map.print_map();
	Default_Map.spawn_apple();
	Default_Player.move_creature();
	Default_Player.gen_creature();

	if (Default_Player.isAttacking) {
		let startAngle = D2R(mous.angle_to(Default_Player) - Default_Player.attack_angle / 2), endAngle = D2R(mous.angle_to(Default_Player) + Default_Player.attack_angle / 2), dAngle = D2R(Default_Player.attack_angle / fps * Default_Player.attack_speed);
		if (survivalTime - timeSlot["ani"] < 1000 / Default_Player.attack_speed) {
			c.lineWidth = 8 * Math.sin(D2R((survivalTime - timeSlot["ani"]) * 180 / (1000 / Default_Player.attack_speed)));
			c.strokeStyle = `rgba(64, 64, 0, ${c.lineWidth / 10})`;
			c.beginPath();
			c.arc(Default_Player.x_coord, Default_Player.y_coord, Default_Player.attack_range / 2, startAngle - dAngle + dAngle * (survivalTime - timeSlot["ani"]) / Math.round(1000 / fps), startAngle + dAngle * (survivalTime - timeSlot["ani"]) / Math.round(1000 / fps));
			c.stroke();

			c.lineWidth = 10 * Math.sin(D2R((survivalTime - timeSlot["ani"]) * 180 / (1000 / Default_Player.attack_speed)));
			c.strokeStyle = `rgba(64, 64, 0, ${c.lineWidth / 8})`;
			c.beginPath();
			c.arc(Default_Player.x_coord, Default_Player.y_coord, Default_Player.attack_range / 2, startAngle + dAngle * (survivalTime - timeSlot["ani"]) / Math.round(1000 / fps), startAngle + dAngle + dAngle * (survivalTime - timeSlot["ani"]) / Math.round(1000 / fps));
			c.stroke();

			c.lineWidth = 8 * Math.sin(D2R((survivalTime - timeSlot["ani"]) * 180 / (1000 / Default_Player.attack_speed)));
			c.strokeStyle = `rgba(64, 64, 0, ${c.lineWidth / 10})`;
			c.beginPath();
			c.arc(Default_Player.x_coord, Default_Player.y_coord, Default_Player.attack_range / 2, startAngle + dAngle + dAngle * (survivalTime - timeSlot["ani"]) / Math.round(1000 / fps), startAngle + 2 * dAngle + dAngle * (survivalTime - timeSlot["ani"]) / Math.round(1000 / fps));
			c.stroke();
		} else {
			Default_Player.isAttacking = false;
		}
	}

	if (survivalTime % (1000 * (Math.floor(Math.random() * 10) + 1)) == 0 && survivalTime != 0 && Default_Map.difficulty != 0) {
		let n = 0, l = Villains.length;
		while (n <= l) {
			if (Villains[n] == undefined) {
				Villains[n] = new villain("Villain", Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height), "./feature_pack/creature/villain.png");
				break;
			}
			n++;
		}
	}
	for (let n = 0, l = Villains.length; n <= l; n++) {
		if (Villains[n] != undefined) {
			Villains[n].move_creature();
			Villains[n].gen_creature();
			if (Villains[n].distance_to(Default_Player) <= Villains[n].sight) {
				Villains[n].approach_to(Default_Player);
				if (Villains[n].distance_to(Default_Player) <= Villains[n].attack_range && survivalTime % 1000 == 0) Villains[n].attack(Default_Player);
			}
			if (Villains[n].health <= 0 || survivalTime - Villains[n].spawn_time > 60000) {
				delete Villains[n];
				if (Default_Player.isAttacking) playerScore += 3;
			}
		}
	}

	if (Default_Player.health <= 0) {
		clearTimeout(updating);
		Default_Player.die();
	}

	checkMou();

	document.getElementById("Score").value = playerScore;
	document.getElementById("Time").value = survivalTime / 1000;
	survivalTime += Math.round(1000 / fps);
  updating = setTimeout(update, Math.round(1000 / fps));
}
function checkKey() { //13:enter;16:shift:87:W;83:S;65:A;68:D;
	let isDiag = ((keys[87] && keys[65]) || (keys[87] && keys[68]) || (keys[83] && keys[65]) || (keys[83] && keys[68]));

	Default_Player.isSprinting = keys[16];
	Default_Player.isDiagMoving = isDiag;

	if (keys[87]) set_move(Default_Player, "up");
	if (keys[83]) set_move(Default_Player, "down");
	if (keys[65]) set_move(Default_Player, "left");
	if (keys[68]) set_move(Default_Player, "right");
}
function checkMou() {
	cur.src = "./feature_pack/ui/cursor.png";
	c.drawImage(cur, mous["x_coord"] - cur.width / 2, mous["y_coord"] - cur.height / 2);

	if (mous[0]) {
		if (survivalTime - timeSlot["inst"] >= 1000 / Default_Player.attack_speed) {
			if (mous["distance_to"](Default_Player) <= Default_Player.attack_range) {
				Default_Player.isAttacking = true;
				timeSlot["ani"] = survivalTime;
			}

			for (let vln of Villains) {
				if (vln != undefined && mous["distance_to"](Default_Player) <= Default_Player.attack_range && vln.distance_to(Default_Player) <= Default_Player.attack_range &&
				  	Default_Player.angle_to(mous) >= Default_Player.angle_to(vln) - Default_Player.attack_angle / 2 && Default_Player.angle_to(mous) <= Default_Player.angle_to(vln) + Default_Player.attack_angle / 2) {
					Default_Player.attack(vln);
				}
			}

			timeSlot["inst"] = survivalTime;
		}
	}
}
function set_move(creature, control) {
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
}
