var nfa = {},
	dfa = {},
	table = {},
	finals = [];

var fs = require("fs");

// GENERIC functions

var get = function(fsa, search) {
	for (var i = 0; i < fsa.states.length; i++) {
		if (fsa.states[i].label === search)
			return fsa.states[i];
	}
}

var getInitial = function(fsa) {
	var initials = [];
	for (var i = 0; i < fsa.states.length; i++)
		if (fsa.states[i].isInitial === true)
			initials.push(fsa.states[i]);
	return initials;
}

var join = function(original) {
	return Array.isArray(original) ? original.join() : original;
}

var order = function(toPrint) {
	toPrint.states.sort(function(n1, n2) {
		return n1.label > n2.label;
	});
	return toPrint;
}

var generateTable = function() {
	for (var i = 0; i < nfa.states.length; i++) {

		var state = nfa.states[i],
			row = table[state.label] = {};

		for (var j = 0; j < state.transitions.length; j++) {

			var transition = state.transitions[j];

			for (var z = 0; z < transition.symbol.length; z++) {
				var symbol = transition.symbol[z];
				if (row[symbol] == undefined) row[symbol] = [];
				row[symbol].push(transition.to);
			}

			row[symbol].sort();

		}
	}

}

function linkTransitions(labels) {
	var transitions = {};
	for (var i = 0; i < labels.length; i++)
		for (var symbol in table[labels[i]]) {
			if (transitions[symbol] == undefined)
				transitions[symbol] = [];
			transitions[symbol] = unique(transitions[symbol].concat(table[labels[i]][symbol]));
		}
	return transitions;
}

var recursiveLink = function(_state, initial) {

	if (initial) {
		var labels = [];
		for (var i = 0; i < _state.length; i++) labels.push(_state[i].label);
		_state = state(labels.join());
		_state.isInitial = true;
		dfa.states.push(_state);
		editTransition(_state, linkTransitions(labels));
		return;
	}

	var key = _state.label;

	if (key.indexOf(",") < 0)
		editTransition(_state, table[key]);
	else
		editTransition(_state, linkTransitions(key.split(",")));

}

var editTransition = function(_state, transitions) {

	for (var key in transitions) {

		var newState = state(join(transitions[key]));

		for (var i = 0; i < transitions[key].length; i++)
			if (finals.indexOf(transitions[key][i]) >= 0)
				newState.isFinal = true;

		if (newState.label == _state.label)
			_state.loop(key);
		else {

			_state.goTo(newState.label, key);

			if (!dfa.get(newState.label)) {
				dfa.states.push(newState);
				recursiveLink(newState, false);
			}
		}
	}
}

// STATE functions

var state = function(label) {

	var transitions = [];

	var state = {
		label: label,
		isFinal: false,
		isInitial: false,
		transitions: transitions
	};

	state.initial = function() {
		state.isInitial = true;
		return state;
	}

	state.final = function() {
		state.isFinal = true;
		finals.push(state.label);
		return state;
	}

	state.goTo = function(to, symbol) {

		transitions.push({
			loop: state.label == to,
			to: to,
			symbol: Array.isArray(symbol) ? symbol : [symbol || "ε"]
		});

		return state;
	}

	state.loop = function(symbol) {
		var found = false;
		for (var i = 0; i < transitions.length; i++)
			if (transitions[i].loop) {

				if (Array.isArray(symbol))
					transitions[i].symbol.concat(args);
				else
					transitions[i].symbol.push(symbol || "ε");

				found = true;
				break;
			}

		if (!found)
			state.goTo(state.label, symbol);

		return state;
	}

	return state;
}


nfa.create = function(name) {
	nfa.name = dfa.name = name;
	nfa.states = [];
	if (name == undefined)
		console.log("[NFA] Name not defined");
	return nfa;
}

nfa.addState = function(label) {
	var found;

	for (var i = 0; i < nfa.states.length; i++)
		if (nfa.states[i].label == label) {
			found = nfa.states[i];
			break;
		}

	var _state = state(label);

	if (!found) {
		nfa.states.push(_state);
		return _state;
	}
	return found;
}

nfa.toString = function() {
	return JSON.parse(JSON.stringify(order(nfa)));
}

// DFA functions

nfa.get = function(search) {
	return get(nfa, search);
}

nfa.toDfa = function() {
	dfa.states = [];
	generateTable();
	recursiveLink(nfa.getInitial(), true);
	return dfa;
}

nfa.getInitial = function() {
	return getInitial(nfa);
}

dfa.toString = function() {
	return JSON.parse(JSON.stringify(order(dfa)));
}

dfa.get = function(search) {
	return get(dfa, search);
}

dfa.getInitial = function() {
	return getInitial(dfa);
}

dfa.toNfa = function() {
	nfa.states = dfa.states;
	return nfa;
}

function unique(a) {
	for (var i = 0; i < a.length; ++i) {
		for (var j = i + 1; j < a.length; ++j) {
			if (a[i] === a[j])
				a.splice(j--, 1);
		}
	}
	a.sort();
	return a;
};

// READ FILE fucntions

nfa.readFile = function(file) {

	var content = fs.readFileSync(file, {
		encoding: "utf-8"
	}).toString();

	nfa = nfa.create("Test NFA");

	var regex = /(\w+).*{([^{]*)}/g,
		part;

	while (part = regex.exec(content)) {

		var transitions = part[2].split("\r\n");
		var label = part[1];

		for (var i in transitions)
			transitions[i] = transitions[i].trim();

		transitions = transitions.filter(function(n) {
			return n != "";
		});

		var _state = nfa.addState(label.toUpperCase());

		if (transitions.indexOf("start") >= 0)
			_state.initial();

		if (transitions.indexOf("end") >= 0)
			_state.final();

		for (var i in transitions) {

			var str = transitions[i],
				symbol, to;

			if (str.indexOf("loop") >= 0) {
				var match = /loop\s*(.)/g.exec(str);
				_state.loop(match[1]);
			}

			else if (str.indexOf("goto") >= 0) {
				var match = /goto\s*(\w+)\s*(.)/g.exec(str);
				to = match[1];
				symbol = match[2];
				_state.goTo(to.toUpperCase(), symbol);
			}

		}
	}
}

module.exports = nfa;
