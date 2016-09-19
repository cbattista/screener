//instructions.js

Instructions = function (text, params, parent) {
  this.text = text;
  this.params = params;
  this.count = 0;
  this.parent = parent;

  if (this.mobile == true) {
    cont = 'press here to continue'
  } else {
    cont = 'press space to continue'
  }

  var continue_button = text_button(parent.game, parent, function () {parent.signal.dispatch('instructions');},
                  parent.game.world.centerX, parent.game.world.centerY - 100,
                  cont, ins_style);

  this.ins_text = parent.game.add.text(parent.game.world.centerX, 50, text[0], ins_style);
  this.ins_text.anchor.x = 0.5;
  this.ins_text.wordWrap = true;
  this.ins_text.wordWrapWidth = window.innerWidth - 400;

  this.next = function () {
    //hide initial text
    this.ins_text.visible = false;

    //get the next stimulus params and set these properties
    trial_params = this.params[0];
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
  }

}
