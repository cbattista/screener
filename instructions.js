//instructions.js

Instructions = function (text, params, parent) {
  this.text = text;
  this.params = params;
  this.count = 0;
  this.parent = parent;
  this.complete = false;

  if (parent.mobile == true) {
    cont = 'press here to continue'
  } else {
    cont = 'press space to continue'
  }

  ins_style = {font:'24px Arial', fill:'#FFFFFF', align:'center', backgroundColor: 'rgba(0,0,0,0.5)'};

  this.ins_text = parent.game.add.text(parent.game.world.centerX, 50, text[0], ins_style);
  this.ins_text.anchor.x = 0.5;
  this.ins_text.wordWrap = true;
  this.ins_text.wordWrapWidth = window.innerWidth - 400;

  ins_style['backgroundColor'] = 'rgba(25, 25, 25, 1)';
  ins_style['font'] = '24px Arial';

  this.continue_button = text_button(parent.game, this, function () {this.next();},
                  parent.game.world.centerX, parent.game.world.centerY + 200,
                  cont, ins_style);

  this.space = this.parent.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
	this.space.onDown.addOnce(function() {this.next();}, this);

  this.next = function () {
    //hide initial text
    this.continue_button.destroy();

    //get the next stimulus params and set these properties
    trial_params = this.params[this.count];
    for (var k in trial_params) {
      //set the values of the trial parameters
      this.parent[k] = trial_params[k];
    }

    //clear the stimuli
    this.parent.signal.dispatch('ISI');
    //update the instructions label
    this.ins_text.setText(this.text[this.count + 1]);
    //show the stimuli
    this.parent.signal.dispatch('stimulus');

    this.count += 1;
    this.space.onDown.removeAll();
  };

  this.check = function () {
    //don't sum up the easyness
    this.parent.avg_easyness = undefined;

    //handle the appropriate behavior when in instructions mode
    if (this.continue() == false) {
      //mark the instructions as complete
      this.complete = true;
      if (this.parent.grader.ACC == 1) {
        //remove practice text
        this.ins_text.destroy();

        //clear ye stimuli
        this.ins_text.destroy();
        this.parent.signal.dispatch('ISI');
        //now, fire up practice...
        this.parent.practice.begin();
      } else {
        this.complete = false;
        this.incorrect();
      }

    } else {
      if (this.parent.grader.ACC == 1) {
        console.log('ins: correct!');
        if (this.continue() == true) {
          this.next();
        }
      } else {
        //TODO make the instruction text wiggle
        console.log('ins: incorrect!');
        this.incorrect();
      }
    }
  };

  this.incorrect = function () {
    //fun little animation to show they got it wrong...
    //this.parent.game.add.tween(this.ins_text).to({angle:2}, 100, Phaser.Easing.Cubic.InOut, true);



    t = this.parent.game.add.tween(this.ins_text);
    t.to({ x: this.ins_text.position.x + 5, angle:this.ins_text.angle + 5}, 150, function (k) {
                    return wiggle(k, .5, .5);
                  }, true, 0, 2);

     //t.start();

  };

  this.continue = function () {
      //check if we've completed the instructions
      if (this.params.length > this.count) {
        return true;
      } else {
        return false;
      }
    };

}

function wiggle(aProgress, aPeriod1, aPeriod2) {
    var current1 = aProgress * Math.PI * 2 * aPeriod1;
    var current2 = aProgress * (Math.PI * 2 * aPeriod2 + Math.PI / 2);

    return Math.sin(current1) * Math.cos(current2);
}
