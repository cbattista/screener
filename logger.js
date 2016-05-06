function Logger() {
	this.data = {};
	this.rows = {"trials" : []};

	this.inputData = function(field, value) {
		this.data[field] = value;
	};

	this.sendData = function(trial) {
		this.data["trial"] = trial;
		this.rows["trials"].push(this.data);
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
