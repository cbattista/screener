Game.NonSymbolic = function (game) {

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

Game.NonSymbolic.prototype = {

		create: function() {
			//set up the timing
			this.game.time.advancedTiming = true;
			this.fps = this.game.time.desiredFps;

			//MAKE THE TRIAL CLOCK
			durations = [0.5 * this.fps, 0.75 * this.fps, 2 * this.fps];
			this.trial_clock = new TrialClock(this, durations,
																				['ISI', 'fixation', 'stimulus']);

			//MAKE THE STIMULI
			var text_attrib = {font:'64px Arial', fill:'#FFFFFF', align:'center'};
			//create the numbers and fixation cross
			this.ns = ['N1', 'N2']; //just placeholder values

			//calculate where to add graphics
			x = this.game.world.bounds.width;
			y = this.game.world.bounds.height;

			dot_width = 700;

			x_offs = (x - 700) / 4;
			y_offs = (y - 600) / 2;
			// adds graphics to prep for circle
			var n1 = this.game.add.sprite(x_offs, y_offs);
			var n2 = this.game.add.sprite(this.game.world.centerX + x_offs, y_offs);
			n1.addChild(this.game.add.graphics(0, 0));
			n2.addChild(this.game.add.graphics(0, 0));

			// color of circle
			n1.children[0].beginFill(0xF80A6, 1);
			n2.children[0].beginFill(0xF80A6, 1);

			var cross = this.game.add.text(this.game.world.centerX,
									this.game.world.centerY, '*', text_attrib);

			cross.anchor.set(0.5, 0.5);

			//make everything invisible to start with
			n1.visible = false;
			n2.visible = false;
			cross.visible = false;

			//TOUCH EVENT HANDLERS - NOTE - EVENTS WILL GET BOUND DUUING STIMULUS CREATION
			n1.inputEnabled = true;
			n2.inputEnabled = true;

			//KB EVENT HANDLERS (F and J) - NOTE - EVENTS WILL GET BOUND DURING STIMULUS CREATION
			var F = this.game.input.keyboard.addKey(Phaser.KeyCode.F);
			var J = this.game.input.keyboard.addKey(Phaser.KeyCode.J);

			//trust me you will want these for debugging
			var pause = this.game.input.keyboard.addKey(Phaser.KeyCode.ESC);
			pause.onDown.add(function () {this.game.pause = true; alert('pause');}, this);

			//CREATE TRIAL DATA LOGGER
			this.state = 'instructions';
			this.logger = new Logger('nonsymbolic', this);

			//CREATE ADAPTIVE DIFFICULTY MANAGER
			names = ['number_size', 'ratio'];
			params = [];
			params[0] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,
									24,25]; //number size
			params[1] = [0.25, 0.33, 0.5, 0.66, 0.75, 0.75, 0.9, 0.9]; //ratio
			//how to scale the difficulty
			search_params = [[-1, -1], //if incorrect
												[0.5, [2, 2]], //if easyness > 0.5
												[0.25, [1, 1]], //if easyness > .25
												[0.1, [1,-1]] //....
											];
			this.grader = new Grader(this, 5, 1.5 * 1000);
			this.difficulty = new Difficulty(this, params, names, search_params);

			//CREATE STIMULUS ATTRIBUTE RANDOMIZER
			stimulus_attributes = {};
			stimulus_attributes['big_side'] = {'items': ['left', 'right'], 'repeats': 3};
			stimulus_attributes['i_or_c'] = {'items': ['i', 'c'], 'repeats':3}
			stimulus_attributes['example'] = {'items': [1,2,3,4], 'repeats':3}
			//attributes['con'] = ['con', 'incon', 3];
			this.stimulus = new Randomizer(stimulus_attributes);

			//CREATE PRACTICE MANAGER
			this.practice = new Practice(this);

			if (this.mobile == true) {
				right_ans = 'touch the right side of the screen'
				left_ans = 'touch the left side of the screen'
			} else {
				right_ans = 'press the J key'
				left_ans = 'press the F key'
			}

			ins_text = ["Which has more?  If there's more dots on the left " + left_ans + ", but if there's more dots on the right, " + right_ans + ".",
											"Here, there's more dots on the right, so " + right_ans + ".",
											"Here, there's more dots on the left, so " + left_ans + "."]

			//stimuli to display during the instructions...
			ins_params = [{'ns': [1, 3], 'CRESP': 'right'},
										{'ns': [5, 2], 'CRESP': 'left'}];

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
					//ACTIVATE EVENT HANDLERS
					n1.events.onInputDown.addOnce(this.n1_down, this);
					n2.events.onInputDown.addOnce(this.n2_down, this);
					F.onDown.addOnce(this.n1_down, this); //TODO - make these one-shots to avoid button mashing
					J.onDown.addOnce(this.n2_down, this);


					var ivc = this.stimulus.next('i_or_c');
					var example = this.stimulus.next('example');
					c1 = this.ns[0] + ivc + example;
					c2 = this.ns[1] + ivc + example;

					this.genCircle(n1.children[0], c1);
					this.genCircle(n2.children[0], c2);

					n1.visible = true;
					n2.visible = true;
					cross.visible = false;
					//starting RT
					d = new Date();
					this.start = d.getTime();
				}

				else if (arguments[0] == 'fixation') {
					n1.visible = false;
					n2.visible = false;
					cross.visible = true;
				}
				//Mandatory
				else if (arguments[0] == 'ISI') {
					n1.visible = false;
					n2.visible = false;
					cross.visible = false;

					//draw rectangles over the dots
					n1.children[0].beginFill(0x00000, 1);
					n2.children[0].beginFill(0x00000, 1);
					n1.children[0].drawRect(0,0,350,600);
					n2.children[0].drawRect(0,0,350,600);
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
		n1_down: function () {
			this.response('left');
		},

		n2_down: function () {
			this.response('right');
		},

		generate: function () {
				//determine what the stimuli for a given trial should be
				n1 = this.difficulty.param_space.get(0);
				n2 = n1 / this.difficulty.param_space.get(1);
				n2 = Math.round(n2);

				//avoid repeating the same numbers
				if (this.lastN1 == n1) {
					n1 += 2;
				}
				if (this.lastN2 == n2) {
					n2 += 5;
				}
				//avoid ties
				if (n1 == n2) {
					n2 += 1;
				}

				//check for proper size ordering
				MIN = Math.min(n1, n2);
				MAX = Math.max(n1, n2);
				n1 = MIN;
				n2 = MAX;
				this.lastN1 = n1;
				this.lastN2 = n2;

				//determine which side the big number should be on
				side = this.stimulus.next('big_side');
				this.CRESP = side;
				if (side == "right") {
					this.ns = [n1, n2];
				}
				else {
					this.ns = [n2, n1];
				}

				this.logger.inputData('n1', n1);
				this.logger.inputData('n2', n2);

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

		},

		// draw circle function
		genCircle: function(graphics, k){
			graphics.lineStyle(5, 0x222222, 1);
			graphics.drawRect(0, 0, 350, 600);
			graphics.lineStyle(0, 0x000000, 1);
			graphics.beginFill(0xF80A6, 1);
			circles = c[k];
			for (i=0;i<circles.length;i++){
				graphics.drawCircle( (circles[i][0]/2) , (circles[i][1]/2) , (circles[i][2]) );
			}
		}
}
