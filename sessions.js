function begin_session() {
		var task_order = firebase.database().ref('task_order/');
		task_order.once('value').then(function(snapshot) {
			i = snapshot.val().current_index;
			o = eval(snapshot.val().orders);
			order = o[i];

			uid = firebase.auth().currentUser.uid;
			users = firebase.database().ref('/users/' + uid + '/');
			updates = {};
			task = order.pop()
			updates['current_task'] = task;
			updates['tasks_to_play'] = order;
			promise = users.update(updates).then();
			window.game.screenerState.start('Boot', true,false, task);

			//increment the index
			i = i + 1;
			if (i >= o.length) {
				i = 0;
			}
			//save it
			var updates = {};
			updates['current_index'] = i;
			firebase.database().ref('task_order/').update(updates);
		});
}

function next_task() {
	uid = firebase.auth().currentUser.uid;
	users = firebase.database().ref('/users/' + uid + '/');

	users.once('value').then(function(snapshot) {
		tasks_to_play = snapshot.val().tasks_to_play;
		updates = {};
		if (tasks_to_play != null) {
			task = tasks_to_play.pop();
			updates['tasks_to_play'] = tasks_to_play;
			users.update(updates);
			window.game.screenerState.start(task);
		} else {
			end_session();
		}
	});
}

function end_session() {
	uid = firebase.auth().currentUser.uid;
	users = firebase.database().ref('/users/' + uid + '/');
	updates = {}
	updates['current_task'] = null;
	users.update(updates);

	//increment session counter
	var p = firebase.database().ref('/users/' + uid + '/session_count').transaction(function(c) {
		return c + 1;
	});

	//after increment, sign the user out - TODO - send them to a thank you page as well
	p.then(function () {firebase.auth().signOut();})
}
