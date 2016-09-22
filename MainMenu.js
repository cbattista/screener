
BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		this.add.tileSprite(0, 0, 800, 600, 'space');

		//add world bounds
		this.world.setBounds(0, 0, 800, 600);

	//	this.title = this.add.sprite(this.world.centerX, 200, 'title');
	//	this.title.anchor.setTo(0.5, 0.5);


		this.instructions = this.add.text(this.world.centerX, 375, 'Click on the hammyhams to begin hamulation.', {'font': '24px Arial', 'fill':'#fff'});
		this.instructions.anchor.setTo(0.5, 0.5);

		this.playButton = this.add.button(this.world.centerX, 450, '', this.startGame, this);
		this.playButton.anchor.setTo(0.5, 0.5);




	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)

		//	And start the actual game
		this.state.start('Game', true, false, 0);

	}

};
