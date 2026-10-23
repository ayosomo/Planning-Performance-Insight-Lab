import { z } from 'zod';
import { analyse, baseline, type Dataset, type Finding, orderSchema, supplierSchema } from './engine';
export const reviewStatuses=['Open','In Review','Ready for Validation','Resolved','Accepted Exception'] as const;
export const auditSchema=z.object({reviewer:z.string(),timestamp:z.string(),action:z.string(),reason:z.string(),evidence:z.string(),before:z.string().optional(),after:z.string().optional()});
export type Audit=z.infer<typeof auditSchema>;
export type Review={finding:Finding;status:typeof reviewStatuses[number];assignee:string;rootCause:string;correctiveAction:string;evidence:string;history:Audit[]};
export type LabState={version:1;data:Dataset;reviews:Record<string,Review>;sourceHistory:Audit[]};
const findingSchema=z.object({id:z.string(),record_id:z.string(),order_id:z.string(),rule_id:z.string(),category:z.enum(['Integrity','Readiness','Performance']),severity:z.enum(['Critical','High','Medium']),issue:z.string(),evidence:z.string(),owner:z.string(),next_action:z.string()});
export const stateSchema=z.object({version:z.literal(1),data:z.object({orders:z.array(orderSchema),suppliers:z.array(supplierSchema)}),sourceHistory:z.array(auditSchema),reviews:z.record(z.string(),z.object({finding:findingSchema,status:z.enum(reviewStatuses),assignee:z.string(),rootCause:z.string(),correctiveAction:z.string(),evidence:z.string(),history:z.array(auditSchema)}))});
export function initialState():LabState {
  const data=structuredClone(baseline);return {version:1,data,sourceHistory:[],reviews:Object.fromEntries(analyse(data).flatMap(r=>r.findings).map(f=>[f.id,{finding:f,status:'Open',assignee:f.owner,rootCause:'',correctiveAction:'',evidence:'',history:[]}]))};
}
export type ReviewInput={reviewer:string;reason:string;evidence:string;rootCause:string;correctiveAction:string;assignee:string};
function audit(input:ReviewInput,action:string,timestamp:string):Audit {
  if(!input.reviewer.trim()||!input.reason.trim()) throw new Error('Enter a reviewer and a reason for this action.');
  return {reviewer:input.reviewer.trim(),reason:input.reason.trim(),evidence:input.evidence.trim(),action,timestamp};
}
export function changeReview(state:LabState,id:string,status:Review['status'],input:ReviewInput,timestamp:string):LabState {
  const next=structuredClone(state),review=next.reviews[id];
  if(!review) throw new Error('Finding not found.');
  const active=analyse(next.data).flatMap(r=>r.findings).some(f=>f.id===id);
  if(status==='Resolved') {
    if(active) throw new Error('Validation failed: the underlying rule still triggers. Correct the local source data and revalidate.');
    if(review.status!=='Ready for Validation') throw new Error('Move this finding to Ready for Validation before closing.');
    if(!input.rootCause.trim()||!input.correctiveAction.trim()||!input.evidence.trim()) throw new Error('Resolution requires a root cause, corrective action and supporting evidence.');
  }
  if(status==='Accepted Exception' && !input.evidence.trim()) throw new Error('Document evidence for an accepted exception. It does not change quality or delivery indicators.');
  const entry=audit(input,status==='Resolved'?'Revalidated and resolved':status===review.status?'Notes / assignment updated':`Status: ${review.status} → ${status}`,timestamp);
  Object.assign(review,{status,assignee:input.assignee.trim()||'Unassigned',rootCause:input.rootCause,correctiveAction:input.correctiveAction,evidence:input.evidence});
  review.history.push(entry);return next;
}
export function correctSources(state:LabState,data:Dataset,input:ReviewInput,timestamp:string):LabState {
  const entry=audit(input,'Source correction and revalidation',timestamp);
  if(!input.evidence.trim()) throw new Error('Add supporting evidence for the source correction.');
  // Validate field types but retain invalid dates and duplicate IDs as visible integrity findings.
  const valid=z.object({orders:z.array(orderSchema),suppliers:z.array(supplierSchema)}).safeParse(data);
  if(!valid.success) throw new Error('Source fields are missing or invalid: '+valid.error.issues.map(i=>i.path.join('.')).join(', '));
  const next=structuredClone(state);
  if(JSON.stringify(state.data)===JSON.stringify(data)) throw new Error('Change a source value before saving a correction.');
  const before=JSON.stringify({orders:state.data.orders.filter(o=>JSON.stringify(o)!==JSON.stringify(data.orders.find(x=>x.record_id===o.record_id))),suppliers:state.data.suppliers.filter(s=>JSON.stringify(s)!==JSON.stringify(data.suppliers.find(x=>x.source_id===s.source_id)))});
  const after=JSON.stringify({orders:data.orders.filter(o=>JSON.stringify(o)!==JSON.stringify(state.data.orders.find(x=>x.record_id===o.record_id))),suppliers:data.suppliers.filter(s=>JSON.stringify(s)!==JSON.stringify(state.data.suppliers.find(x=>x.source_id===s.source_id)))});
  next.sourceHistory.push({...entry,before,after});
  next.data=structuredClone(data);
  const rows=analyse(data),oldRows=analyse(state.data),active=rows.flatMap(r=>r.findings);
  const changedIds=new Set([...state.data.orders,...data.orders].filter(o=>JSON.stringify(state.data.orders.find(x=>x.record_id===o.record_id))!==JSON.stringify(data.orders.find(x=>x.record_id===o.record_id))).map(o=>o.record_id));
  for(const row of rows) {
    const oldMatches=state.data.suppliers.filter(s=>s.order_id===state.data.orders.find(o=>o.record_id===row.order.record_id)?.order_id);
    if(JSON.stringify(oldMatches)!==JSON.stringify(row.supplierMatches)) changedIds.add(row.order.record_id);
    if(JSON.stringify(oldRows.find(r=>r.order.record_id===row.order.record_id)?.findings)!==JSON.stringify(row.findings)) changedIds.add(row.order.record_id);
  }
  for(const f of active) {
    if(!next.reviews[f.id]) next.reviews[f.id]={finding:f,status:'Open',assignee:f.owner,rootCause:'',correctiveAction:'',evidence:'',history:[]};
    else if(next.reviews[f.id].status==='Resolved') {
      next.reviews[f.id].status='Open';
      next.reviews[f.id].history.push({...entry,action:'Automatically reopened: rule recurred'});
    }
    next.reviews[f.id].finding=f;
  }
  for(const review of Object.values(next.reviews)) {
    if(changedIds.has(review.finding.record_id)) review.history.push({...entry,before,after});
  }
  return next;
}
export function visibleReviews(state:LabState):Review[] {
  const active=analyse(state.data).flatMap(r=>r.findings);
  return Object.values(state.reviews).map(r=>({...r,finding:active.find(f=>f.id===r.finding.id)||r.finding}));
}
export const STORAGE_KEY='planning-insight-lab:v1';
export function loadState(storage:Pick<Storage,'getItem'>):{state:LabState;warning:string} {
  try {
    const raw=storage.getItem(STORAGE_KEY);
    if(!raw) return {state:initialState(),warning:''};
    const parsed=stateSchema.safeParse(JSON.parse(raw));
    if(!parsed.success) return {state:initialState(),warning:'Saved demo data could not be read. The original fixture has been loaded; export or reset this browser demo before saving again.'};
    return {state:parsed.data as LabState,warning:''};
  } catch {return {state:initialState(),warning:'Browser storage is unavailable or contains invalid JSON. Changes are held in memory for this visit.'};}
}
