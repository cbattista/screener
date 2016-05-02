// creating dependencies related to problems for all games

range = function(start, count) {
    return Array.apply(0, Array(count))
                .map(function (element, index) {
                         return index + start
                     })
}

problemGen = function(problem_set) {

  nProbs = 13

  if (problem_set == "A") {
    op1_full = [4,5,6,6,5,7,7,9,8,8,9,9,14,15,16,16,15,17,12,12,12,13,14,13,17,19,18,18,19,19,15,14,15,16,16,17,2,2,2,3,4,3,5,4,5,6,6,7,2,2,2,3,4,3,4,5,6,6,5,7,5,4,5,6,6,7,7,9,8,8,9,9]
    op2_full = [2,2,2,3,4,3,5,4,5,6,6,7,2,2,2,3,4,3,4,5,6,6,5,7,5,4,5,6,6,7,7,9,8,8,9,9,4,5,6,6,5,7,7,9,8,8,9,9,14,15,16,16,15,17,12,12,12,13,14,13,17,19,18,18,19,19,15,14,15,16,16,17]
  } else {
    op1_full = [2,3,3,2,2,4,3,4,6,5,7,8,2,3,3,2,2,4,3,4,5,7,8,6,3,4,6,5,7,8,9,8,7,9,8,9,3,4,5,7,8,6,9,8,7,9,8,9,13,14,15,17,18,16,12,13,13,12,12,14,19,18,17,19,18,19,13,14,16,15,17,18]
    op2_full = [3,4,5,7,8,6,9,8,7,9,8,9,13,14,15,17,18,16,12,13,13,12,12,14,19,18,17,19,18,19,13,14,16,15,17,18,2,3,3,2,2,4,3,4,6,5,7,8,2,3,3,2,2,4,3,4,5,7,8,6,3,4,6,5,7,8,9,8,7,9,8,9]
  }

  problem_id = range(1,op1_full.length)

  op1s = []
  op2s = []
  ids = []
  for (i=0; i < nProbs; i++) {

    //op1s.push(op1_full[Math.floor(Math.random()*op1_full.length)])
    //op2s.push(op2_full[Math.floor(Math.random()*op2_full.length)])
    //ids.push(problem_id[Math.floor(Math.random()*problem_id.length)])
    op1s.push(op1_full[i])
    op2s.push(op2_full[i])
    ids.push(problem_id[i])
  }
  op1s, op2s, ids = shuffle(op1s, op2s, ids)

  return [problem_set, op1s, op2s, ids]
}

//shuffle matched operands using Fisher-Yates shuffle
function shuffle(array1, array2, array3) {
  var currInd = array1.length, tempVal1, tempVal2, tempVal3, randInd
  while (0 != currInd) {
    randInd = Math.floor(Math.random() * currInd)
    currInd -= 1
    tempVal1 = array1[currInd]
    tempVal2 = array2[currInd]
    tempVal3 = array3[currInd]
    array1[currInd] = array1[randInd]
    array2[currInd] = array2[randInd]
    array3[currInd] = array3[randInd]
    array1[randInd] = tempVal1
    array2[randInd] = tempVal2
    array3[randInd] = tempVal3
  }
  return array1, array2, array3
}

//for verification tasks
equivalenceGen = function(double) {
  maxRepeats = 2
  repeats = 0
  last = false

  if (double) {
    genNum = (op1s.length * 2)
  } else {
    genNum = op1s.length
  }

  this.reGen = function() {
    item = Math.floor(Math.random() * 2) + 1

    if (item == last) {
      repeats += 1
    } else {
      repeats = 0
    }

    if (repeats < maxRepeats) {
      last = item
    } else {
      repeats -= 1
      item = this.reGen()
      last = item
    }
    return last
  }

  equivalence = []
  for (i=0; i < genNum; i++) {
    equivalence[i] = reGen()
  }

  return equivalence
}

createOffset = function(sum) {
  offsets = [1, 2, 3, 4, 5]

  if (sum  < 9) {
    probability = [0.4, 0.8, 0.9, 1.0, 1.5]
  } else if (sum >= 10 || sum < 15) {
    probability = [0.3, 0.6, 0.8, 0.9, 1.0]
  } else if (sum >= 15 || sum < 19) {
    probability = [0.2, 0.4, 0.6, 0.8, 1.0]
  } else if (sum >= 20 || sum < 24) {
    probability = [0.1, 0.2, 0.4, 0.7, 1.0]
  } else {
    probability = [0, 0.1, 0.2, 0.6, 1.0]
  }

  choice = Math.random()
  if (choice <= probability[0]) {
    offset = offsets[0]
  } else if (choice <= probability[1]) {
    offset = offsets[1]
  } else if (choice <= probability[2]) {
    offset = offsets[2]
  } else if (choice <= probability[3]) {
    offset = offsets[3]
  } else if (choice <= probability[4]) {
    offset = offsets[4]
  }
  return offset
}


unequalGen = function(equal, sum, op1, op2) {
  offset = createOffset(sum)
  if (equal) {
    unequalVal = sum
  } else {
    if (sum <= offset) {
      floor = 1
    } else {
      floor = sum-offset
    }
    ceiling = sum+offset
    unequalVal = Math.floor(Math.random() * ceiling) + floor

    if (unequalVal == sum || unequalVal > ceiling || unequalVal == op1 || unequalVal == op2) {
      unequalGen(equal, sum)
    }
  }

  return unequalVal
}

