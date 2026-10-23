import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const runner=fileURLToPath(new URL('./tool.mjs',import.meta.url));
const flags=process.argv.slice(2);
const portIndex=flags.indexOf('--port');
const port=portIndex>=0?flags[portIndex+1]:'5173';
if(!/^\d+$/.test(port)||Number(port)<1024||Number(port)>65535)throw Error('Choose a port between 1024 and 65535.');
const run=args=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,[runner,...args],{stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(`Local command exited with code ${code}`)));});
try {
  console.log('Building the synthetic local demo before opening the preview.');
  await run(['tsc','--noEmit']);
  await import('./copy-evidence.mjs');
  await run(['vite','build']);
  const server=spawn(process.execPath,[fileURLToPath(new URL('./serve.mjs',import.meta.url)),'--port',port],{stdio:'inherit'});
  server.on('exit',code=>{process.exitCode=code??1;});
}catch(error){console.error(error.message);process.exitCode=1;}
