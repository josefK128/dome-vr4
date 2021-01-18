// test.ts

import * as path from 'path';
import * as fs from 'fs';


function
recFindByExt(base,ext,files,result){

  console.log(`base = ${base}`);
  console.log(`ext = ${ext}`);
  console.log(`files = ${files}`);
  console.dir(files);
  if(files.length == 0){
    console.log("files === [] so setting files to undefined");
    files = undefined;
  }
  console.assert(files === undefined, 'files is not undefined!');

  console.assert(fs.readdirSync !== undefined, 'fs.readdirSync is undefined!');
  let _files = fs.readdirSync(base);
  console.log(`_files = ${_files}`);

  console.log(`fs.readdirSync(base) = ${fs.readdirSync(base)}`);
  if (files === undefined){
    files = fs.readdirSync(base); 
  }
  result = result || [];
  console.log(`after directory read files = ${files}`);

  // iterate through directories filtering by file-ext
  files.forEach((file) => { 
    console.log("file = " + file);
    let newbase = path.join(base,file)
    if ( fs.statSync(newbase).isDirectory() )
    {
        result = recFindByExt(newbase,ext,fs.readdirSync(newbase),result)
    }
    else
    {
      if ( file.substr(-1*(ext.length+1)) == '.' + ext )
      {
        result.push(newbase)
      } 
    }
  })
  return result
}

const cwd = process.cwd();
console.log(`cwd = ${cwd}`);
//const root = __dirname + './app';
const root = cwd + '/test/app/';
const ext_file_list = recFindByExt(root,'ts',[],[])
console.log(`ts-files found = ${ext_file_list}`);
