import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const [tool,...args]=process.argv.slice(2);
const bins={vite:'../node_modules/vite/bin/vite.js',vitest:'../node_modules/vitest/vitest.mjs',tsc:'../node_modules/typescript/bin/tsc'};
if(!Object.hasOwn(bins,tool))throw Error('Unsupported local tool');
const runtimeFlags=tool==='vite'&&!args.includes('build')?['--max-old-space-size=128','--max-semi-space-size=1']:[];
const child=spawn(process.execPath,[...runtimeFlags,fileURLToPath(new URL(bins[tool],import.meta.url)),...args],{stdio:'inherit',env:{...process.env,RAYON_NUM_THREADS:'1',GOMAXPROCS:'2',GOMEMLIMIT:'256MiB',GOGC:'50'}});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});

