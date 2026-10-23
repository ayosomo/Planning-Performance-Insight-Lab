import {defineEventHandler,HTTPError} from 'nitro/h3';
import {getRun} from 'workflow/api';
import type {SnapshotQaSummary} from '../../../../src/snapshot-qa';

export default defineEventHandler(async event=>{
  const runId=event.context.params?.runId||'';
  if(!/^wrun_[0-9A-HJKMNP-TV-Z]{26}$/.test(runId))throw new HTTPError({status:400,message:'Invalid workflow run identifier.'});
  const run=getRun<SnapshotQaSummary>(runId);
  if(!await run.exists)throw new HTTPError({status:404,message:'Snapshot QA run not found.'});
  if(!(await run.workflowName).endsWith('//validateSyntheticSnapshot'))throw new HTTPError({status:404,message:'Snapshot QA run not found.'});
  const status=await run.status;
  return Response.json({runId,status,...(status==='completed'?{summary:await run.returnValue}:{})},{headers:{'Cache-Control':'no-store'}});
});
