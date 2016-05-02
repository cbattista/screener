//Copyright 2016 Christian Battista, PhD
//Stanford Cognitive and Systems Neuroscience Lab

//UTILITY FUNCTIONS
function makeSVG(circles){
	output = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"350\" height=\"600\">";
	for (i=0;i<circles.length;i++)  {
		output += "<circle cx=" + circles[i][0]/2 + " cy=" + circles[i][1]/2 + " r=" + circles[i][2]/2 + " fill=blue />";
	}
	output += "</svg>";
	return output;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function jsonToHTML(data) {
	output = "";
	for (var key in data) {
		output += key + ": " + data[key] + "<br/>";
	}
	return output;
}

function clamp(value, mi, ma) {
	if ((value >= mi) && (value >= ma)) {
		return value;
	}
	else {
		return Math.floor((Math.random()* ma)+1);
	}

}

function range(i) {
	var r = Array.apply(null, Array(i)).map(function (_, i) {return i;});;
	return r;
}

//EXPERIMENT FUNCTIONS
Grader = function(streak_length, max_value){
	this.max_value = max_value;
  this.Es = [];
  this.signal = new Phaser.Signal();
	this.streak_length= streak_length;

  this.grade = function(user_resp, CRESP, RT) {
    if (user_resp == CRESP) {
      ACC = 1;
    }
    else {ACC = 0}

    this.easyness = ACC - (RT / this.max_value);
    this.Es.push(this.easyness);
    l = this.Es.length;
    streak_sum = 0;
    for (var i=1; i<= this.streak_length; i++) {
      streak_sum += this.Es[l - i];
    }
    this.streak = streak_sum / this.streak_length;
    this.signal.dispatch("grade");
    debug = RT + " " + ACC + " " + this.easyness + " " + this.streak;
    //console.log(debug);
  }
};

Practice = function(trial_clock, difficulty) {
	this.practice = true;
	this.count = 0;
	this.ACC = 0;
	this.attempts = 0;
	this.trial_clock = trial_clock;
	this.diff = difficulty;

	this.check = function() {

		//determine whether to keep practicing...
		if (this.count >= 5) {
			var trial_clock = this.trial_clock;
			trial_clock.stop();
			this.diff.param_space.reset();

			//calculate practice accuracy
			p_acc = this.ACC / this.count;

			css = { "text-align": "center"};
			var p_fail = false;

			if (p_acc > 0.5) {
				this.practice = false;
				//reset acc, RT, and EZ list
				this.diff.grader.ACCs = [];
				this.diff.grader.RTs = [];
				this.diff.grader.Es = [];
				text = instructions['practice_success'];
			}
			else {
				this.attempts += 1;
				if (this.attempts >= 3) {
					text = instructions['practice_fail'];
					p_fail = true;

				} else {

					this.count = 0;
					this.ACC = 0;
					this.practice = true;
					text = instructions['practice_again'];

				}

			}

			var prac_text = Crafty.e("2D, DOM, Text").text(text).attr({x: screen.mid[0]-200, y: screen.mid[1]-100, w:400, h:200})
		  						.textFont({size: '20px'})
	      						.css({"text-align": "center"})
	      						.textColor("#FFFFFF");

	      	//ain't nothin' but a scope thing
	      	var trial_clock = this.trial_clock;

	      	if (p_fail == false) {
				prac_text.bind('KeyDown', function(e) {
					if (e.key == Crafty.keys.SPACE) {trial_clock.reset(); trial_clock.go(); Crafty.background("#FFF"); prac_text.destroy(); }
				});
			}
		} else {this.trial_clock.go();}


	}

}

Stimulus = function(attrib) {
  this.givers = {};
  for (var key in attrib) {
    this.givers[key] = new GiveItems(attrib[key]['items'], attrib[key]['repeats']);
  }
  this.next = function(key) {
    //console.log(key);
    //console.log(this.givers);
    value = this.givers[key].next();
    return value;
  }

};

GiveItems = function(items, maxRepeats) {
	this.items = items;
	this.len = items.length;
	this.maxRepeats = maxRepeats;
	this.last = false;
	this.repeats = 0;

	this.next = function () {
		//select an item
		i = Math.floor((Math.random()*this.len)+1);
		item = this.items[i-1];

		//see if it repeats
		if (item == this.last) {
			this.repeats += 1;
		}
		else {
			this.repeats = 0;
		}

		//now check to see if it's acceptable
		if (this.repeats < this.maxRepeats) {
			this.last = item;
		}
		else {
			this.repeats -= 1;
			item = this.next();
			this.last = item;
		}

		return(this.last);
	};

};

Param_Space = function(params, signal) {
	this.params = params;
	this.stuck = false;
	//initialize indexes
	this.indexes = [];
	items = [];

	for (var i=0; i<params.length; i++) {
		this.indexes[i] = 0;
		items.push(i);
	}

	//create a give_items objects
	this.give_diff = new GiveItems(items, 2);
	this.signal = signal;

	this.normed_indexes = function () {
		ni = [];
		for (var i=0; i<params.length; i++) {
			j = this.indexes[i] / (this.params[i].length-1);
			ni.push(j);
		}

		return ni;
	}

	this.adjust = function (increments, random) {
		console.log(increments);
		//if we have an increment for each parameter
		//adjust them all
		if (increments.length == this.params.length) {
			//determine whether we want to retain the order
			for (var i=0; i<this.params.length; i++) {
				if (random == true) {
					this.indexes[this.give_diff.next()] += increments[i];
				} else {
					this.indexes[i] += increments[i];
				}
			}

		}

		//otherwise, use give_diff to select which params(s)
		//to adjust
		else {
			for (var i=0; i<increments.length; i++) {
				this.indexes[this.give_diff.next()] += increments[i];
			}
		}

		//now check this indexes
		this.check_indexes();
	}

	this.search = function () {
		if (this.new_xs.length > 1 && this.new_ys.length > 1) {
			//$('#console').html(this.new_xs[0] + " " + this.new_ys[1]);
			this.indexes[0] = this.new_xs.shift();
			this.indexes[1] = this.new_ys.shift();
			if (this.indexes.length == 3) {
				this.indexes[2] = this.new_zs.shift();

			}
		}
		else {
			this.signal.dispatch('end_task');
		}

		this.check_indexes();
	}

	this.check_indexes = function () {
		//ensure that the indexes have not passed into illegal values
		maxed_sum = 0;

		for (var i=0; i<this.params.length; i++) {
			//hold at max if too high
			if (this.indexes[i] > this.params[i].length - 1) {
				this.indexes[i] = this.params[i].length - 1;
				maxed_sum += 1;
			}

			//increase to 0 if too low
			if (this.indexes[i] < 0) {
				this.indexes[i] = 0;
			}
		}

		//if all params are maxed, call this the sticking point
		//$('#console').html(maxed_sum + ' ' + this.indexes.length);

		if (this.stuck==true) {
			//
		}
		else {
			if (maxed_sum == this.indexes.length) {
				this.sticking_point();
			}
		}

	}

	this.sticking_point = function() {
		this.stuck = true;

		this.new_xs = [];
		this.new_ys = [];
		this.new_zs = [];

		if (this.indexes.length == 2) {
			this.make_square();
		}
		else if (this.indexes.length == 3) {
			this.make_cube();
		}
		else {
			$('#console').html('Too many difficulty dimensions');
		}

		this.search();

	}

	this.make_cube = function () {
		//make a cube around the sticking point
		x = this.indexes[0];
		y = this.indexes[1];
		z = this.indexes[2];

		//front right
		this.new_xs.push(x + 1);
		this.new_ys.push(y + 1);
		this.new_zs.push(z + 1);
		this.new_xs.push(x + 1);
		this.new_ys.push(y);
		this.new_zs.push(z + 1);
		this.new_xs.push(x + 1);
		this.new_ys.push(y-1);
		this.new_zs.push(z + 1);

		//mid right
		this.new_xs.push(x + 1);
		this.new_ys.push(y + 1);
		this.new_zs.push(z);
		this.new_xs.push(x + 1);
		this.new_ys.push(y);
		this.new_zs.push(z);
		this.new_xs.push(x + 1);
		this.new_ys.push(y-1);
		this.new_zs.push(z);

		//back right
		this.new_xs.push(x + 1);
		this.new_ys.push(y + 1);
		this.new_zs.push(z - 1);
		this.new_xs.push(x + 1);
		this.new_ys.push(y);
		this.new_zs.push(z - 1);
		this.new_xs.push(x + 1);
		this.new_ys.push(y-1);
		this.new_zs.push(z - 1);

		//front left
		this.new_xs.push(x - 1);
		this.new_ys.push(y + 1);
		this.new_zs.push(z + 1);
		this.new_xs.push(x - 1);
		this.new_ys.push(y);
		this.new_zs.push(z + 1);
		this.new_xs.push(x - 1);
		this.new_ys.push(y-1);
		this.new_zs.push(z + 1);

		//mid left
		this.new_xs.push(x - 1);
		this.new_ys.push(y + 1);
		this.new_zs.push(z);
		this.new_xs.push(x - 1);
		this.new_ys.push(y);
		this.new_zs.push(z);
		this.new_xs.push(x - 1);
		this.new_ys.push(y-1);
		this.new_zs.push(z);

		//back left
		this.new_xs.push(x - 1);
		this.new_ys.push(y + 1);
		this.new_zs.push(z - 1);
		this.new_xs.push(x - 1);
		this.new_ys.push(y);
		this.new_zs.push(z - 1);
		this.new_xs.push(x - 1);
		this.new_ys.push(y-1);
		this.new_zs.push(z - 1);


		//front mid
		this.new_xs.push(x);
		this.new_ys.push(y + 1);
		this.new_zs.push(z + 1);
		this.new_xs.push(x);
		this.new_ys.push(y);
		this.new_zs.push(z + 1);
		this.new_xs.push(x);
		this.new_ys.push(y-1);
		this.new_zs.push(z + 1);

		//mid mid
		this.new_xs.push(x);
		this.new_ys.push(y + 1);
		this.new_zs.push(z);
		this.new_xs.push(x);
		this.new_ys.push(y-1);
		this.new_zs.push(z);

		//back mid
		this.new_xs.push(x);
		this.new_ys.push(y + 1);
		this.new_zs.push(z - 1);
		this.new_xs.push(x);
		this.new_ys.push(y);
		this.new_zs.push(z - 1);
		this.new_xs.push(x);
		this.new_ys.push(y-1);
		this.new_zs.push(z - 1);



	}

	this.make_square = function () {
		//make a square around the sticking point
		x = this.indexes[0];
		y = this.indexes[1];

		//right
		this.new_xs.push(x + 1);
		this.new_ys.push(y + 1);
		this.new_xs.push(x + 1);
		this.new_ys.push(y);
		this.new_xs.push(x + 1);
		this.new_ys.push(y - 1);

		//center
		this.new_xs.push(x);
		this.new_ys.push(y + 1);
		this.new_xs.push(x);
		this.new_ys.push(y - 1);

		//left
		this.new_xs.push(x-1);
		this.new_ys.push(y + 1);
		this.new_xs.push(x-1);
		this.new_ys.push(y);
		this.new_xs.push(x-1);
		this.new_ys.push(y - 1);

	}

	this.make_lines = function() {

		//find slope of difficulty line
		m = this.indexes[1] / this.indexes[0];

		//draw new set of points, one above and one below difficulty line
		for (var x = this.indexes[0] + 1; x >= 0; x--) {
			this.new_xs.push(x);
			this.new_ys.push(Math.round(m * x) + 1);
			this.new_xs.push(x);
			this.new_ys.push(Math.round(m * x) - 1);
		}

	}

	this.get = function (p) {
		index = this.indexes[p];
		return this.params[p][Math.round(index)];
	}

	this.reset = function () {
		for (var i=0; i<this.params.length; i++) {
			this.indexes[i] = 0;
		}
	}
};

Difficulty = function(params, grader, search_params, signal) {
  this.param_space = new Param_Space(params, signal);
	this.grader = grader;
	this.search_params = search_params;
  this.adjust = function(){
    easyness = this.grader.easyness;

    //if we have already found the sticking point
    if (this.param_space.stuck == true) {
      this.param_space.search();
    }
    else {
      //sticking point?
      if (this.grader.streak < 0) {
        this.param_space.sticking_point();
      }

      //otherwise
      else {
        //first check accuracy
        if (easyness < 0 ) {
          this.param_space.adjust(this.search_params[0]);
        } else {
          if (easyness > this.search_params[1][0]) {
            this.param_space.adjust(this.search_params[1][1]);
          } else if (easyness > this.search_params[2][0]) {
              this.param_space.adjust(this.search_params[2][1]);
          }
          else if (easyness > this.search_params[3][0]) {
            //just hang out in this space...
            this.param_space.adjust(this.search_params[3][1], true);
          } else {
            this.param_space.adjust([-1, -1]);
          }

        }
      }
    }
  }
};
