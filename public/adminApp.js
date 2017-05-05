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

createUser = function (name, password, role, study) {
  //get the variables from the form
  email = name + '@example.com';
  var p = secondaryApp.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    alert(error);
  });

  p.then(function (account) {
    //add the role and study
    path = '/users/' + account.uid;

    primaryApp.database().ref(path).set({'role': role, 'study':study, 'name':name, 'created_on':new Date().getTime()});
    secondaryApp.auth().signOut();

  });

}
