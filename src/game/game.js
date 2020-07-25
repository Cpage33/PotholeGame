export default class Game extends Phaser.State {
  constructor() {
    super();
  }

  init() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 1000;

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.game.world.setBounds(0, 0, 360, 700);

    this.RUNNING_SPEED = 180;
    this.JUMPING_SPEED = 550;
  }

  preload() {

  }

  create() {
    this.ground = this.add.sprite(0, 630, 'ground');
    this.ground.scale.setTo(0.563);
    this.game.physics.arcade.enable(this.ground);
    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;

    this.levelData = JSON.parse(this.game.cache.getText('level'));

    this.platforms = this.add.group();
    this.platforms.enableBody = true;

    this.levelData.platformData.forEach((element) => {
      this.platforms.create(element.x, element.y, 'platform');
    }, this);
    this.platforms.setAll('body.immovable', true);
    this.platforms.setAll('body.allowGravity', false);

    //fires
    this.fires = this.add.group();
    this.fires.enableBody = true;

    let fire;
    this.levelData.fireData.forEach((element) => {
      fire = this.fires.create(element.x, element.y, 'fire');
      fire.animations.add('fire', [0, 1, 2, 3], 8, true);
      fire.play('fire');
      fire.scale.setTo(1.2);
    }, this);
    this.fires.setAll('body.allowGravity', false);

    //monkey
    this.monkey = this.add.sprite(this.levelData.monkey.x, this.levelData.monkey.y, 'monkey');
    this.monkey.scale.setTo(0.2);
    this.game.physics.arcade.enable(this.monkey);
    this.monkey.body.allowGravity = false;


    this.player = this.add.sprite(this.levelData.playerStart.x, this.levelData.playerStart.y, 'player', 2);
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.7);
    this.player.animations.add('walking', [0, 1], 6, true);
    this.game.physics.arcade.enable(this.player);
    this.player.customParams = {
      "alive": true
    };
    this.player.body.collideWorldBounds = true;

    this.game.camera.follow(this.player);

    this.createOnscreenControls();

    this.barrels = this.add.group();
    this.barrels.enableBody = true;
    this.barrels.customParams = {
      "velocityRight": true
    }

    this.createBarrel();
    this.barrelCreator = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.barrelFrequency, this.createBarrel, this);

    this.deathSound = this.game.add.audio('death');
  }

  update() {
    this.game.physics.arcade.collide(this.player, this.ground);
    this.game.physics.arcade.collide(this.player, this.platforms);

    this.game.physics.arcade.collide(this.barrels, this.ground);
    this.game.physics.arcade.collide(this.barrels, this.platforms);

    this.game.physics.arcade.overlap(this.player, this.fires, this.killPlayer);
    this.game.physics.arcade.overlap(this.player, this.barrels, this.killPlayer);
    this.game.physics.arcade.overlap(this.player, this.monkey, this.win);

    if(!this.player.customParams.alive) {
      this.gameOver();
    }

    this.player.body.velocity.x = 0;

    if(this.cursors.left.isDown || this.player.customParams.isMovingLeft) {
      this.player.body.velocity.x = -this.RUNNING_SPEED;
      this.player.scale.setTo(-0.7, 0.7);
      this.player.play('walking');
    }
    else if(this.cursors.right.isDown || this.player.customParams.isMovingRight) {
      this.player.body.velocity.x = this.RUNNING_SPEED;
      this.player.scale.setTo(0.7);
      this.player.play('walking');
    }
    else if(!this.player.body.touching.down) {
      this.player.frame = 3;
    } else {
      this.player.animations.stop();
      this.player.frame = 2;
    }

    if((this.cursors.up.isDown || this.player.customParams.mustJump) && this.player.body.touching.down) {
        this.player.body.velocity.y = -this.JUMPING_SPEED;
        this.player.customParams.mustJump = false;
    }

    this.barrels.forEach((element) => {
      if((element.x < 10 || element.x > 340 ) && element.y > 600) {
        element.kill();
      }
    }, this);
  }

  render() {

  }

  createOnscreenControls() {
    this.leftArrow = this.add.button(50, 610, 'arrow');
    this.leftArrow.anchor.setTo(0.5);
    this.rightArrow = this.add.button(130, 610, 'arrow');
    this.rightArrow.anchor.setTo(0.5);
    this.rightArrow.angle = 180;
    this.actionButton = this.add.button(300, 610, 'arrow');
    this.actionButton.anchor.setTo(0.5);
    this.actionButton.angle = 90;

    this.leftArrow.alpha = 0.7;
    this.rightArrow.alpha = 0.7;
    this.actionButton.alpha = 0.7;

    this.leftArrow.fixedToCamera = true;
    this.rightArrow.fixedToCamera = true;
    this.actionButton.fixedToCamera = true;


    this.actionButton.events.onInputDown.add(() => {
      this.player.customParams.mustJump = true;
    }, this);
    this.actionButton.events.onInputUp.add(() => {
      this.player.customParams.mustJump = false;
    }, this);

    //left
    this.leftArrow.events.onInputDown.add(() => {
      this.player.customParams.isMovingLeft = true;
    }, this);
    this.leftArrow.events.onInputUp.add(() => {
      this.player.customParams.isMovingLeft = false;
    }, this);
    this.leftArrow.events.onInputOver.add(() => {
      this.player.customParams.isMovingLeft = true;
    }, this);
    this.leftArrow.events.onInputOut.add(() => {
      this.player.customParams.isMovingLeft = false;
    }, this);

    //right
    this.rightArrow.events.onInputDown.add(() => {
      this.player.customParams.isMovingRight = true;
    }, this);
    this.rightArrow.events.onInputUp.add(() => {
      this.player.customParams.isMovingRight = false;
    }, this);
    this.rightArrow.events.onInputOver.add(() => {
      this.player.customParams.isMovingRight = true;
    }, this);
    this.rightArrow.events.onInputOut.add(() => {
      this.player.customParams.isMovingRight = false;
    }, this);
  }

  killPlayer(player, fire) {
    player.customParams.alive = false;
  }

  createBarrel() {
    let barrel = this.barrels.getFirstExists(false);
    if(!barrel) {
      barrel = this.barrels.create(0, 0, 'barrel');
    }
    barrel.body.collideWorldBounds = true;
    barrel.body.bounce.set(1, 0);

    barrel.reset(this.levelData.monkey.x + 50, this.levelData.monkey.y);
    if(this.barrels.customParams.velocityRight) {
      barrel.body.velocity.x = this.levelData.barrelSpeed;
      this.barrels.customParams.velocityRight = false;
    } else {
      barrel.body.velocity.x = -this.levelData.barrelSpeed;
      this.barrels.customParams.velocityRight = true;
    }
  }

  win(player, monkey) {
    alert("You win!!");
    player.customParams.alive = false;
  }
  gameOver() {
    this.deathSound.play();
    this.game.state.start('Game');
  }

}
