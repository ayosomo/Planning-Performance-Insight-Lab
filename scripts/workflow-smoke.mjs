import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {resolve} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {randomUUID} from 'node:crypto';

const socket=createServer();await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));
const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
const base=`http://127.0.0.1:${port}`,dataDir=resolve('.workflow-data',`smoke-${randomUUID()}`);
let server,logs='';
async function startServer(){
  server=spawn(process.execPath,['scripts/serve.mjs','--port',String(port)],{stdio:['ignore','pipe','pipe'],env:{...process.env,WORKFLOW_LOCAL_DATA_DIR:dataDir,WORKFLOW_LOCAL_QUEUE_CONCURRENCY:'2'}});
  server.stdout.on('data',chunk=>{logs+=chunk;});server.stderr.on('data',chunk=>{logs+=chunk;});
  for(let attempt=0;attempt<100;attempt++){
    if(server.exitCode!==null)throw Error(`Workflow server exited: ${logs}`);
    try{const response=await fetch(base,{signal:AbortSignal.timeout(1000)});if(response.ok)return;}catch{}
    await delay(200);
  }
  throw Error(`Workflow server did not start: ${logs}`);
}
async function stopServer(){if(server&&server.exitCode===null){const stopped=once(server,'exit');server.kill();await stopped;}}
try{
  await startServer();
  const page=await fetch(base);assert.match(await page.text(),/Planning.*Performance Insight Lab/);
  assert.equal(page.headers.get('x-content-type-options'),'nosniff');
  assert.match(page.headers.get('content-security-policy')||'',/frame-ancestors 'none'/);
  assert.equal((await fetch(`${base}/evidence/architecture.svg`)).status,200);
  assert.equal((await fetch(`${base}/api/qa-runs/not-a-run`)).status,400);
  assert.equal((await fetch(`${base}/api/qa-runs`,{method:'POST',body:'{"orders":[]}'})).status,400);
  assert.equal((await fetch(`${base}/api/qa-runs`,{method:'POST',headers:{Origin:'https://unrelated.example'},body:'{}'})).status,403);
  const response=await fetch(`${base}/api/qa-runs`,{method:'POST',body:'{}'});assert.equal(response.status,202);
  const {runId}=await response.json();let result;
  for(let attempt=0;attempt<100;attempt++){
    const poll=await fetch(`${base}/api/qa-runs/${runId}`);assert.equal(poll.status,200);assert.equal(poll.headers.get('cache-control'),'no-store');
    result=await poll.json();if(result.status==='completed')break;
    assert.ok(['pending','running'].includes(result.status),JSON.stringify(result));await delay(300);
  }
  assert.equal(result.status,'completed');assert.equal(result.summary.baselineMatches,true);
  assert.deepEqual(result.summary.population,{crmRows:240,supplierRows:236,accounts:35});
  assert.deepEqual(result.summary.workbookComparison,{pass:208,review:32,overdue:69,escalation:92});
  assert.equal(result.summary.metrics.pass,228);assert.equal(result.summary.metrics.fail,12);
  await stopServer();await startServer();
  const recovered=await (await fetch(`${base}/api/qa-runs/${runId}`)).json();assert.deepEqual(recovered,result);
  console.log(JSON.stringify({check:'Compiled snapshot QA workflow',status:'passed',runId,steps:3,serverRestartPersistence:true,population:result.summary.population,baselineMatches:true}));
}catch(error){console.error(logs);throw error;}
finally{await stopServer();}
