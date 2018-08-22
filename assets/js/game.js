(function () {

    var platforms, player, cursors, horseshoes, nails, beers, dollars, graphics;
    var score = 0;
    var scoreText;

    var config = {
        type: Phaser.AUTO,
        width: 900,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {y: 400},
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config);

    function preload() {        
        this.load.image('backyard', 'assets/images/backyard.jpg');
        this.load.image('goldbar', 'assets/images/goldbar.png');
        this.load.image('ground1', 'assets/images/platform.png');
        this.load.image('ground2', 'assets/images/woodtrunk.png');
        this.load.image('horseshoe', 'assets/images/horseshoe.png');
        this.load.image('nail', 'assets/images/nail.png');
        this.load.image('dollar', 'assets/images/dollars.png');
        this.load.image('beer', 'assets/images/beer.png');
        this.load.spritesheet('trump', 'assets/images/trump.png', {
            frameWidth: 32,
            frameHeight: 48
        });
        this.load.audioSprite('sfx', 'assets/audio/fx_mixdown.json', [
            'assets/audio/fx_mixdown.ogg',
            'assets/audio/fx_mixdown.mp3'
        ]);
    }
    function create() {
        this.add.image(550, 300, 'backyard');
        this.cameras.main.setBounds(0, 0, 1000, 176);        
        
        platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground2').setScale(2.4).refreshBody();
        platforms.create(625, 400, 'ground1');
        platforms.create(790, 220, 'ground2').setScale(1.4).refreshBody();
        platforms.create(90, 250, 'ground1');
        ;

        //Player
        player = this.physics.add.sprite(300, 150, 'trump');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('trump', {
                start: 0,
                end: 3
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('trump', {
                start: 5,
                end: 8
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [{key: 'trump', frame: 4}],
            frameRate: 20
        });


        this.physics.add.collider(player, platforms);

        cursors = this.input.keyboard.createCursorKeys();
        this.cameras.main.startFollow(player, true);
        this.cameras.main.setZoom(2);
        if (this.cameras.main.deadzone) {
            graphics = this.add.graphics().setScrollFactor(0);
            graphics.lineStyle(2, 0x00ff00, 1);
            graphics.strokeRect(200, 200, this.cameras.main.deadzone.width, this.cameras.main.deadzone.height);
        }


//        goldbars = this.physics.add.group({
//            key: 'goldbar',
//            repeat: 5,
//            setXY: {x: 10, y: 10, stepX: 150}
//        });
        dollars = this.physics.add.group({
            key: 'dollar',
            repeat: 5,
            setXY: {x: 8, y: 8, stepX: 120}
        });
       
        beers = this.physics.add.group({
            key: 'beer',
            repeat: 4,
            setXY: {x: 30, y: 20, stepX: 140}
        });
        nails = this.physics.add.group({
            key:'nail',
            repeat:6,
            setXY:{x:10, y:10, stepX:80}
        });
        dollars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.7));
        });
        beers.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.3));
        });
        nails.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.1));
        });

        //this.physics.add.collider(goldbars, platforms);
        this.physics.add.collider(dollars, platforms);        
        this.physics.add.collider(beers, platforms);
        this.physics.add.collider(nails, platforms);
        this.physics.add.overlap(player, dollars, collectDollar, null, this);
        this.physics.add.overlap(player, beers, collectBeer, null, this);
        this.physics.add.overlap(player, nails, stepIntoNail, null, this);
        
        //Text
        scoreText = this.add.text(20, 20, 'Points: 0', {
            fontSize: '40px',
            fill: '#fff'
        });
        //horseshoes
        horseshoes = this.physics.add.group();        
        this.physics.add.collider(horseshoes, platforms);
        this.physics.add.overlap(player, horseshoes, bumm, null, this);
        this.cameras.main.startFollow(player, true);
        this.cameras.main.setZoom(1);

        if (this.cameras.main.deadzone)        {
            graphics = this.add.graphics().setScrollFactor(0);
            graphics.lineStyle(2, 0x00ff00, 1);
            graphics.strokeRect(100, 100, this.cameras.main.deadzone.width, this.cameras.main.deadzone.height);
        }
    }

    function bumm(player, horseshoe) {
        this.sound.playAudioSprite('sfx', 'death');
        player.setTint(0xff0000);//
        scoreText.setText("YOU ARE HIT AND DEAD! VERY SAD!");
        this.physics.pause();
        player.anims.play('turn');
    }
    function stepIntoNail(player, nail) {
        this.sound.playAudioSprite('sfx', 'meow');
        nail.disableBody(true, true);//(disable,hide)
        score -= 5;
        if(score<0){
           player.setTint(0x000000);
           scoreText.setText("YOU ARE LOWER THAN NULL! DEAD!");
           this.physics.pause();
           player.anims.play('turn');
           
        }
        else{
            scoreText.setText('Points: ' + score);
        }  

    } 
    function collectBeer(player, beer) {
        this.sound.playAudioSprite('sfx', 'death');
        beer.disableBody(true, true);//(disable,hide)
        score += 10;
        scoreText.setText('Points: ' + score);
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    }  

function collectDollar(player, dollar) {
        this.sound.playAudioSprite('sfx', 'ping');
        dollar.disableBody(true, true);//(disable,hide)
        score += 1;
        scoreText.setText('Points: ' + score);
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var horseshoe = horseshoes.create(x, 16, 'horseshoe');
        horseshoe.setBounce(0.1);
        horseshoe.setCollideWorldBounds(true);
        horseshoe.setVelocity(Phaser.Math.Between(-200, 200), 20);
        horseshoe.allowGravity = false;
    }
    

    function update() {

        if (cursors.left.isDown) {

            player.setVelocityX(-160);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn', true);
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-400);

        }


    }

})();