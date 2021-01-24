// app/narrative2.test.js
// module containing unit tests for narrative.js
// NOTE: tests object contains all the unit tests - they should be given
// descriptive names and contain a single assertion which returns undefined
// if test passes (assertion boolean true) or the assertion error message
// if the test fails (assertion boolean false)


// fail
//import {narrative} from '../../src/app/narrative.js'; - not found
//import {narrative} from '../../src/app/narrative'; - not found
//import {narrative} from '../../src/app/narrative.ts'; - unknown file-ext

// works
import {narrative} from '../../../dist/app/narrative';


let tests = {
  foo_is_defined : function(){
    // narrative.foo should be defined
    return console.assert(narrative.foo() !== undefined, "narrative.foo() is undefined!")
  },

  foo_returns_foo: function(){
    // narrative.foo should return string foo
    return console.assert(narrative.foo() === 'foo', "narrative.foo() !== 'foo'!");
  }
}


function test(){
  //console.log(`\n### narrative2.test.test()`);
  //console.log(`Object.keys(tests) = ${Object.keys(tests)}`);
  let result = {};
  //console.log(`typeof Object.keys(tests) = ${typeof Object.keys(tests)}`);
  //console.log(`Array.isArray(Object.keys(tests)) = ${Array.isArray(Object.keys(tests))}`);
  //console.dir(Object.keys(tests));

  for(let f of Object.keys(tests)){
    //console.log(`typeof f = ${typeof f}`);
    const r = tests[f]();
    //console.log(`narrative2.test: tests[${f}]() returns ${r}`);
    result[f] = (tests[f]() === undefined) ? 'OK' : r;
  }
  return result;
}


//console.log('\napp/narrative2.test.js - exports test()');
export {test};
