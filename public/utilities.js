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
