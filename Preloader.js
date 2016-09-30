Game.Preloader = function (game) {

	this.background = null
	this.preloadBar = null
	this.ready = false
	this.rnd
	this.game = game

}

Game.Preloader.prototype = {

	init: function (task) {
		this.task = task
	},

	preload: function () {
		this.preloadBar = this.add.sprite(this.game.world.centerX,
																			this.game.world.centerY, 'preloaderBar')
		this.preloadBar.anchor.set(0.5, 0.5)
		this.load.setPreloadSprite(this.preloadBar)

		//	Here we load the rest of the assets our game needs.
		this.game.load.image('correct', '/images/correct.png')
		this.game.load.image('incorrect', '/images/incorrect.png')
	},

	create: function () {
		this.preloadBar.cropEnabled = false

		this.state.start(this.task)
	},


}
