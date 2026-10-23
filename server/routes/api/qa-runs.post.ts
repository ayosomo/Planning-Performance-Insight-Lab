import {defineEventHandler,HTTPError} from 'nitro/h3';
import {start} from 'workflow/api';
import {validateSyntheticSnapshot} from '../../../workflows/validate-synthetic-snapshot';

export default defineEventHandler(async event=>{
  const origin=event.req.headers.get('origin');
  if(origin&&origin!==new URL(event.req.url).origin)throw new HTTPError({status:403,message:'Start the workflow from this demo site.'});
  const body=await event.req.text();
  if(body.trim()&&body.trim()!=='{}')throw new HTTPError({status:400,message:'This demonstration assesses only its committed synthetic fixture; no input records are accepted.'});
  const run=await start(validateSyntheticSnapshot);
  return Response.json({runId:run.runId,status:'pending',source:'committed-synthetic-fixture'},{status:202,headers:{'Cache-Control':'no-store'}});
});
