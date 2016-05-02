//Copyright 2014 Christian Battista, PhD
//Stanford Cognitive and Systems Neuroscience Lab

window.onload = function() {

	var results = set_up_subject(mode);
	console.log(results);
	user = results[0];
	session = results[1];
	play = results[2];

	var subject = new Subject(user, mode, session, play);

	var screen = new Screen([1000, 600], [400, 80]);
	Crafty.init(screen.size[0], screen.size[1]);

	//create intro, outro
	createIntro(mode, screen.text_attr);
	createOutro(user, mode, play, screen.text_attr);

	//TASK
	Crafty.defineScene("task", function() {

		//change mouse pointer to blank
		$('#cr-stage').css("cursor", "none");
		//$('#cr-stage').css('cursor', 'crosshair');

		root_url = 'http://97.107.137.132:9494'
		//root_url = 'http://127.0.0.1:8080'

		Crafty.load({images:[root_url + "/images/correct.png", root_url + "/images/incorrect.png"]});

		var response_window = 2000;

		var trial_clock = Crafty.e("TrialClock").attr({durations:[50, 25, response_window / 1000 * 50], event_names:["ISI", "cross", "num"]});
		trial_clock.attr({max_trials:50});

		//initiate the search phase
		var phase = 'search';

		t = new Date();
		var task_start = t.getTime();
		var trial_start = t.getTime();
		var start_time = t.getTime();

		Crafty.background("#FFF");

		var text_attr = {size:'80px', weight: 'bold'};
		var css = {"text-align":"center"};

		var img1 = root_url + "/dots/stimuli/1_con_C1_1.svg";
		var img2 = root_url + "/dots/stimuli/2_con_C1_1.svg";

		pos1 = {x: screen.q1[0] - 75, y: screen.mid[1] - 50, w: 150, h: 100};
		pos2 = {x: screen.q2[0] - 75, y: screen.mid[1] - 50, w: 150, h: 100};

		if (mode == 'symbolic' || mode == 'stroop') {
			//create stimuli
			var N1 = make_text(pos1, text_attr, css, '');
			var N2 = make_text(pos2, text_attr, css, '');
		}
		else if (mode == 'nonsymbolic') {
			var N1 = Crafty.e("2D, DOM, HTML").replace(makeSVG(c["1c1"])).attr({x:100, y:0});
			var N2 = Crafty.e("2D, DOM, HTML").replace(makeSVG(c["2c1"])).attr({x:550, y:0});

			var divider = Crafty.e("2D, DOM, Color").attr({x:screen.mid[0], y:screen.mid[1]-300, w:1, h:600}).color('#000');
			divider.visible = false;
		}
		else if (mode == 'mixed') {
			var N1 = [];
			var N2 = [];

			N1[0] = make_text(pos1, text_attr, css, '');
			//N1[1] = Crafty.e("2D, DOM, Image").image(root_url + "/dots/stimuli/1_con_C1_1.svg").attr({x:100, y:0});
			N1[1] = Crafty.e("2D, DOM, HTML").replace(makeSVG(c["1c1"])).attr({x:100, y:0});
			N2[0] = make_text(pos2, text_attr, css, '');
			//N2[1] = Crafty.e("2D, DOM, Image").image(root_url + "/dots/stimuli/2_con_C1_1.svg").attr({x:550, y:0});
			N2[1] = Crafty.e("2D, DOM, HTML").replace(makeSVG(c["2c1"])).attr({x:550, y:0});

			var divider = Crafty.e("2D, DOM, Color").attr({x:screen.mid[0], y:screen.mid[1]-300, w:1, h:600}).color('#000');

		}

		var fix_cross = make_cross(screen, text_attr, css);
		var curtain = make_curtain(screen);

		//create the difficulty object
		var diff = new Difficulty();
		diff.generate();


		var practice = new Practice(screen, trial_clock, diff);
		//practice.practice =false;

		function Difficulty() {
			//create a list of easier difficulties for the practice version
			params = [];
			params[0] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
			params[1] = [0.25, 0.33, 0.5, 0.66, 0.75, 0.75, 0.9, 0.9];
			if (mode == 'stroop') {
				params[1] = [0.9, 0.75, 0.66, 0.5, 0.33, 0.33, 0.25, 0.25];	
			}

			this.param_space = new Param_Space(params);

			this.grader = new Grader();

			this.ns = ['', ''];
			this.sizes = [80, 80];

			this.give_side = new GiveItems(["left", "right"], 3);
			this.give_con = new GiveItems(["con", "incon"], 3);
			this.give_ex = new GiveItems([1,2,3,4], 2);
			this.stroop_con = new GiveItems(['con', 'incon'], 2);
			this.img_side = new GiveItems(['left', 'right'], 3);

			this.lastN1 = 0;
			this.lastN2 = 0;

			this.adjust = function(){
				ACC = this.grader.ACC;
				RT = this.grader.RT;
				easyness = this.grader.easyness;

				//if we have already found the sticking point
				if (this.param_space.stuck == true) {
					this.param_space.search();
				}
				else {
					//have we found the sticking point?
					if (this.grader.streak < 0) {
						this.param_space.sticking_point();
					}

					//otherwise
					else {
						//first check accuracy
						if (easyness < 0 ) { 
							this.param_space.adjust([-1, -1]);
						} else {

							if (easyness > 0.5) {
								//increment both by 1
								if (practice.practice == false) {
									this.param_space.adjust([2, 2]);
								} else {
									this.param_space.adjust([1, 1]);
								}
							} else if (easyness > 0.25) {
								if (practice.practice == false) {
									this.param_space.adjust([1, 1], true);
								} else {
									this.param_space.adjust([0, 1], true);
								}						
							}
							else if (easyness > 0.1) {
								//just hang out in this space...
								this.param_space.adjust([1,-1], true);
							} else {
								this.param_space.adjust([-1, -1]);
							}
																	
						}
					}
				}

			};

			this.generate = function() {
				n1 = this.param_space.get(0);
				n2 = n1 / this.param_space.get(1);
				n2 = Math.round(n2);

				if (n1 == 0) {n1 = Crafty.math.randomInt(1, 20);}
				if (n2 == 0) {n2 = Crafty.math.randomInt(2, 20);}

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

				side = this.give_side.next();
				stroop_con = this.stroop_con.next();

				this.CRESP = side;

				if (side == "right") {
					this.ns = [n1, n2];
					if (stroop_con == "con") {
						this.sizes = [80, 160];
					} else if (stroop_con == "incon") {
						this.sizes = [160, 80];
					}
				}
				else {
					this.ns = [n2, n1];
					if (stroop_con == "con") {
						this.sizes = [160, 80];
					} else if (stroop_con == "incon") {
						this.sizes = [80, 160];
					}

				}
				if (mode == "stroop") {
					subject.inputData("congruency", stroop_con);
					subject.inputData("sizes", this.sizes);
					if (stroop_con == "incon") {
						if (side == "left") { this.CRESP="right"}
						else if (side == "right") {this.CRESP="left"}
					}
				}

				//$('#console').html(stroop_con + "," + side + "," + this.CRESP);
			};
		}

		function Grader(){
			this.ACC = 1;
			//we initialize RT to the subject mean
			this.RT = 500;

			this.ACCs = [];
			this.RTs = [];
			this.Es = [];

			this.grade = function(user_resp) {
				if (user_resp == diff.CRESP) {
					this.ACC = 1;
				}
				else {this.ACC = 0}

				//get the RT, and its zscore
				t = new Date();
				this.RT = t.getTime() - start_time; 
				this.RTs.push(this.RT);

				this.easyness = this.ACC - (this.RT / response_window);
				this.Es.push(this.easyness);
				l = this.Es.length;
				this.streak = (this.Es[l-1] + this.Es[l-2] + this.Es[l-3] + this.Es[l-4] + this.Es[l-5]) / 5

				n1 = Math.min(diff.ns[0], diff.ns[1]);
				n2 = Math.max(diff.ns[0], diff.ns[1]);

				distance = n2 - n1;
				ratio = (n1 / n2).toFixed(2);

				subject.inputData("ratio", ratio);
				subject.inputData("distance", distance);
				ni = diff.param_space.normed_indexes();
				subject.inputData("diff1", ni[0]);
				subject.inputData("diff2", ni[1]);
				subject.inputData("stuck", diff.param_space.stuck);
				subject.inputData("n1", n1);
				subject.inputData("n2", n2);
				subject.inputData("ACC", this.ACC);
				subject.inputData("RT", this.RT);
				subject.inputData("practice", practice.practice);
				subject.inputData("easyness", this.easyness);
				subject.inputData("avg_easyness", this.streak);

				console.log(trial_clock.trial, user_resp, diff.CRESP);

				//emit grade event
				Crafty.trigger("grade");
		
			};

		}

		var key_func = function(e) {
			if(e.key == Crafty.keys.F) {
				diff.grader.grade("left");
				Crafty("TrialClock").reset();
			} else if (e.key == Crafty.keys.J) {
				diff.grader.grade("right");
				Crafty("TrialClock").reset();
		 	} 
 		}

		var controller = Crafty.e('Controller')
			.bind('timeout', function() {
				Crafty.trigger('KeyDown', "NA");
				diff.grader.grade("NA");
				//Crafty("TrialClock").reset();
			})


			.bind('trial', function() {
				subject.sendData(Crafty('TrialClock').trial);
			})

			.bind('end_task', function() {
				trial_clock.stop();
				Crafty.enterScene("outro");
			})

			.bind("ISI", function() {
				curtain.visible = false;
				if (mode == 'symbolic' || mode == 'stroop') {
					N1.text('');
					N2.text('');
				}
				else if (mode == 'nonsymbolic') {
					divider.visible = false;
					N1.visible = false;
					N2.visible = false;
				}
				else if (mode == 'mixed') {
					divider.visible = false;
					N1[0].text('');
					N2[0].text('');
					N1[1].visible = false;
					N2[1].visible = false;
				}
				
				fix_cross.text('');
				t = new Date();
				trial_start = t.getTime();
				subject.inputData("ISI_onset", trial_start);

				diff.generate();

				small = diff.ns[0];
				big = diff.ns[1];


				con = diff.give_con.next();
				subject.inputData('con', con);

				img1 = small + con[0] + diff.give_ex.next();
				img2 = big + con[0] + diff.give_ex.next();

				//$('#console').html(img1 + "<br/>" + img2);

			})

			.bind("cross", function () {
				//curtain.visible = false;
				//generate the numbers we're gonna need for the number phase
				fix_cross.text('+');
				if (mode =='symbolic' || mode == 'stroop') {
					N1.text('');
					N2.text('');
				}
				else if (mode =='nonsymbolic') {
					divider.visible = false;
					N1.visible = false;
					N2.visible = false;
				}
				else if (mode == 'mixed') {
					divider.visible = false;
					N1[0].text('');
					N2[0].text('');
					N1[1].visible = false;
					N2[1].visible = false;
				}

				t = new Date();
				subject.inputData("cross_onset", t.getTime() - trial_start);

			})

			.bind("num", function() {
				this.one('KeyDown', key_func);

				t = new Date();
				fix_cross.text('');

				//alert(mode);
				if (mode == 'symbolic' || mode =='stroop') {
					N1.text(diff.ns[0]);
					N2.text(diff.ns[1]);
					if (mode == "stroop") {
						//size:'80px'
						N1.textFont({'size': diff.sizes[0] + 'px'});
						N2.textFont({'size': diff.sizes[1] + 'px'});

						if (diff.sizes[0] == 160) {
							N1.y = screen.mid[1] - 90;
							N2.y = screen.mid[1] - 50;
						} else {
							N2.y = screen.mid[1] - 90;
							N1.y = screen.mid[1] - 50; 
						}
					}
				}

				else if (mode == 'nonsymbolic') {
					divider.visible = true;
					N1.replace(makeSVG(c[img1]));
					N2.replace(makeSVG(c[img2]));
					N1.visible=true;
					N2.visible=true;
				}

				else if (mode == 'mixed') {
					small = diff.ns[0];
					big = diff.ns[1];

					img_side = diff.img_side.next();
					subject.inputData('img_side', img_side);

					divider.visible = true;

					if (img_side == 'left') {
						N1[1].replace(makeSVG(c[img1]));
						N1[1].visible = true;		
						N2[0].text(big);

					} else {
						N1[0].text(small);
						N2[1].replace(makeSVG(c[img2]));
						N2[1].visible = true;
					}
			
				}

				start_time = t.getTime();
				subject.inputData("number_onset", start_time - trial_start);
				diff.adjust();

			})

			.bind("grade", function() {

				if (practice.practice == true) {

					practice.count += 1;

					if (diff.grader.ACC == 1) {
						practice.fb.image(root_url + '/images/correct.png');
						practice.ACC += 1;
					}
					else {
						practice.fb.image(root_url + '/images/incorrect.png');
					}

					practice.fb.visible = true;
					trial_clock.stop();
					setTimeout(function(){practice.check();},400);
				}

			});

		//start the trial clock, after a pause to make sure everything is set up
		setTimeout(function(){ trial_clock.next(); trial_clock.go(); }, 250);

	});//END TASK SCENE

	Crafty.enterScene("intro");

}//END ONLOAD
