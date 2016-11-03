//ordinality.js

Game.Ordinality = function (game) {

		"use strict"

		this.game     //  a reference to the currently running game (Phaser.Game)
		this.add       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
		this.camera    //  a reference to the game camera (Phaser.Camera)
		this.cache     //  the game cache (Phaser.Cache)
		this.input     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
		this.load      //  for preloading assets (Phaser.Loader)
		this.math      //  lots of useful common math operations (Phaser.Math)
		this.sound     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
		this.stage     //  the game stage (Phaser.Stage)
		this.time      //  the clock (Phaser.Time)
		this.tweens    //  the tween manager (Phaser.TweenManager)
		this.state     //  the state manager (Phaser.StateManager)
		this.world     //  the game world (Phaser.World)
		this.particles //  the particle manager (Phaser.Particles)
		this.physics   //  the physics manager (Phaser.Physics)
		this.rnd       //  the repeatable random number generator (Phaser.RandomDataGenerator)
		this.signal = new Phaser.Signal();
		this.mobile = window.mobileAndTabletcheck();
}

Game.Ordinality.prototype = {

		create: function() {
			//set up the timing
			this.game.time.advancedTiming = true;
			this.fps = this.game.time.desiredFps;

			//MAKE THE TRIAL CLOCK
			this.task = 'ordinality';
			this.trial_clock = new TrialClock(this);

			//MAKE THE STIMULI
			var text_attrib = {font:'90px Arial', fill:'#FFFFFF', align:'center'};
			var button_attrib = {font:'90px Arial', fill:'#FFFFFF', align:'center', backgroundColor:'#333333'};

      //create the numbers and fixation cross
			this.number_text = '1 2 3'; //just placeholder values
      this.ns = [1,2,3];

      x = game.world.height;
      y = game.world.width;

      yoffs = game.world.centerY + (y / 6)
      xoffs = x / 4

      //YES and NO BUTTONS
      if (this.mobile) {

        this.yes_button = text_button(this.game, this, this.yes_down,
                        this.game.world.centerX + xoffs, yoffs,
                        'YES', button_attrib);
				//this.yes_button.children[0].setTextBounds(0, 0, 100, 100)
        this.no_button = text_button(this.game, this, this.no_down,
                        this.game.world.centerX - xoffs, yoffs,
                        'NO ', button_attrib);
				//this.no_button.children[0].setTextBounds(0, 0, 100, 100);

				this.yes_button.visible = false;
	      this.no_button.visible = false;

      }


      //NUMBERS
      var numbers = this.game.add.text(this.game.world.centerX, this.game.world.centerY, this.ns, text_attrib)
      numbers.anchor.set(0.5, 0.5)

      numbers.visible = false;

			var cross = this.game.add.text(this.game.world.centerX,
									this.game.world.centerY, '*', text_attrib);

			cross.anchor.set(0.5, 0.5);

			cross.visible = false;

			//KB EVENT HANDLERS (F and J) - NOTE - EVENTS WILL GET BOUND DURING STIMULUS CREATION
			var F = this.game.input.keyboard.addKey(Phaser.KeyCode.F);
			var J = this.game.input.keyboard.addKey(Phaser.KeyCode.J);

			//trust me you will want these for debugging
			var pause = this.game.input.keyboard.addKey(Phaser.KeyCode.ESC);
			pause.onDown.add(function () {this.game.pause = true; alert('pause');}, this);

			//CREATE TRIAL DATA LOGGER
			this.state = 'instructions';
			this.logger = new Logger('ordinality', this);

      names = ['number_size', 'separation', 'amount']
			params = [];
			params[0] = [1,2,3,4,5,6]; //separations
			params[1] = [1,2,3,4,5,6,7,8,9,10]; //sizes
			params[2] = [3,4,5]; //amount of numbers

			//how to scale the difficulty
			search_params = [[-1, -1, -1], //if incorrect
												[0.5, [2, 1, 1]], //if easyness > 0.5
												[0.25, [1, 1, 1]], //if easyness > .25
												[0.1, [1, -1]]
											];
			this.grader = new Grader(this, 5);
			this.difficulty = new Difficulty(this, params, names, search_params);

			//CREATE STIMULUS ATTRIBUTE RANDOMIZER
			stimulus_attributes = {};
			stimulus_attributes['scramble'] = {'items': [true, false], 'repeats': 2};
			this.stimulus = new Randomizer(stimulus_attributes);

			//CREATE PRACTICE MANAGER
			this.practice = new Practice(this);

			if (this.mobile == true) {
				right_ans = 'press the YES button'
				left_ans = 'press the NO button'
			} else {
				right_ans = 'press the J key'
				left_ans = 'press the F key'
			}

			ins_text = ["Are they in order? If the numbers are going smallest to biggest, " + left_ans + ", otherwise, press, " + right_ans + ".",
											"Here, the numbers are going from smallest to biggest, so " + right_ans + ".",
											"These numbers out of order, so " + left_ans + ".",
                      "These the numbers are going from smallest to biggest, so " + right_ans + "."]

			//stimuli to display during the instructions...
			ins_params = [{'number_text': '1 2 3', 'CRESP': true},
										{'number_text': '2 1 3', 'CRESP': false},
                    {'number_text': '2 4 6', 'CRESP': true}];

			//CREATE INSTRUCTIONS MANAGER
			this.instructions = new Instructions(ins_text, ins_params, this);

			//EXPERIMENTAL LOGIC CONTROL
			this.signal.add(function () {
				if (arguments[0] == 'trial') {
					this.difficulty.adjust();
					if (this.practice.practice == true) {
						this.practice.check();
					}
					this.generate();
				}

				else if (arguments[0] == 'timeout') {
					//log the missing response
					this.grader.grade('NA', this.CRESP, 'NA');
				}

				//Mandatory
				else if (arguments[0] == 'stimulus') {
          numbers.setText(this.number_text);

					//ACTIVATE EVENT HANDLERS
					F.onDown.addOnce(this.no_down, this); //TODO - make these one-shots to avoid button mashing
					J.onDown.addOnce(this.yes_down, this);

          if (this.mobile == true) {
            this.yes_button.visible = true;
            this.no_button.visible = true;
          }

          numbers.visible = true;
					cross.visible = false;
					//starting RT
					d = new Date();
					this.start = d.getTime();
				}

				else if (arguments[0] == 'fixation') {
					numbers.visible = false;
					cross.visible = true;

          if (this.mobile == true) {
            this.yes_button.visible = false;
            this.no_button.visible = false;
          }
				}
				//Mandatory
				else if (arguments[0] == 'ISI') {
					numbers.visible = false;
					cross.visible = false;
          if (this.mobile == true) {
            this.yes_button.visible = false;
            this.no_button.visible = false;
          }
				}

				else if (arguments[0] == 'end_task') {
					this.trial_clock.stop();
					this.quitGame();
				}

			}, this);

		},

		begin: function () {
			//START IT UP!
			this.difficulty.param_space.reset();
			this.generate();
			this.trial_clock.go();
			this.trial_clock.next();
		},

		response: function (user_resp) {
			d = new Date();
			RT = d.getTime() - this.start ;
			this.grader.grade(user_resp, this.CRESP, RT);

			if (this.instructions.complete == true) {
				this.trial_clock.reset();
			}
			else {
				this.instructions.check();
			}
		},

		//click and button handlers
		no_down: function () {
			this.response(false);
		},

		yes_down: function () {
			this.response(true);
		},

		generate: function () {
      //come up with the numbers using sep, size, num
      var sep = this.difficulty.param_space.get(0);
      var size = this.difficulty.param_space.get(1);
      var amount = this.difficulty.param_space.get(2);

      this.logger.inputData('separation', sep);
      this.logger.inputData('size', size);
      this.logger.inputData('amount', amount);

      numbers = []
      stim_text = size;

      for (var i=0; i<amount; i++) {
        numbers.push(size + (sep * i));
      }

      orig_seq = JSON.parse(JSON.stringify(numbers));

      if (this.stimulus.next('scramble') == true){
        //
        shuffled = false;
        while(shuffled == false) {
          numbers = shuffle(numbers);
          if (orig_seq.sort().equals(numbers)) {
            shuffled = false;
          } else {shuffled = true;}
        }

        this.CRESP = false;
      }
      else {
        this.CRESP = true;
      }

      this.logger.inputData('CRESP'), this.CRESP;
      this.logger.inputData('numbers', numbers);

      number_text = numbers[0];
      for (var i=1; i<amount; i++) {
        number_text += "   " + numbers[i];
      }

      this.number_text = number_text;
      this.logger.inputData('stimulus', number_text);

		},

		is_touch_device: function() {
			return (('ontouchstart' in window)
				|| (navigator.MaxTouchPoints > 0)
				|| (navigator.msMaxTouchPoints > 0))
		},

		quitGame: function () {
				//TODO - put something here to let experiment factory know when to segue?
				d = new Date()
				endTime = d.getTime()

				//this.logger.downloadData();
				//Let them know it's done...
				this.game.time.events.add(Phaser.Timer.SECOND * 1.5, function () {
					next_task();
				}, this);
		},

		update: function() {
			this.trial_clock.update();
		},

		render: function () {
			//this will display the frame rate (should be 60...ish)
			this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
			//this.game.debug.text('trial: ' + this.trial_clock.trial, 2, 14, '#00ff00');

		}
}
