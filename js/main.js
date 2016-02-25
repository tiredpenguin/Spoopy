    window.onload = function() {
        // You might want to start with a template that uses GameStates:
        //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic

        // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
        // You will need to change the fourth parameter to "new Phaser.Game()" from
        // 'phaser-example' to 'game', which is the id of the HTML element where we
        // want the game to go.
        // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
        // You will need to change the paths you pass to "game.load.image()" or any other
        // loading functions to reflect where you are putting the assets.
        // All loading functions will typically all be found inside "preload()".

        "use strict";

        var game = new Phaser.Game(500, 500, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render } );

        function preload() {
            game.load.spritesheet('stick', 'assets/play.png', 32, 60);
            game.load.spritesheet('enemy', 'assets/enemy.png', 50, 80);
            game.load.image('darkness', 'assets/darkness.png');
            game.load.image('boundary', 'assets/boundary.png');
            game.load.image('rock', 'assets/rock.png');
            game.load.image('key', 'assets/key.png');
            game.load.image('door', 'assets/door.png');
            game.load.audio('walkSound', 'assets/walking.mp3');
            game.load.audio('keyS', 'assets/nes-13-08_01.mp3');
            game.load.audio('caught', 'assets/nes-14-11_01.mp3');
            game.load.audio('escape', 'assets/escape.mp3');
        }

        var player;
        var platform;
        var obstacles;
        var enemy;
        var door;
        var key;
        var doorLocation;
        var cursors;
        var hasKey;
        var ready = false;
        var hasWon = false;
        var direction = 1;
        var maxSpeed = 125;
        var acceleration = 1200;
        var drag = 400;
        var dead = false;
        var distance;
        var text = 0;
        var instr = 0;
        var instr2 = 0;
        var counter = 0;
        var walk;
        var keySound;
        var caught;
        var escape;

        var darkness;

        function create() {
            game.stage.backgroundColor = 0xffffff;

            game.physics.startSystem(Phaser.Physics.ARCADE);

            platform = game.add.group();
            platform.enableBody = true;
            obstacles = game.add.group();
            obstacles.enableBody = true;
            for (var x = 0; x < game.width; x += 32) 
            {
                var groundBlock = game.add.sprite(x, game.height - 32, 'boundary');
                game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
                groundBlock.body.immovable = true;
                groundBlock.body.allowGravity = false;
                platform.add(groundBlock);
            }
            for (var x = 0; x < game.width; x += 32) 
            {
                var groundBlock = game.add.sprite(x, 0, 'boundary');
                game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
                groundBlock.body.immovable = true;
                groundBlock.body.allowGravity = false;
                platform.add(groundBlock);
            }
            for (var x = 0; x < game.width; x += 32) 
            {
                var groundBlock = game.add.sprite(game.height - 32, x, 'boundary');
                game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
                groundBlock.body.immovable = true;
                groundBlock.body.allowGravity = false;
                platform.add(groundBlock);
            }
            for (var x = 0; x < game.width; x += 32) 
            {
                var groundBlock = game.add.sprite(0, x, 'boundary');
                game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
                groundBlock.body.immovable = true;
                groundBlock.body.allowGravity = false;
                platform.add(groundBlock);
            }
            
            player = game.add.sprite(game.rnd.between(50,430),game.rnd.between(50,410), 'stick');
            game.physics.arcade.enable(player);
            player.anchor.setTo(0.5, 0.5);
            player.body.collideWorldBounds = true;
            player.body.maxVelocity.setTo(maxSpeed, maxSpeed);
            player.body.drag.setTo(drag, drag);
            player.animations.add('goRight', [6, 7, 8, 9], 12, true);
            player.animations.add('goLeft', [10, 11, 12, 13], 12, true);
            player.animations.add('faceRight', [9], 5, true);
            player.animations.add('faceLeft', [13], 5, true);
            player.animations.add('goDown', [0, 1, 0, 2], 12, true);
            player.animations.add('goUp', [3, 4, 3, 5], 12, true);
            player.animations.add('faceDown', [0], 5, true);
            player.animations.add('faceUp', [3], 5, true);
            player.animations.add('dead', [14], 2, true);
            game.world.bringToTop(instr);
            instr2 = game.add.text(410, 10, 'Score: 0', { font: "14px Verdana", fill: "#ffffff", align: "left" });
            reset();
            
            walk = game.add.audio('walkSound');
            keySound = game.add.audio('keyS');
            caught = game.add.audio('caught');
            escape = game.add.audio('escape');
            walk.allowMultiple = false;
            caught.allowMultiple = false;
            escape.allowMultiple = false;
            
            
            
            cursors = game.input.keyboard;
            }

        function update() {
        game.physics.arcade.collide(player, platform);
        game.physics.arcade.collide(player, obstacles);
        game.physics.arcade.collide(player, enemy, death, null, this);
        game.physics.arcade.overlap(player, key, getKey, null, this);
            
        if (game.physics.arcade.collide(player, door) & hasKey & ready) {
            win();
        }
        if (dead)
        {
            player.frame = 14;
        }
        if (cursors.isDown(Phaser.Keyboard.A) && !dead && !hasWon)
        {
            //  Move to the left
            player.body.acceleration.x = -acceleration;
        }
        else if (cursors.isDown(Phaser.Keyboard.D) && !dead && !hasWon)
        {
            //  Move to the right
            player.body.acceleration.x = acceleration;
        }
        else
        {
            player.body.acceleration.x = 0;
        }

        if (cursors.isDown(Phaser.Keyboard.W) && !dead && !hasWon)
        {
            //  Move up
            player.body.acceleration.y = -acceleration;
        }
        else if (cursors.isDown(Phaser.Keyboard.S) && !dead && !hasWon)
        {
            //  Move down
            player.body.acceleration.y = acceleration;
        }
        else
        {
            player.body.acceleration.y = 0;  
        }

        //animations based on velocity
        if (player.body.velocity.x > 0) {
            player.animations.play('goRight');
            direction = 1;
        }
        else if (player.body.velocity.x < 0) {
            player.animations.play('goLeft');
            direction = 0;
        }
        else
        {

            if (player.body.velocity.y > 0) {
                player.animations.play('goDown');
                direction = 2;
            }
            else if (player.body.velocity.y < 0) {
                player.animations.play('goUp');
                direction = 3;
            }
        }
        
        if (player.body.velocity.x == 0 & player.body.velocity.y == 0) {
            if (direction == 1) player.animations.play('faceRight');
            else if (direction == 0) player.animations.play('faceLeft');
            else if (direction == 2) player.animations.play('faceDown');
            else if (direction == 3) player.animations.play('faceUp');
        }
        else {
            if (!walk.isPlaying) {
                walk.play('',0,.3);
            }
        }
        
        enemy.animations.play('move');
        distance = game.math.distance(enemy.x, enemy.y, player.x, player.y);
        if (distance != 0 & !dead & ready & !hasWon) {
            var rotation = game.math.angleBetween(enemy.x, enemy.y, player.x, player.y);
            enemy.body.velocity.x = (Math.cos(rotation) * (35+(counter*6)));
            enemy.body.velocity.y = (Math.sin(rotation) * (35+(counter*6)));
        }
        else {
            enemy.body.velocity.setTo(0,0);
        }
        
        if (cursors.isDown(Phaser.Keyboard.E) & !ready) {
            ready = true;
            resetInstructions();
            enemy.kill();
            door.kill();
            key.kill();
            darkness.kill();
            reset();
            instr = game.add.text(30, 30, 'The spooky has been released!', { font: "14px Verdana", fill: "#ffffff", align: "left" });
            game.time.events.add(Phaser.Timer.SECOND * 2, resetInstructions, this);
        }
            
        if (cursors.isDown(Phaser.Keyboard.Q) & hasWon) {
            counter++;
            game.world.remove(instr2);
            instr2 = game.add.text(410, 10, 'Score: ' + counter, { font: "14px Verdana", fill: "#ffffff", align: "left" });
            hasWon = false;
            enemy.kill();
            door.kill();
            darkness.kill();
            key.kill();
            reset();
        }
        
        darkness.x = player.x;
        darkness.y = player.y;
        darkness.scale.set(3 + (game.rnd.frac()/2));
    }
        
    function reset() {
        hasKey = false;
        player.x = game.rnd.between(50,430);
        player.y = game.rnd.between(50,430);
        obstacles.forEach(function(member) {member.kill();});
        for (var x = 0; x < 6; x++) {
            var groundBlock = game.add.sprite(game.rnd.between(50,430),game.rnd.between(50,410), 'rock');
            game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
            groundBlock.body.immovable = true;
            groundBlock.body.allowGravity = false;
            obstacles.add(groundBlock);
        }
        enemy = game.add.sprite(500, 500, 'enemy');
        game.physics.arcade.enable(enemy);
        enemy.animations.add('move', [0, 1], 15, true);
        key = game.add.sprite(game.rnd.between(50,430),game.rnd.between(50,410), 'key');
        game.physics.arcade.enable(key);
        door = game.add.sprite(game.rnd.between(50,430),game.rnd.between(50,410), 'door');
        game.physics.arcade.enable(door);
        door.body.immovable = true;
        darkness = game.add.sprite(player.x, player.y, 'darkness');
        game.physics.arcade.enable(player);
        darkness.anchor.setTo(0.5, 0.5);
        darkness.scale.set(3);
        darkness.smoothed = false;
        if (!ready) {
            instr = game.add.text(30, 30, 'Welcome to Ghosts and Keys\nWASD Controls\nFind the key in the darkness and head of the door!\nWhenever you\'re ready press E to reset and release the spooky', { font: "14px Verdana", fill: "#ffffff", align: "left" });
        }
        else {
            resetInstructions();
        }
        game.world.bringToTop(instr2);
    }
    
    function getKey() {
        key.kill();
        hasKey = true;
        keySound.play('', 0, 0.5);
    }
    
    function win() {
        if (!hasWon) {
            escape.play();
        }
        hasWon = true;
        if (ready) {
            resetInstructions();
            instr = game.add.text(30, 30, 'You escaped! :D\nPress Q to restart with faster spooky', { font: "14px Verdana", fill: "#ffffff", align: "left" });
        }
    }
        
    function death() {
        resetInstructions();
        caught.play();
        instr = game.add.text(30, 30, 'Spooked! Refresh to restart', { font: "20px Verdana", fill: "#ffffff", align: "left" })
        game.stage.backgroundColor = 0xff0000;
        dead = true;
    }

    function resetInstructions() {
        game.world.remove(instr);
    }
        function render() {
        }
    };
