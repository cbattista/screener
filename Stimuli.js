//Stimuli.js
//Cookin' up some standard experimental stimuli in Phaser.js

function text_button(game, scope, onclick, x, y, text, text_attrib) {
  //make a button
  var b = game.add.button(x, y, '', onclick, scope);
  var text = game.add.text(0,0, text, text_attrib);

  b.addChild(text);
  b.anchor.set(0.5, 0.5);
  return b;
}
