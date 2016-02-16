# NFA to DFA
![logo](https://raw.githubusercontent.com/fcannizzaro/nfa-to-dfa/master/subset.png)

[![npm](https://img.shields.io/npm/dm/nfa-to-dfa.svg)](https://www.npmjs.com/package/nfa-to-dfa)
[![travis](https://api.travis-ci.org/fcannizzaro/nfa-to-dfa.svg?branch=master)](https://travis-ci.org/fcannizzaro/nfa-to-dfa)

Convert NFA to DFA (json output) from (json input, .nfa file)


## Install
```sh
npm install nfa-to-dfa
```

## Usage
```javascript
var nfa = require("nfa-to-dfa");

// create a new NFA with title
nfa.create("Title");

// add state
nfa.addState("Q1")
    .loop("c")
	.goTo("Q1", "a")
	.goTo("Q0", "a");

// get DFA as json
var dfa = nfa.toDfa();
```

## Test
run ```npm test``` (Mocha)

## Methods

#### create(String title)
create NFA

#### addState(String label)
add a new state

#### goTo(String state, String character)
add a new transition

#### loop(String character)
add a loop transition

#### initial()
set state as "initial"

#### final()
set state as "final"

#### readFile(String path)
create an NFA from **.nfa** file

#### toString()
return ordered NFA/DFA

#### toDfa()
return NFA as DFA

## Sample .nfa file
[sample.nfa](https://github.com/FrancisCan/NFAtoDFA/blob/master/sample/sample.nfa)
```
nfa : Title

q0 {
    start
    loop c
    goto q2 e
}

q1 {
    loop a
    goto q0 a
}

q2 {
    end
    loop y
    goto q1 b
}
```

## Sublime Text Syntax Highlight
[nfa.tmLanguage](https://github.com/FrancisCan/NFAtoDFA/blob/master/nfa.tmLanguage)
