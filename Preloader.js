Game.Preloader = function (game) {

	this.background = null
	this.preloadBar = null
	this.ready = false
	this.rnd

}

Game.Preloader.prototype = {

	init: function (problem_set) {
		this.problem_set = problem_set
	},

	preload: function () {

		this.preloadBar = this.add.sprite(120, 200, 'preloaderBar')

		this.load.setPreloadSprite(this.preloadBar)

		//	Here we load the rest of the assets our game needs.
		this.game.load.image('correct', '/images/incorrect.png');
		this.game.load.image('incorrect', '/images/correct.png');
		this.game.load.image('hammy', '/images/hamster5000.png');

	},

	create: function () {

		this.preloadBar.cropEnabled = false
		this.state.start('Menu')


	},


}
