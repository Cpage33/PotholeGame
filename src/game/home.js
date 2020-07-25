export default class Home extends Phaser.State {
  constructor() {
    super();
  }

  init() {
  }

  create() {
    this.state.start('Game');
  }

}