HorizontalProblem = function (game, x, y) {
  problem = game.add.group();
  problem_style = { font: "80px Arial", fill: "#FFFFFF", align: "right" };
  problem.addChild(game.add.text(0, 120, ' ', problem_style));
  problem.addChild(game.add.text(160, 120, ' ', problem_style));
  problem.addChild(game.add.text(120, 120, '+', problem_style));
  problem.addChild(game.add.text(290, 120, '=', problem_style));
  this.response_box = game.add.bitmapData(0, 60);
  problem.addChild(game.add.sprite(300, 120, this.response_box));
  problem.addChild(game.add.text(410, 166, '', problem_style));
  problem.children[5].anchor.setTo(0.5)
  problem.x = x;
  problem.y = y;
  problem.alpha = 1;

  this.problem = problem;

  this.update = function () {
    //this.response_box.context.fillStyle = '#aaa';
    //this.response_box.context.fillRect(0, 0, 80, 60);

  }
}

function giveFeedback(game, ans, x, y, font) {
  d = new Date();
  fTime = d.getTime();
  correct_feedback = ['Way to go!','Awesome!','You Rock!','Correct!','Fantastic!','Nice!']
  //correct_colors = ['#FA790F','#ED2F2F','#18ED18','#FF57DD','#9039ED','#FFFF00']
  if (!ans) {
    disp = "Try Again!"
    disp_color = '#FFFFFF'
  } else {
    disp = correct_feedback[Math.floor(Math.random() * correct_feedback.length) + 0]
    disp_color = '#FFFFFF'
    //disp_color = correct_colors[Math.floor(Math.random() * correct_colors.length) + 1]
    //disp = "Correct!"
  }
  feedback = game.add.text(x, y, disp, {font: font, fill: disp_color, align: "center"})
  feedback.anchor.x = 0.5
  feedback.fixedToCamera = true;
  game.time.events.add(1000, function() {
    game.add.tween(feedback).to({alpha: 0}, 100, Phaser.Easing.Linear.None, true)
  }, this)
  return feedback
}

function makeKeypad(game, x, y, onPress, onSubmit, callbackContext) {
  //make keypad
  keypad = game.add.group();
  numbers = [1,2,3,4,5,6,7,8,9,0];
  for (i =0; i<numbers.length; i++) {
    row = Math.floor(i/ 3);
    button = game.add.button(i * 50 - (row * 50 * 3), row * 50, 'k' + numbers[i], callback=onPress, callbackContext);
    button.number = numbers[i];
    //button.addChild(game.add.text(10, 1, numbers[i], problem_style));
    keypad.addChild(button);
  }
  button = game.add.button(i * 50 - (row * 50 * 3), row * 50, 'delete', callback = onPress, callbackContext);
  button.number = '-';
  keypad.addChild(button);

  submit = game.add.button(75, 250, 'go', callback=onSubmit, callbackContext);
  submit.anchor.setTo(0.5);
  keypad.addChild(submit)

  keypad.x = x;
  keypad.y = y;

  return keypad;
}

function createStats (game, x, y) {
    stats_style = {font: "24px Arial", fill: "#FFFFFF", align: "center"}
    stats = game.add.group();
    stats.addChild(game.add.text(0, 0, 'Points:', stats_style));
    stats.addChild(game.add.text(76, 0, '0', stats_style));
    stats.addChild(game.add.text(0, 28, 'RT:', stats_style));
    stats.addChild(game.add.text(36, 28, '', stats_style));

    stats.points = 0;
    stats.RT = 'NA';
    stats.x = x;
    stats.y = y;

    stats.visible = false;

    return stats;
}

var PieProgress = function(game, x, y, radius, color, angle) {
    this._radius = radius;
    this._progress = 0;
    this.bmp = game.add.bitmapData(radius * 2, radius * 2);
    Phaser.Sprite.call(this, game, x, y, this.bmp);

    this.anchor.set(0.5);
    this.angle = angle || -90;
    this.color = color || "#fff";
    this.updateProgress();
}


PieProgress.prototype = Object.create(Phaser.Sprite.prototype);
PieProgress.prototype.constructor = PieProgress;
PieProgress.prototype.updateProgress = function() {
    var progress = this._progress;
    progress = Phaser.Math.clamp(progress, 0.00001, 0.99999);

    this.bmp.clear();
    this.bmp.ctx.fillStyle = this.color;
    this.bmp.ctx.beginPath();
    this.bmp.ctx.arc(this._radius, this._radius, this._radius, 0, (Math.PI * 2) * progress, true);
    this.bmp.ctx.lineTo(this._radius, this._radius);
    this.bmp.ctx.closePath();
    this.bmp.ctx.fill();
    this.bmp.dirty = true;
}

Object.defineProperty(PieProgress.prototype, 'radius', {
    get: function() {
        return this._radius;
    },
    set: function(val) {
        this._radius = (val > 0 ? val : 0);
        this.bmp.resize(this._radius * 2, this._radius * 2);
        this.updateProgress();
    }
});

Object.defineProperty(PieProgress.prototype, 'progress', {
    get: function() {
        return this._progress;
    },
    set: function(val) {
        this._progress = Phaser.Math.clamp(val, 0, 1);
        this.updateProgress();
    }
});
