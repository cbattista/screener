Game.Symbolic = function (game) {

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

  };

Game.Symbolic.prototype = {

    create: function() {

      //CREATE TRIAL DATA LOGGER
      this.state = 'instructions';
      this.logger = new Logger('symbolic', this);

      //set up the timing
      this.game.time.advancedTiming = true;
      this.fps = this.game.time.desiredFps;

      //MAKE THE TRIAL CLOCK
      durations = [0.5 * this.fps, 0.75 * this.fps, 1.5 * this.fps];
      this.trial_clock = new TrialClock(this, durations,
                                        ['ISI', 'fixation', 'stimulus']);

      //MAKE THE STIMULI
      var text_attrib = {font:'90px Arial', fill:'#FFFFFF', align:'center'};
      //create the numbers and fixation cross
      this.ns = ['N1', 'N2']; //just placeholder values
      var n1 = text_button(this.game, this, this.n1_down,
                      this.game.world.centerX - 200, this.game.world.centerY - 32,
                      this.ns[0], text_attrib);
      var n2 = text_button(this.game, this, this.n2_down,
                      this.game.world.centerX + 200, this.game.world.centerY - 32,
                      this.ns[1], text_attrib);
      var cross = this.game.add.text(this.game.world.centerX,
                  this.game.world.centerY, '*', text_attrib);
      cross.anchor.set(0.5, 0.5);

      //make everything invisible to start with
      n1.visible = false;
      n2.visible = false;
      cross.visible = false;

      //MAKE THE BUTTON HANDLERS (F and J)
      var F = this.game.input.keyboard.addKey(Phaser.KeyCode.F);
      var J = this.game.input.keyboard.addKey(Phaser.KeyCode.J);

      //trust me you will want these for debugging
      var pause = this.game.input.keyboard.addKey(Phaser.KeyCode.ESC);
      pause.onDown.add(function () {this.game.pause = true; alert('pause');}, this);

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
      //attributes['con'] = ['con', 'incon', 3];
      this.stimulus = new Randomizer(stimulus_attributes);


      if (this.mobile == true) {
				right_ans = 'touch the right side of the screen'
				left_ans = 'touch the left side of the screen'
			} else {
				right_ans = 'press the J key'
				left_ans = 'press the F key'
			}

			ins_text = ["Which is bigger?  If the bigger number is on the left " + left_ans + ", but if the bigger number is on the right, " + right_ans + ".",
											"Here, the bigger number is on the the right, so " + right_ans + ".",
											"Here, the bigger number is on the left, so " + left_ans + "."]

			//stimuli to display during the instructions...
			ins_params = [{'ns': [1, 3], 'CRESP': 'right'},
										{'ns': [5, 2], 'CRESP': 'left'}];

			//CREATE INSTRUCTIONS MANAGER
			this.instructions = new Instructions(ins_text, ins_params, this);

      //CREATE PRACTICE MANAGER
      this.practice = new Practice(this);

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
        else if (arguments[0] == 'stimulus') {
          F.onDown.addOnce(this.n1_down, this); //TODO - make these one-shots to avoid button mashing
          J.onDown.addOnce(this.n2_down, this);

          n1.children[0].setText(this.ns[0]); //TODO - make a proper extension of the button object
          n2.children[0].setText(this.ns[1]);
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
        else if (arguments[0] == 'ISI') {
          n1.visible = false;
          n2.visible = false;
          cross.visible = false;
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
    }
}
