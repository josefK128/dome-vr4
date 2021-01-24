// test.js
// test is the 'specrunner' for unit tests in the directory tree 'app' in test,
// structured isomorphically to the app-trees in src and dist. Each unit test
// module imports the corresponding js-file from dist and executes tests
// which return undefined if 'pass', and an assertion error msg if 'fail'.
// run by:  dome-vr4> npm run test
// npm script:
// "test": "node --experimental-modules  --es-module-specifier-resolution=node ./test/test.js",
// --experimental-modules needed (as of Node v12.x.x) for use of es-modules
// --es-module-specifier-resolution=node ./test/test.js used 
// (as of Node v12.x.x) simply to remove the need for file extension '.js'


//import * as fs from 'fs';
import {promises as fs} from 'fs';
import * as path from 'path';
import * as assert from 'assert';

// TEMP - diagnostics
//console.log(`fs is defined is ${fs !== undefined}`); 
//console.log(`path is defined is ${path !== undefined}`); 
//console.log(`assert is defined is ${assert !== undefined}`); 



let paths = [];



async function getFiles(path){
  // ensure that path has final char '/' 
  path = (path.slice(-1) === '/')? path : path + '/';
  //console.log(`\n\ngetFiles(${path}) *********************`);

  // get entries from passed in path - files and/or directories
  const entries = await fs.readdir(path, {withFileTypes: true});
  //console.log(`entries is defined is ${entries !== undefined}`); 

  // Get files within the current directory and add a path key to the file objects
  const files = entries
    .filter(file => !file.isDirectory())
    .map(file => ({ ...file, path: path + file.name }));

  // Get folders within the current directory
  const folders = entries.filter(folder => folder.isDirectory());
  //console.log(`folders is defined is ${folders !== undefined}`); 

  for (const folder of folders){
    // add the found files within the subdirectory to the files array    
    // by recursive call to getFiles with arg = folder.name
    files.push(...await getFiles(`${path}${folder.name}/`));
  }

  return files;
}



async function _test(path){
  // remove possible leading substring './test' - import is relative to test.js
  path = path.replace('/test', '');
  //console.log(`\n\ntest._test ${path} *********************`);

  // dynamic import from path;
  const module = await import(path);
  if(module.err){ 
    console.log(`error on import(${path})`);
  }else { 
    //console.log(`loaded module:`);
    //console.dir(module);
    ;
  }

  //console.log(`_test: running module.test():`);
  const result = module.test();
  //console.log(`typeof result = ${typeof result}`);
  return result;  // Promise
}



async function run(_path){
  //console.log(`\n\n_run(${_path} *********************`);

  // get information for all files in the tree _path
  paths = await getFiles(_path);
  //console.log(`\n\nrun: paths is defined is ${paths !== undefined}`); 
  //console.log(`run: paths type = ${typeof paths}`);
  //console.log(`run: Array.isArray(paths) = ${Array.isArray(paths)}`);
  //console.log('\nbefore filtering of paths:');
  //console.dir(paths);

  // filter out files starting with '.'
  // filter out files NOT containing 'test'
  paths = paths.filter(path => !path['name'].startsWith('.'));
  paths = paths.filter(path => path['name'].includes('test'));
  //console.log('\nafter filtering of paths:');
  //console.dir(paths);

  // run tests  
  for(let o of paths){
    const testfile = o['name']
    const testpath = o['path'];
    //console.log(`\n\n@@@ testing file = ${testfile} on path = ${testpath}`);

    // NOTE: refactor by bringing in body of _test here
    // ...
    try{
      console.log(`\n\n@@@ testing ${testpath}`);
      const result = await _test(testpath);
      //console.log(`test.run: result = ${result}`);
      for(let testname of Object.keys(result)){
        console.log(`${testname} emits ${result[testname]}`);
      }
    }catch(e){
      console.log(`_test(${testpath}) rejected: ${e}`);
    }
  }
}


// execute tests on testfiles from all branches of './test/app'
run('./test/app');


