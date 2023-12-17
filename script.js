let flag = true;
let killedEnemies = 0;
let madeshoots = 0;
const searchParams = new URLSearchParams(window.location.search);
switch (searchParams.get('difficulty')){
    case 'easy':
        var koefdif = 100;
        break;
    case 'hard':
        var koefdif = 300;
        break;
    default:
        var koefdif = 200;
        break;
}

function EndGame(seconds, killed, shoots, interval){
    let name = prompt("Please, enter your name, mortal", "H0peles$0uL");
    data = {name: name, accuracy: killed/shoots * 100, time: seconds};
    scoresStr = localStorage.getItem('score')
    score = JSON.parse(scoreStr)
    if (score === null) {
        score = []
   }
   score.push(data);
   scoreStr = JSON.stringify(score);
   localStorage.setItem('score', scoreStr);
   clearInterval(interval);
//    window.location.reload();
};

function isCollidng(entityOne, entityTwo) {
    return !(entityOne === entityTwo || 
        entityOne.position.x + entityOne.size.width / 2 < entityTwo.position.x - entityTwo.size.width / 2 ||
        entityOne.position.y + entityOne.size.height / 2 < entityTwo.position.y - entityTwo.size.height / 2 || 
        entityOne.position.x - entityOne.size.width / 2 > entityTwo.position.x + entityTwo.size.width / 2 || 
        entityOne.position.y - entityOne.size.height / 2 > entityTwo.position.y + entityTwo.size.width / 2)
}

;(function (){
    window.onload = function() {
        scoreJson = localStorage.getItem('score')
        score = JSON.parse(scoreJson)
        if (score !== null) {
            for(const el of score) {}
        }
        const countkilled = document.getElementById('killed');
        const countshoots = document.getElementById('shoots');
        let seconds = 25;
        document.getElementById('timer').textContent = seconds
        const timer = document.getElementById('timer');
        let name = ''
        const interval = setInterval(() => {
            if (seconds < 0 || flag == false) {
                flag = false;
                EndGame(seconds, killedEnemies, madeshoots);
                // clearInterval(interval);
                return;
            }
            timer.textContent = seconds;
            seconds--; 
            
        }, 1000);
        setInterval(() => {
            countkilled.textContent = killedEnemies;
            countshoots.textContent = madeshoots;
        }, 20);
        if (!flag) {
            EngGame(seconds, killedEnemies, madeshoots);
        }
        new Game("screen");

    }

    var Game = function(canvasId){
        var canvas = document.getElementById(canvasId);
        var screen = canvas.getContext("2d");
        var gamesize = {
            x: canvas.width,
            y: canvas.height
        };

        this.entitiesTypes = {Enemy: 'enemy', Player: 'player', Bullet: 'bullet'}
        this.entities = [{entity: new Player(this, gamesize), type: this.entitiesTypes.Player}]
        createInvaders(this, this.entities, this.entitiesTypes)

        var self = this;
        loadSound("sounds/glitch.wav", function(collisionsSound) {
            self.collisionsSound = collisionsSound;
            var tick = function(){
                self.update(gamesize);
                self.draw(screen, gamesize);
                requestAnimationFrame(tick);
            }
            tick();
        });
    }

    Game.prototype = {
        update: function(gamesize) {
            if (!flag) {
                return;
            }
            const eCopy = [...this.entities];
            for (let i = 0; i < eCopy.length; i++) {
                for (let j = 0; j < eCopy.length; j++) {
                    const firstType = eCopy[i].type;
                    const secondType = eCopy[j].type;
                    if ((firstType !== this.entitiesTypes.Player && firstType !== this.entitiesTypes.Bullet)
                        || secondType !== this.entitiesTypes.Enemy) continue;

                    if (isCollidng(eCopy[i].entity, eCopy[j].entity)) {
                        if (eCopy[i].type === this.entitiesTypes.Player) {
                            flag = false;
                            this.collisionsSound.load();
                            this.collisionsSound.play();
                            killedEnemies++;
                            return;
                        }
                        this.entities.splice(i,1);
                        this.entities.splice(j,1);
                        killedEnemies++;
                        this.collisionsSound.load();
                        this.collisionsSound.play();
                    }
                }
            }
            for (let i = 0; i < this.entities.length; i++) {
                switch (this.entities[i].type) {
                    case this.entitiesTypes.Bullet:
                        if (this.entities[i].entity.position.x > gamesize.x) {
                            this.entities.splice(i, 1);
                            break;
                        }
                        this.entities[i].entity.update()
                        break;
                    default:
                        this.entities[i].entity.update();
                        break;
                }
            }
        },
        draw: function(screen, gamesize) 
        {
            clearRect(screen, gamesize);
            this.entities.forEach((el, ind) =>{
                switch (el.type) {
                    case this.entitiesTypes.Enemy:
                        drawEnemy(screen, el.entity);
                        break;
                    case this.entitiesTypes.Bullet:
                        drawPrim(screen, el.entity);
                        break;
                    case this.entitiesTypes.Player:
                        drawPony(screen, el.entity);
                        break
                }
            })
        },
        addBody: function(body) {
            this.entities.push({entity: body, type: this.entitiesTypes.Bullet});
        },
    }

    var Invader = function(game, position) {
        this.game = game;
        this.size = {width: 70, height:55};
        this.position = position;
        this.timer = 0;
        this.speedX = 2;
    }

    Invader.prototype = {
        update: function() {
            this.position.x -= this.speedX;
        }
    }

    var createInvaders = function(game, entities, entetiesTypes){
        setInterval(
            () => {
            var y = Math.floor(Math.random() * 470);
            entities.push({entity: new Invader(game, {x:900, y:y}), type: entetiesTypes.Enemy});
            },
            1 * 1000 * (100 / koefdif)
          );
    }

    var Player = function(game, gamesize){
        this.game = game;
        this.bullets = 0;
        this.timer = 0;
        this.size = {width:100, height:80};
        this.position = {x: gamesize.x/10, y: gamesize.y/2 - this.size.height/2};
        this.Keyboarder = new Keyboarder();
    }

    var Bullet = function(position, velocity){
        madeshoots++;
        this.size = {width:6, height:6};
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
                if (this.bullets < 1) {
                    var bullet = new Bullet({x:this.position.x + this.size.width, y:this.position.y + this.size.width/2}, {x:6, y: 0});
                    this.game.addBody(bullet);
                    this.bullets++;
                }
            }
            this.timer++;
            if(this.timer % (koefdif / 10) == 0){
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
    imgEnemy.src = "images/enemy R1 sprite.png"


    var loadSound = function(url, callback) {
        var loaded = function(){
            callback(sound);
            sound.removeEventListener("canplaythrough", loaded);
        };
        var sound = new Audio(url);
        sound.addEventListener("canplaythrough", loaded);
        sound.load();
    }

    var drawPony = function(screen, body){
        screen.shadowOffsetX = 0;
        screen.drawImage(imgPony, body.position.x, body.position.y, 100, 80);
        
    }
    var drawEnemy = function(screen, body){
        screen.shadowOffsetX = 0;
        screen.drawImage(imgEnemy, body.position.x, body.position.y, 70, 55);
    }
    var drawPrim = function(screen, body){
        screen.fillStyle = "white";
        screen.shadowOffsetX = -1;
        screen.shadowColor = "red";
        screen.fillRect(body.position.x, body.position.y, body.size.width, body.size.height);
    }

    
    var clearRect = function(screen, gamesize){
        screen.clearRect(0, 0, gamesize.x, gamesize.y);
    }
})();

