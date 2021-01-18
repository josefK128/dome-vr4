// narrative.spec.js

// es6 import in jasmine and jest FAILS without transpiling by Babel!!!
import {narrative} from '../../dist/app2020/narrative.js'

console.log(`narrative = ${narrative}`);
console.log(`narrative.foo = ${narrative.foo}`);
console.log(`Object.keys(narrative).length = ${Object.keys(narrative).length}`);
for(let p in narrative){
  console.log(`object narrative has property ${p}`);
}

describe("foo method of singleton instance of class Narrative", () => {
  it("should return 'foo'", () => {
    expect(narrative.foo()).toEqual('foo');
  });
});
