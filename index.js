var population;
var lifespan = 1000;
var lifeP;
var hit = 0;
var count = 0;
var target;
var noOfObstacles1 = 25;
var obstacles1 = [];
var walls = [];

function setup()
{
	createCanvas(windowWidth-15, windowHeight-30);

	population = new Population();

	lifeP = createP();

	target = createVector(width/2, 50);

	for(var i = 0; i < noOfObstacles1; i++)
	{
		var point = [];
		var x = random(0, 1) * width;
		var y = random(0, 1) * height;

		if(abs(x - target.x) < 16 || abs(y - target.y) < 16 || abs(x - width/2) < 16 || abs(y - height/2) < 16)
		{
			x += 16;
			y += 16;
		}

		point[0] = x;
		point[1] = y;

		obstacles1[i] = point;
	}

	walls[0] = [0, 0];
	walls[1] = [0, 1];
	walls[2] = [width, 0];
	walls[3] = [0, height];
	walls[4] = [width, height];
	walls[5] = [width, 1];
	walls[6] = [1, 0];
	walls[7] = [1, height];
}

function draw()
{
	background(51);

	population.run();

	lifeP.html(count);
	count++;

	if(count == lifespan)
	{
		population.evaluate();
		population.selection();

		count = 0;
		hit = 0;
	}

	fill(255);
	ellipse(target.x, target.y, 16, 16);

	fill(255, 0, 0, 200);
	for(var i = 0; i < noOfObstacles1; i++)
	{
		var x = obstacles1[i][0];
		var y = obstacles1[i][1];

		ellipse(x, y, 30, 30);
	}	

	fill(255);
	textSize(15);
	text('<-- Target', target.x+16, target.y+8);
	text('( Hits: '+hit+' )', target.x+90, target.y+8);
}

function DNA(genes){

	if(genes){

		this.genes = genes;
	}else{
		
		this.genes = [];
		for(var i = 0; i < lifespan; i++){

			this.genes[i] = p5.Vector.random2D();
			this.genes[i].setMag(0.1);
		}
	}

	this.crossover = function(partner){
		var newdna = [];

		var mid = floor(random(this.genes.length));

		for(var i = 0; i < this.genes.length; i++){
			if(i > mid){
				newdna[i] = this.genes[i];
			}else{
				newdna[i] = partner.genes[i];
			}
		}

		return new DNA(newdna);
	}
}

function Population(){

	this.rockets = [];
	this.popsize = 100;
	this.matingpool = [];

	for(var i = 0; i < this.popsize; i++)
	{
		this.rockets[i] = new Rocket();
	}

	this.evaluate = function(){

		var maxfit = 0;
		for(var i = 0; i < this.popsize; i++)
		{
			this.rockets[i].calFitness();

			if(this.rockets[i].fitness > maxfit)
			{
				maxfit = this.rockets[i].fitness;
			}
		}

		for(var i = 0; i < this.popsize; i++)
		{
			this.rockets[i].fitness /= maxfit;
		}

		this.matingpool = [];

		for(var i = 0; i < this.popsize; i++)
		{
			var n = this.rockets[i].fitness * 100;
			
			for(var j = 0; j < n; j++)
			{
				this.matingpool.push(this.rockets[i]);
			}
		}
	}

	this.selection = function(){

		var newRockets = [];
		for(var i = 0; i < this.rockets.length; i++)
		{
			var parentA = random(this.matingpool).dna;
			var parentB = random(this.matingpool).dna;
			var child = parentA.crossover(parentB);
			newRockets[i] = new Rocket(child);
		}

		this.rockets = newRockets;
	}

	this.run = function(){

		for(var i = 0; i < this.popsize; i++)
		{
			var d = dist(this.rockets[i].pos.x, this.rockets[i].pos.y, target.x, target.y);

			var flag = true;

			var x = this.rockets[i].pos.x;
			var y = this.rockets[i].pos.y;

			for(var j = 0; j < noOfObstacles1; j++)
			{
				var temp = dist(x, y, obstacles1[j][0], obstacles1[j][1]);
				if(temp < 19)
				{
					flag = false;
					break;
				}
			}

			for(var j = 0; j < walls.length; j++)
			{
				var temp;
				if(walls[j][0] == 1)
					temp = dist(x, y, x, walls[j][1]);
				else if(walls[j][1] == 1)
					temp = dist(x, y, walls[j][0], y);
				else
					temp = dist(x, y, walls[j][0], walls[j][1]);

				if(temp < 10)
				{
					flag = false;
					break;
				}
			}

			if(d >= 10 && flag)
			{
				this.rockets[i].update();
			}
			else if(!this.rockets[i].hitCount && flag)
			{
				this.rockets[i].hitCount = true;
				hit++;
			}

			this.rockets[i].show();
		}
	}
}

function Rocket(dna){

	var x,y;
	this.pos = createVector(width/2, height/2);
	this.vel = createVector();
	this.acc = createVector();
	this.hitCount = false;

	if(dna)
	{
		this.dna = dna;
	}
	else
	{
		this.dna = new DNA(0);
	}

	this.fitness = 0;

	this.applyForce = function(force){

		this.acc.add(force);
	}

	this.calFitness = function(){

		var d = dist(this.pos.x, this.pos.y, target.x, target.y);

		var flag = false;
		x = this.pos.x;
		y = this.pos.y;

		for(var j = 0; j < noOfObstacles1; j++)
		{
			var temp = dist(x, y, obstacles1[j][0], obstacles1[j][1]);
			if(temp < 19)
			{
				flag = true;
				break;
			}
		}

		for(var j = 0; j < walls.length; j++)
		{
			var temp;
			if(walls[j][0] == 1)
				temp = dist(x, y, x, walls[j][1]);
			else if(walls[j][1] == 1)
				temp = dist(x, y, walls[j][0], y);
			else
				temp = dist(x, y, walls[j][0], walls[j][1]);

			if(temp < 10)
			{
				flag = true;
				break;
			}
		}

		this.fitness = map(d, 0, width, width, 0);

		if(flag)
		{
			this.fitness /= 10;
		}
		else if(dist(x, y, target.x, target.y) < 10)
		{
			this.fitness *= 10;
		}
	}

	this.update = function(){

		this.applyForce(this.dna.genes[count]);

		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}

	this.show = function(){

		push();
		noStroke();
		fill(255, 150);
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		rectMode(CENTER);
		rect(0, 0, 25, 5);
		pop();
	}
}
