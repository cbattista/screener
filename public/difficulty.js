//EXPERIMENT FUNCTIONS
Grader = function(parent, streak_length, max_value){
  this.Es = [];
  this.signal = new Phaser.Signal();
	this.streak_length= streak_length;
	this.parent = parent;
	this.streak = 'NaN';

	db_ref = firebase.database().ref("settings")
																.child(firebase.auth().currentUser.uid)
																.child(parent.task)
																.child("durations");

	db_ref.on('value', function(snapshot) {
			this.set_max_value(snapshot.val());
		}, function(error) {}, this);

	this.set_max_value = function (durations) {
		console.log(durations);
		this.max_value = durations['stimulus'] * 1000;
	}

  this.grade = function(user_resp, CRESP, RT) {
    if (user_resp == CRESP) {
      ACC = 1;
    }
    else {ACC = 0}

		this.ACC = ACC;

		//check for timeout
		if (RT != "NA") {
    	this.easyness = ACC - (RT / this.max_value);
		}
		else {
			this.easyness = -1;
		}
    this.Es.push(this.easyness);
    l = this.Es.length;
    streak_sum = 0;
    for (var i=1; i<= this.streak_length; i++) {
      streak_sum += this.Es[l - i];
    }

		if (this.Es.length >= this.streak_length) {
			this.streak = streak_sum / this.streak_length;
			this.parent.logger.inputData('avg_easyness', this.streak);
		}

		//log ye relevant data
		this.parent.logger.inputData('CRESP', CRESP);
		this.parent.logger.inputData('user_resp', user_resp);
		this.parent.logger.inputData('ACC', ACC);
		this.parent.logger.inputData('RT', RT);
		this.parent.logger.inputData('performance', this.easyness);
		this.parent.logger.inputData('practice', this.parent.practice.practice);
		this.parent.logger.inputData('mobile', this.parent.mobile);

    for (var i=0; i<this.parent.difficulty.param_space.params.length; i++) {
			ni = this.parent.difficulty.param_space.normed_indexes();
			//TODO log the normed index
			label = "diff" + (i + 1);
      this.parent.logger.inputData(label, ni[i]);
		}

		//log this trial's worth of data
		this.parent.logger.sendData(this.parent.trial_clock.trial);
    this.signal.dispatch("grade");  //TODO - do we even use this anymore?

    debug = RT + " " + ACC + " " + this.easyness + " " + this.streak;
    //console.log(debug);
  }
};

Param_Space = function(params, names, signal, logger, grader) {
	this.params = params;
	this.names = names;
	this.stuck = false;
	this.score = 0;
	this.logger = logger;
	this.grader = grader;
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
		//if we have an increment for each parameter
		//adjust them all

		random = true;

    console.log("adjusting with increments: " + increments);

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
    console.log("check indexes");

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

			//ni = this.normed_indexes();
			//TODO log the normed index
			//label = "diff" + (i + 1);
      //console.log(label + ": " + ni[i] + " " + i);
			//this.logger.inputData(label, ni[i]);
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

		ni = this.normed_indexes();
		if (this.indexes.length == 2) {
			//save the person's score
			this.score = (ni[0] + ni[1]) / 2;
			this.make_square();
		}
		else if (this.indexes.length == 3) {
			//save the person's score
			this.score = (ni[0] + ni[1] + ni[2]) / 3;
			this.make_cube();
		}
		else {
			$('#console').html('Too many difficulty dimensions');
			this.score = 'NA'
		}

		this.logger.log('summary', {'score' : this.score, 'ni': ni})

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
		value = this.params[p][Math.round(index)];
    console.log('diff index: ' + index)
		this.logger.inputData(this.names[p], value);
		return value;
	}

	this.reset = function () {
		this.grader.Es = [];
		for (var i=0; i<this.params.length; i++) {
			this.indexes[i] = 0;
		}
	}
};

Difficulty = function(parent, params, names, search_params, end) {
  this.param_space = new Param_Space(params, names, parent.signal, parent.logger, parent.grader);
	this.search_params = search_params;
	this.parent = parent;

  //do we want the fitter to end?
  this.end = end;
  this.adjust = function(){
    easyness = this.parent.grader.easyness;
		//easier to assume we are not stuck, can overwrite later
    console.log('difficulty.adjust');
		this.parent.logger.inputData('stuck', false);



    //if we have already found the sticking point
    if (this.param_space.stuck == true) {
      this.param_space.search();
			this.parent.logger.inputData('stuck', true);
    }
    else {
      //sticking point?
      console.log('streak: ' + this.parent.grader.streak);

      if (this.end == true) {

        //if we are checking to end the task
        if (this.parent.grader.streak < 0) {
          this.param_space.sticking_point();
          this.parent.logger.inputData('stuck', true);
          console.log('really struggling');
        }
      }

      //first check accuracy
      if (easyness < 0 ) {
        this.param_space.adjust(this.search_params[0]);
      }
			else {

				//if we are just practicing, do not increase the params by much
				if (this.parent.practice == true) {
					this.param_space.adjust([1,0]);
				}

				else {

					if (easyness > this.search_params[1][0]) {
            this.param_space.adjust(this.search_params[1][1]);
          }
					else if (easyness > this.search_params[2][0]) {
              this.param_space.adjust(this.search_params[2][1]);
          }
          else if (easyness > this.search_params[3][0]) {
            //just hang out in this space...
            this.param_space.adjust(this.search_params[3][1], true);
          }
					else {
            this.param_space.adjust([-1, -1]);
          }

				}

      }
    }
  }
};
