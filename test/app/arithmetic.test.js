// arithmetic.test.js

//import {operations as o} from './arithmetic.js';
o = require('./arithmetic.js');

test('2 + 3 = 5', () => {
  expect(o.add(2, 3)).toBe(5);
});

test('3 * 4 = 12', () => {
  expect(o.mul(3, 4)).toBe(12);
});

test('5 - 6 = -1', () => {
  expect(o.sub(5, 6)).toBe(-1);
});

test('8 / 4 = 2', () => {
  expect(o.div(8, 4)).toBe(2);
});
