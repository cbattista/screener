//instructions.js

Instructions = function (text, params, parent) {
  this.text = text;
  this.params = params;
  this.count = 0;
  this.parent = parent;
  this.instructions = true;

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

  var continue_button = text_button(parent.game, parent, function () {parent.signal.dispatch('instructions');},
                  parent.game.world.centerX, parent.game.world.centerY + 200,
                  cont, ins_style);


  this.next = function () {
    //hide initial text
    continue_button.destroy();

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

  this.continue = function () {
      //check if we've completed the instructions
      if (this.params.length > this.count) {
        return true;
      } else {
        return false;
      }
    }

  }

}
