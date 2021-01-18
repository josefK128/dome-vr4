// narrative.spec.ts

import {narrative} from '../../dist/app/narrative.js';
//import {narrative} from '../../src/app/narrative.js'; - not found
//import {narrative} from '../../src/app/narrative.ts'; - unknown file-ext

console.log("\n\nnarrative.spec.ts");
console.log(`imported narrative = ${narrative}`);

console.log("\nfoo method of singleton instance of class Narrative:");
console.log("should be defined");
console.assert(narrative.foo() !== undefined, "narrative.foo() is undefined!");
console.log("should return string foo");
console.assert(narrative.foo() === 'foo', "narrative.foo() !== 'foo'!");
