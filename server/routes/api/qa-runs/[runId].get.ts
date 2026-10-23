import {defineEventHandler,HTTPError} from 'nitro/h3';
import {getRun} from 'workflow/api';
import {getWorld} from 'workflow/runtime';
import type {SnapshotQaSummary} from '../../../../src/snapshot-qa';

export default defineEventHandler(async event=>{
  const runId=event.context.params?.runId||'';
  if(!/^wrun_[0-9A-HJKMNP-TV-Z]{26}$/.test(runId))throw new HTTPError({status:400,message:'Invalid workflow run identifier.'});
  const run=getRun<SnapshotQaSummary>(runId);
  if(!await run.exists)throw new HTTPError({status:404,message:'Snapshot QA run not found.'});
  if(!(await run.workflowName).endsWith('//validateSyntheticSnapshot'))throw new HTTPError({status:404,message:'Snapshot QA run not found.'});
  const status=await run.status;
  const world=await getWorld();
  const steps=await world.steps.list({runId,resolveData:'none',pagination:{limit:100}});
  const events=await world.events.list({runId,resolveData:'none',pagination:{limit:100,sortOrder:'asc'}});
  const retryProbe={steps:steps.data.map(step=>({stepId:step.stepId,stepName:step.stepName,status:step.status,attempt:step.attempt})),events:events.data.map(event=>({eventType:event.eventType,correlationId:event.correlationId,createdAt:event.createdAt})),hasMore:events.hasMore};
  return Response.json({runId,status,retryProbe,...(status==='completed'?{summary:await run.returnValue}:{})},{headers:{'Cache-Control':'no-store'}});
});
