export default class Loader extends Phaser.State {
  constructor() {
    super();
  }

  preload() {
    this.addProgressLabel();
    this.load.onFileComplete.add(this.refreshProgress, this);

    this.logo = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.logo.anchor.setTo(0.5);


    this.load.image('platform', 'assets/images/platform1.png');
    this.load.image('ground', 'assets/images/ground.png');
    this.load.image('monkey', 'assets/images/monkey.png');
    this.load.image('arrow', 'assets/images/arrow.png');
    this.load.image('barrel', 'assets/images/barrel.png');

    this.load.spritesheet('fire','assets/images/fire.png', 16, 16, 4);
    this.load.spritesheet('player','assets/images/player.png', 80, 110, 4);

    this.load.text('level', 'assets/data/level.json');
    this.load.audio('death', ['assets/audio/death.ogg', 'assets/audio/death.mp3']);



  }

  create() {
    this.state.start('Home');
  }

  addProgressLabel() {
    const style = {
      font: '41px Open Sans',
      fill: '#000',
    }

    this.progressLabel = this.add.text(this.game.world.centerX, this.game.world.centerY + 100, 'Loading: 0% (0/0)', style);
    this.progressLabel.anchor.setTo(0.5);
  }

  refreshProgress(progress, cacheKey, success, totalLoaded, totalFiles) {
    this.progressLabel.text = `Loading ${progress}% (${totalLoaded}/${totalFiles})`;
  }
}
