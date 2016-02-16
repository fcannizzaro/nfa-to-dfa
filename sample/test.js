var nfa = require("../index");

nfa.create("Test NFA");

nfa.addState("Q1")
	.goTo("Q1", "a")
	.goTo("Q0", "a");

nfa.addState("Q2")
	.final();

nfa.addState("Q4")
	.final();

nfa.addState("Q0")
	.initial()
	.loop("a")
	.loop("b")
	.goTo("Q4", "c")
	.goTo("Q2", "b")
	.goTo("Q1", "a");


// or read from file
//nfa.readFile("multi_initial.nfa");

var dfa = nfa.toDfa().toString();

console.log(dfa);
