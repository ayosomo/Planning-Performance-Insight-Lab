const flags=process.argv.slice(2),index=flags.indexOf('--port');
const port=index>=0?flags[index+1]:(process.env.PORT||'5173');
if(!/^\d+$/.test(port)||Number(port)<1024||Number(port)>65535)throw Error('Choose a port between 1024 and 65535.');
process.env.PORT=port;
process.env.HOST='127.0.0.1';
process.env.WORKFLOW_TARGET_WORLD='local';
process.env.WORKFLOW_LOCAL_BASE_URL=`http://127.0.0.1:${port}`;
await import('../.output/server/index.mjs');
