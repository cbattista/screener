instructions = {};

instructions['practice'] = "Let's try some practice.\n\nPress SPACEBAR to practice."
instructions['practice_again'] = "Let's try a little more practice.\n\nPress SPACEBAR to practice some more."
instructions['practice_success'] = "Great job!  Now let's play for real!\n\nPress SPACEBAR to continue."
instructions['practice_fail'] = "Looks like you're having trouble, and that's no fun.\n\nPress SPACEBAR to move on to the next experiment."

Practice = function(screen, trial_clock, diff) {
	this.practice = true;
	this.count = 0;
	this.ACC = 0;
	this.attempts = 0;
	this.trial_clock = trial_clock;
	this.diff = diff;

	this.check = function() {

		//determine whether to keep practicing...
		if (this.count >= 5) {
			var trial_clock = this.trial_clock;
			trial_clock.stop();
			this.diff.param_space.reset();

			//calculate practice accuracy
			p_acc = this.ACC / this.count;

			style = { "text-align": "center"};
			var p_fail = false;

			if (p_acc > .5) {
				this.practice = false;
				//reset acc, RT, and EZ list
				this.diff.grader.ACCs = [];
				this.diff.grader.RTs = [];
				this.diff.grader.Es = [];
				text = instructions['practice_success'];
			}
			else {
				this.attempts += 1;
				if (this.attempts >= 3) {
					text = instructions['practice_fail'];
					p_fail = true;

				} else {

					this.count = 0;
					this.ACC = 0;
					this.practice = true;
					text = instructions['practice_again'];

				}

			}
			var prac_text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, text, style)
    	//ain't nothin' but a scope thing
    	var trial_clock = this.trial_clock;

    	if (p_fail == false) {
				space = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
				space.onDown.add(function () {trial_clock.reset(); })
				prac_text.bind('KeyDown', function(e) {
					if (e.key == Crafty.keys.SPACE) {trial_clock.reset(); trial_clock.go(); Crafty.background("#FFF"); prac_text.destroy(); }
				});
			}
		} else {this.trial_clock.go();}


	}

}
