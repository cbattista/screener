Practice = function(parent) {
	this.practice = true;
	this.count = 0;
	this.ACC = 0;
	this.attempts = 0;
	this.parent = parent;

	if (parent.mobile == true) {
		this.cont = 'press here to continue'
	} else {
		this.cont = 'press space to continue'
	}

	instructions = {};
	instructions['practice'] = "Great job!  Let's try some practice.  Things will go a little faster now..."
	instructions['practice_again'] = "Let's try a little more practice."
	instructions['practice_success'] = "Great job!  Now let's play for real!"
	instructions['practice_fail'] = "Looks like you're having trouble, and that's no fun."

	this.instructions = instructions;

	//feedback sprites
	this.correct = parent.game.add.sprite(parent.game.world.centerX, parent.game.world.centerY, 'correct');
	this.correct.anchor.x = 0.5;
	this.correct.anchor.y = 0.5;
	this.correct.visible = false;
	this.incorrect = parent.game.add.sprite(parent.game.world.centerX, parent.game.world.centerY, 'incorrect');
	this.incorrect.anchor.x = 0.5;
	this.incorrect.anchor.y = 0.5;
	this.incorrect.visible = false;

	this.begin = function() {
		//show the first practice instructions screen
		this.prac_text = this.parent.game.add.text(this.parent.game.world.centerX,
										this.parent.game.world.centerY-300, this.instructions['practice'], ins_style);

		this.prac_text.anchor.x = 0.5;

		this.continue_button = text_button(this.parent.game, this, this.on_continue,
														this.parent.game.world.centerX, this.parent.game.world.centerY,
														this.cont, ins_style)

		space = this.parent.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

		space.onDown.add(this.on_continue, this);

	};

	this.on_continue = function () {
		console.log(this);
		this.prac_text.destroy();
		this.continue_button.destroy();
		this.parent.begin();
	};

	//check accuracy of individual trial and give feedback
	this.check = function() {
		//we do this to suppress the easyness streak calculation
		//otherwise we may quit early if makes a lot of mistakes during practice
		this.parent.grader.Es = [];

		//this.fb.visible = false;
		this.count += 1;
		this.ACC += this.parent.grader.ACC;

		//provide the feedback
		if (this.parent.grader.ACC == 1) {
			this.correct.visible = true;
		}
		else {
			this.incorrect.visible = true;
		}

		//pause the clock for 400 ms
		this.parent.trial_clock.stop();

		this.parent.game.time.events.add(Phaser.Timer.SECOND * 0.4, function () {
			this.correct.visible = false;
			this.incorrect.visible = false;
			this.parent.trial_clock.go();
			this.check_complete();
		}, this)
	};

	//determine whether to keep practicing...
	this.check_complete = function() {

		if (this.count >= 5) {
			this.parent.trial_clock.stop();

			//reset the grading system
			this.parent.difficulty.param_space.reset();

			//calculate practice accuracy
			p_acc = this.ACC / this.count;
			this.count = 0;
			var p_fail = false;

			if (p_acc >= 0.8) {
				this.practice = false;
				//reset acc, RT, and EZ list
				text = this.instructions['practice_success'];
				this.parent.state = 'exp'
				p_fail = false;
			}
			else {
				this.attempts += 1;
				console.log(this.parent.state);

				if (this.attempts >= 3) {
					text = this.instructions['practice_fail'];
					p_fail = true;
				}

				else {
					this.count = 0; //TODO - keep trial counter from incrementing
					this.ACC = 0;
					this.practice = true;
					text = this.instructions['practice_again'];
					this.parent.state = 'practice_' + this.attempts;
					//update the game state to reflect practice being repeated

				}
			}

			this.prac_text = this.parent.game.add.text(this.parent.game.world.centerX,
																								 this.parent.game.world.centerY - 300,
																								 text, ins_style);
			this.prac_text.anchor.x=0.5;
			this.prac_text.anchor.y=0.5;
			instructions.wordWrap = true;
			instructions.wordWrapWidth = window.innerWidth - 400;

			space = this.parent.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    	if (p_fail == false) {
				space.onDown.addOnce(this.pass_function, this);
				this.continue_button = text_button(this.parent.game, this, this.pass_function,
																this.parent.game.world.centerX, this.parent.game.world.centerY,
																this.cont, ins_style);

			} else {
				space.onDown.addOnce(this.fail_function, this.parent);
				this.continue_button = text_button(this.parent.game, this.parent, this.fail_function,
																this.parent.game.world.centerX, this.parent.game.world.centerY,
																this.cont, ins_style);


      }
		}
		//do another practice trial...
		else {
			this.parent.trial_clock.go();
		}

	};

	this.pass_function = function () {
		this.prac_text.kill();
		this.continue_button.kill();
		this.parent.trial_clock.restart();
	};

	this.fail_function = function () {
			//this.prac_text.kill();
			//this.continue_button.kill();
			this.parent.signal.dispatch('end_task');

	};

}
