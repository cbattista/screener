TrialClock = function (parent, durations, event_names) {
	//signal - Phaser Signal Object (used to broadcast events)
	//durations - how long (in frames) each portion of the trial should last
	//event_names - name of each part of the trial (fixation, stimulus, etc...)
	//signal - instance of Phaser.Signal() for dispatching event_names
	//logger - instance of Logger() for storing data
	this.trial = 1;
	this.max_trials = 200;
	this.frame = 1;
	this.durations = durations;
	this.event_names = event_names;
	this.count = 0;
	this.inc = 0;
	this.parent = parent;

	this.update = function () {
		//$('#frame_counter').html(this.frame);
		this.frame += this.inc;

		//end of the task
		if (this.trial == (this.max_trials + 1)) {
			this.parent.signal.dispatch('end_task');
		}

		//end of current phase
		if (this.frame == this.duration) {
			this.frame = 1;

			//end of the very last phase, this is the timeout event
			if ((this.count % this.durations.length) == 0 ) {
				//trigger a trial event
				this.parent.signal.dispatch('timeout');
				this.parent.signal.dispatch('trial');
				this.trial += 1;

			}
			this.next();
		}

	}

	this.next = function () {
		index = this.count % this.durations.length;
		this.duration = this.durations[index];
		this.event_name = this.event_names[index];
		//emit trial phase event
		this.parent.signal.dispatch(this.event_name);
		//log the wall time of this event
		d = new Date();
		this.parent.logger.inputData(this.event_name, d.getTime());
		this.count += 1;
	}

	this.go = function() {
		this.inc = 1;
	}

	this.stop = function() {
		this.inc = 0;
	}

	this.reset = function() {
		//used to manually advance the trial
		//such as when the user gives a response
		this.frame=1;
		this.count=0;
		//TODO - do we always want to trigger a trial event?
		this.parent.signal.dispatch('trial');
		this.trial += 1;
		this.next()
	}

	this.restart = function () {
		//return everything to start state
		//but don't trigger any events
		this.trial = 1;
		this.frame = 1;
		this.count = 1;
		this.go();
	}

}
