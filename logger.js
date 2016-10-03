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
	}

	this.sendData = function(trial) {
		this.data["trial"] = trial;
		console.log(this.data);
		console.log(this.parent.screenerState);
		firebase.database().ref(this.path + '/' + this.parent.screenerState + '/'
														+ trial).set(this.data);
		console.log(this.data);
		this.data = {};
	};

	this.downloadData = function() {
		exportData = 'data:text/json;charset=utf-8,';
		exportData += escape(JSON.stringify(this.rows));
		encodedUri = encodeURI(exportData);
		newWindow = window.open(encodedUri);
	};
}
