Game.Run = function (game) {

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

  };

Game.Run.prototype = {

    create: function() {
      //set up the timing
      this.game.time.advancedTiming = true;
      fps = this.game.time.desiredFps;
      durations = [0.5 * fps, 0.75 * fps, 1.5 * fps];
      this.signal = new Phaser.Signal();
      this.trial_clock = new TrialClock(durations,
                                        ['ISI', 'fixation', 'stimulus'],
                                        this.signal);

      this.phase = 'search';

      var text_attrib = {font:'64px Arial', fill:'#FFFFFF', align:'center'};

      this.ns = ['N1', 'N2'];

      //create the numbers
      var n1 = this.game.add.button(this.game.world.centerX - 200,
                                  this.game.world.centerY - 32, '', this.n1_down, this);
      var n2 = this.game.add.button(this.game.world.centerX + 200,
                                  this.game.world.centerY - 32, '', this.n2_down, this);

      var n1_text = this.game.add.text(0,0, this.ns[0], text_attrib);
      var n2_text = this.game.add.text(0,0, this.ns[1], text_attrib);

      n1.addChild(n1_text);
      n2.addChild(n2_text);

      n1.anchor.set(0.5, 0.5);
      n2.anchor.set(0.5, 0.5);

      //these are buttons, but let's also set a key handler (F and J)
      var F = this.game.input.keyboard.addKey(Phaser.KeyCode.F);
      var J = this.game.input.keyboard.addKey(Phaser.KeyCode.J);

      //TODO - make these one-shots to avoid button mashing
      F.onDown.add(this.n1_down, this);
      J.onDown.add(this.n2_down, this);


      //create the fixation cross
      var cross = this.game.add.text(this.game.world.centerX,
                  this.game.world.centerY, '*', text_attrib);
      cross.anchor.set(0.5, 0.5);

      n1.visible = false;
      n2.visible = false;
      cross.visible = false;

      //describe difficulty parameters
      params = [];
      params[0] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,
                  24,25]; //number size
      params[1] = [0.25, 0.33, 0.5, 0.66, 0.75, 0.75, 0.9, 0.9]; //ratio

      stimulus_attributes = {};
      stimulus_attributes['big_side'] = {'items': ['left', 'right'], 'repeats': 3};
      //attributes['con'] = ['con', 'incon', 3];

      //how to scale the difficulty
      search_params = [ [-1, -1], //if incorrect
                        [0.5, [2, 2]], //if easyness > 0.5
                        [0.25, [1, 1]], //if easyness > .25
                        [0.1, [1,-1]] //....
                      ];

      this.stimulus = new Stimulus(stimulus_attributes);
      this.grader = new Grader(5, 1.5 * 1000);
      this.difficulty = new Difficulty(params, this.grader, search_params, this.signal);
      this.difficulty.adjust();
      this.generate();
      this.practice = new Practice(this.trial_clock,  this.difficulty, this.game);

      //now bind the events
      this.trial_clock.signal.add(function () {
        if (arguments[0] == 'trial') {
          this.difficulty.adjust();
          this.generate();
          if (this.practice.practice == true) {
            this.practice.check();
          }
        }
        else if (arguments[0] == 'stimulus') {
          n1_text.setText(this.ns[0]);
          n2_text.setText(this.ns[1]);
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
          //put something here to let experiment factory know when to segue
        }

      }, this);

      this.trial_clock.go();
      this.trial_clock.next();


    },

    response: function (user_resp) {
      d = new Date();
      RT = d.getTime() - this.start ;
      this.grader.grade(user_resp, this.CRESP, RT);
      this.trial_clock.reset();
    },

    n1_down: function () {
      this.response('left');
    },

    n2_down: function () {
      this.response('right');
    },

    generate: function () {
        n1 = this.difficulty.param_space.get(0);
        n2 = n1 / this.difficulty.param_space.get(1);

        n2 = Math.round(n2);

        if (n1 == 0) {n1 = this.game.rnd.integerInRange(1, 20);}
        if (n2 == 0) {n2 = this.game.rnd.integerInRange(1, 20);}

        if (this.lastN1 == n1) {
          n1 += 2;
        }

        if (this.lastN2 == n2) {
          n2 += 5;
        }

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

        side = this.stimulus.next('big_side');
        this.CRESP = side;

        if (side == "right") {
          this.ns = [n1, n2];
        }
        else {
          this.ns = [n2, n1];

        }
    },

    is_touch_device: function() {
      return (('ontouchstart' in window)
        || (navigator.MaxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0))
    },

    quitGame: function () {
        d = new Date()
        endTime = d.getTime()

        that = this
        setTimeout(function() {
          that.game.world.remove(that.sumText)

        }, 1000)

        //Let them know it's done...
        this.game.time.events.add(Phaser.Timer.SECOND * 1.5, function () {
          endText = this.game.add.text(480, 100, 'All done!',
                                        {'font': '70px Arial', 'fill':'#fff'});
          endText.anchor.x = 0.5
        }, this);
    },

    update: function() {
      this.trial_clock.update();
      //console.log(this.trial_clock.frame);
    },

    render: function () {
      this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
    }
}
