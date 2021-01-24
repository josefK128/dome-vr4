// test-simple.js
// test-simple is the 'specrunner' for the unit tests in narrative.test.test(),
// which return undefined if 'pass', and an assertion error msg if 'fail'.
// test-simple.js is a quick test of correct es-module usage in Node.ja
// run by:  dome-vr4> npm run test-simple
// npm script:
// "test": "node --experimental-modules  --es-module-specifier-resolution=node ./test/test-simple.js",
// --experimental-modules needed (as of Node v12.x.x) for use of es-modules
// --es-module-specifier-resolution=node ./test/test-simple.js used 
// (as of Node v12.x.x) simply to remove the need for file extension '.js'


// fail
//import {test} from '../app/narrative.test.ts';  nar.test.ts - not found
//import {test} from '../app/narrative.test';  nar.test - not found
//import {test} from '../../src/app/narrative.js'; - not found
// NOTE: src/app/narrative is in reality a ts-file

// works
import {test} from './app/narrative.test';                       //
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';


console.log('\ntest-simple.js - imports {test} from ./app/narrative.test.js');
console.log('test-simple.test(): calling narrative.test.test():');
console.log("NOTE: narrative.test.test returns 'undefined' => test 'passes'");
test();
