var assert = require('assert');
var nfa = require('../index');

nfa.create("Title");

nfa.addState("Q1")
	.initial()
	.loop("c")
	.goTo("Q1", "a")
	.goTo("Q2", "a");

nfa.addState("Q2")
	.final()
	.loop("a")
	.goTo("Q1", "c");

var dfa = nfa.toDfa();

describe('dfa', function() {
	describe('#toDfa()', function() {

		it('Initial state should be Q1 (loop "c", goto Q1Q2 "a")', function() {
			assert.equal("Q1", dfa.states[0].label);
		});

		var transitionsQ1 = 0,
			transitionsQ1Q2 = 0;

		for (var i = 0; i < dfa.states[0].transitions.length; i++) {

			(function() {

				var transition = dfa.states[0].transitions[i];

				if (transition.to == "Q1") {

					it('Transition from Q1 to Q1 should be a loop and symbol should be "c"', function(done) {
						assert.equal(true, transition.loop);
						assert.equal("c", transition.symbol[0]);
						transitionsQ1++;
						done();
					});
				}

				if (transition.to == "Q1,Q2")
					it('Transition from Q1 to Q1Q2 should have as symbol "a"', function(done) {
						assert.equal("a", transition.symbol[0]);
						transitionsQ1++;
						done();
					});

			})();

		}

		it('Transitions from Q1 should be 2', function(done) {
			assert.equal(2, transitionsQ1);
			done();
		});

		it('Final state should be Q1Q2 (loop "c", goto Q1 "a")', function() {
			assert.equal("Q1,Q2", dfa.states[1].label);
			assert.equal(true, dfa.states[1].isFinal);
		});

		for (var i = 0; i < dfa.states[1].transitions.length; i++) {

			(function() {

				var transition = dfa.states[1].transitions[i];

				if (transition.to == "Q1Q2") {

					it('Transition from Q1Q2 to Q1Q2 should be a loop and symbol should be "c"', function(done) {
						assert.equal(true, transition.loop);
						assert.equal("c", transition.symbol[0]);
						transitionsQ1Q2++;
						done();
					});
				}

				if (transition.to == "Q1")
					it('Transition from Q1Q2 to Q1 should have as symbol "c"', function(done) {
						assert.equal("c", transition.symbol[0]);
						transitionsQ1Q2++;
						done();
					});

			})();

		}

		it('Transitions from Q1Q2 should be 2', function(done) {
			assert.equal(2, transitionsQ1);
			done();
		});

	});

});
