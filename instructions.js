//instructions.js

Instructions = function (text, params, parent) {
  this.text = text;
  this.params = params;
  this.count = 0;
  this.parent = parent;

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
  };

  this.check = function () {
    if (this.parent.grader.ACC == 1) {
      if (this.continue() == true) {
        this.next();
      }
      else {
        //show some text to the user and


        //this.parent.begin();
      }
    } else {
      //TODO make the instruction text wiggle
      this.incorrect();
    }

  };

  this.incorrect = function () {
    //fun little animation to show they got it wrong...
    //this.parent.game.add.tween(this.continue_button).to({angle:45}, 2400, Phaser.Easing.Cubic.In, true);
     //t = this.parent.game.add.tween(this.continue_button)
     //t.to( { alpha: 0.1 }, 2000, "Linear", true);
     //t.start();
  };

  this.continue = function () {
      //check if we've completed the instructions
      if (this.params.length > this.count) {
        return true;
      } else {
        //if we are done, we should destroy the instructions text
        this.ins_text.destroy();

        return false;
      }
    };

}
