//admin.js

var app = angular.module("adminApp", ["firebase"]);

app.controller("userCtrl", function($scope, $firebaseObject) {
  var ref = firebase.database().ref().child("users");
  // download the data into a local object
  var syncObject = $firebaseObject(ref);
  // synchronize the object with a three-way data binding
  // click on `index.html` above to see it used in the DOM!
  syncObject.$bindTo($scope, "users");
});

createUser = function () {
  //get the variables from the form
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  //first we register the user with firebase
  var p = firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    alert(error);
  });

  p.then(function (account) {
    var role = document.getElementById('role').value;
    var study = document.getElementById('study').value;
    //add the role and study
    path = '/users/' + account.uid;

    firebase.databaseURL().ref(path);

  });

}
