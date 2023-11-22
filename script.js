;(function (){
    var Game = function(canvasId){
        var canvas = document.getElementById(canvasId);
        var screen = canvas.getContext("2d");
        var gamesize = {
            x: canvas.width,
            y: canvas.height
        };

        this.bodies = [new Player(this, gamesize)];
        this.invaders = createInvaders(this)

        var self = this;
        var tick = function(){
            self.update(gamesize);
            self.draw(screen, gamesize);
            requestAnimationFrame(tick);
        }

        tick();
    }

    Game.prototype = {
        update: function(gamesize) {
            for(var i = 0; i < this.bodies.length; i++){
                if(this.bodies[i].position.x > gamesize.x) {
                    this.bodies.splice(i, 1); //удаляет 1 элемент из массива после элемента i
                }
            }
            for(var i = 0; i < this.bodies.length; i++){
                this.bodies[i].update();
            }
            for(var i = 0; i < this.invaders.length; i++){
                this.invaders[i].update();
            }
        },
        draw: function(screen, gamesize) {
            clearRect(screen, gamesize);
            drawPony(screen, this.bodies[0])
            for(var i = 1; i < this.bodies.length; i++){
                drawPrim(screen, this.bodies[i]);
            }
            for(var i = 0; i < this.invaders.length; i++){
                drawEnemy(screen, this.invaders[i]);
            }
        },
        addBody: function(body) {
            this.bodies.push(body);
        },
    }

    var Invader = function(game, position) {
        this.game = game;
        this.size = {width: 16, height:16};
        this.position = position;
        this.patrolX = 0;
        this.speedX = 2;
    }

    Invader.prototype = {
        update: function() {
            if(this.patrolX < 0 || this.patrolX > 160) {
                this.speedX = -this.speedX
            }

            this.position.x += this.speedX;
            this.patrolX += this.speedX;
        }
    }

    var createInvaders = function(game){
        var invaders = [];
        for(var i = 0; i < 24; i++){
            var x = 30 + (i%8) *70;
            var y = 30 + (i%3) *70;
            invaders.push(new Invader(game, {x:x, y:y}));
        }
        return invaders;
    }

    var Player = function(game, gamesize){
        this.game = game;
        this.bullets = 0;
        this.timer = 0;
        this.size = {width:80, height:80}; //100*80 по нормальному
        this.position = {x: gamesize.x/10, y: gamesize.y/2 - this.size.height/2};
        this.Keyboarder = new Keyboarder();
    }

    var Bullet = function(position, velocity){
        this.size = {width:5, height:5};
        this.position = position;
        this.velocity = velocity;
    }

    Bullet.prototype = {
        update: function(){
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

    Player.prototype = {
        update: function(){
            if(this.Keyboarder.isDown(this.Keyboarder.KEYS.LEFT)) {
                this.position.x -= 5
            }
            if(this.Keyboarder.isDown(this.Keyboarder.KEYS.RIGHT)) {
                this.position.x += 5
            }
            if(this.Keyboarder.isDown(this.Keyboarder.KEYS.UP)) {
                this.position.y -= 5
            }
            if(this.Keyboarder.isDown(this.Keyboarder.KEYS.DOWN)) {
                this.position.y += 5
            }
            if(this.Keyboarder.isDown(this.Keyboarder.KEYS.SPACE)) {
                if (this.bullets < 5) {
                var bullet = new Bullet({x:this.position.x + this.size.width, y:this.position.y + this.size.width/2}, {x:6, y: 0});
                this.game.addBody(bullet);
                this.bullets++;
                }
            }
            this.timer++;
            if(this.timer % 15 == 0){
                this.bullets = 0;
            }
        }
    }

    var Keyboarder = function() {
        var keyState = {};
        window.onkeydown = function(e) {
            keyState[e.keyCode] = true;
        }
        window.onkeyup = function(e) {
            keyState[e.keyCode] = false;
        }
        this.isDown = function(keyCode){
            return keyState[keyCode] === true;
        }

        this.KEYS = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32};
    }

    var imgPony = new Image();
    imgPony.src = "images/pony R sprite.png"
    var imgEnemy = new Image();
    imgEnemy.src = "images/enemy R sprite.png"

    var drawPony = function(screen, body){
        screen.drawImage(imgPony, body.position.x, body.position.y, 100, 80);
    }
    var drawEnemy = function(screen, body){
        screen.drawImage(imgEnemy, body.position.x, body.position.y, 70, 55);
    }
    var drawPrim = function(screen, body){
        screen.fillRect(body.position.x, body.position.y, body.size.width, body.size.height);
    }

    var clearRect = function(screen, gamesize){
        screen.clearRect(0, 0, gamesize.x, gamesize.y);
    }

    window.onload = function() {
        new Game("screen");
    }
})();