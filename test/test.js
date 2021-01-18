// test.js

const path = require('path');
const fs = require('fs');


function recFindByExt(base,ext,files,result) 
{
  console.log(`\nrecFindByExt: base = ${base}`);
  console.assert(fs.readdirSync !== undefined, 'fs.readdirSync is undefined!');
  files = files || fs.readdirSync(base) 
  result = result || []

  console.log(`result = ${result}`);
  console.log(`after directory read files = ${files}`);


  // iterate through files filtering out all but ext-files
  files.forEach((file) => { 
    //console.log("file = " + file);
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

console.log(`__dirname = ${__dirname}`);
console.log(`process.cwd() returns ${process.cwd()}`);
const root = __dirname + '/app';
ext_file_list = recFindByExt(root,'ts')
console.log(`ts-files found = ${ext_file_list}`);
