

Practice = function(trial_clock, diff, game) {
	this.practice = true;
	this.count = 0;
	this.ACC = 0;
	this.attempts = 0;
	this.trial_clock = trial_clock;
	this.diff = diff;
	this.game = game;

	instructions = {};
	instructions['practice'] = "Let's try some practice.\n\nPress SPACEBAR to practice."
	instructions['practice_again'] = "Let's try a little more practice.\n\nPress SPACEBAR to practice some more."
	instructions['practice_success'] = "Great job!  Now let's play for real!\n\nPress SPACEBAR to continue."
	instructions['practice_fail'] = "Looks like you're having trouble, and that's no fun.\n\nPress SPACEBAR to move on to the next experiment."

	this.instructions = instructions;

	//this.fb = feedback(screen);

	this.check = function() {
		//this.fb.visible = false;
		this.count += 1;
		this.ACC += this.ACC + this.diff.grader.ACC;

		//determine whether to keep practicing...
		if (this.count >= 5) {
			var trial_clock = this.trial_clock;
			trial_clock.stop();
			this.diff.param_space.reset();

			//calculate practice accuracy
			p_acc = this.ACC / this.count;
			this.count = 0;
			style = { "text-align": "center", "fill": "#FFF"};
			var p_fail = false;

			if (p_acc > .5) {
				this.practice = false;
				//reset acc, RT, and EZ list
				text = this.instructions['practice_success'];
			}
			else {
				this.attempts += 1;
				if (this.attempts >= 3) {
					text = this.instructions['practice_fail'];
					p_fail = true;
				}

				else {
					this.count = 0;
					this.ACC = 0;
					this.practice = true;
					text = this.instructions['practice_again'];
				}
			}
			this.prac_text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, text, text_style);
			this.prac_text.anchor.x=0.5;
			this.prac_text.anchor.y=0.5;
			instructions.wordWrap = true;
			instructions.wordWrapWidth = window.innerWidth - 400;
    	//ain't nothin' but a scope thing
    	var trial_clock = this.trial_clock;
			space = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    	if (p_fail == false) {
				space.onDown.add(function () {
					this.diff.grader.Es = [];
					trial_clock.reset();
					trial_clock.go();
					this.prac_text.kill();
				}, this);

			} else {
				span.onDown.add(function(e) {
          if (e.key == Crafty.keys.SPACE) {
						this.trial_clock.signal.dispatch('end_task');
          }
        });
      }
		} else {this.trial_clock.go();}

	}

}
