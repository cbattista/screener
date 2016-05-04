Game.Instructions = function (game) {

	this.music = null
	this.playButton = null

}

Game.Instructions.prototype = {

  create: function () {

    instructions = this.game.add.text(490, 50, 'In this experiment, you will see two sets of numbers side-by-side.  Your job is to decide which number is the biggest.  If the larger number is on the left, push the F key. If the larger number is on the right, push the J key.\n\n Place your hands so your left hand is over the F key and your right hand is over J key.  \n\nPress the SPACEBAR to try some practice.',
																								ins_style);
    instructions.anchor.x = 0.5;
		instructions.wordWrap = true;
		instructions.wordWrapWidth = window.innerWidth - 400;
    //instructions.lineSpacing = -8
    //this.go_button = this.add.button(450, 410, 'hammy', function () {this.state.start('Run');}, this);
		//this.go_button.addChild(this.add.text(0, 0, 'Go!', {'font': '64px Arial', 'fill':'#AA0000'}));

		space = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
		space.onDown.add(function () {this.state.start('Run');}, this);

  },

}
