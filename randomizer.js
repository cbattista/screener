Randomizer = function(attrib) {
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
