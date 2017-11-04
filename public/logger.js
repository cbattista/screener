function Logger(task, parent) {
	this.parent = parent;
	var d = new Date();
	this.session_id = d.getTime();
	uid = firebase.auth().currentUser.uid;
	this.path = 'taskData/' + uid + '/' + task + '/' + this.session_id;
	this.data = {};

	this.inputData = function(field, value) {
		this.data[field] = value;
	};

	this.log = function(path, data) {
		var updates = {};
		updates[this.path + '/' + path] = data;
		firebase.database().ref().update(updates);
		//console.log(updates);
	}

	this.sendData = function(trial) {
		this.data["trial"] = trial;

		if ('diff3' in this.data) {
			var avg_diff = (this.data['diff1'] + this.data['diff2'] + this.data['diff3']) / 3;
		} else {
			var avg_diff = (this.data['diff1'] + this.data['diff2'] / 2);
		}

		avg_diff = parseInt(avg_diff * 100);
		var perf = parseInt((this.data['performance'] + 1) * 50);

		obj = {'difficulty' : avg_diff, 'performance' : perf};

		argString = "d=" + avg_diff +  "&p=" + perf;

        console.log(argString)

		window.postMessage(argString, '*');

		firebase.database().ref(this.path + '/' + this.parent.state + '/'
														+ trial).set(this.data);
		this.data = {};
	};

	this.downloadData = function() {
		exportData = 'data:text/json;charset=utf-8,';
		exportData += escape(JSON.stringify(this.rows));
		encodedUri = encodeURI(exportData);
		newWindow = window.open(encodedUri);
	};
}
