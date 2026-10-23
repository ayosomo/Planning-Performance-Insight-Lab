import { z } from 'zod';
import fixture from './data/fixture.json';

export const SNAPSHOT = '2026-10-23';
export const DAY = 86_400_000;
export const statuses = ['Planned','Ready','Provisioning','Blocked','Completed'] as const;
export const supplierStatuses = ['Waiting','Scheduled','On track','In flight','Blocked','Completed'] as const;
const text = z.string().min(1);
export const orderSchema = z.object({record_id:text, order_id:text, account_id:text, region:text, service:text, planned_date:text, crm_status:z.enum(statuses), approval:z.enum(['Yes','No']), owner:text, constraint:text});
export const supplierSchema = z.object({source_id:text,order_id:text,supplier_status:z.enum(supplierStatuses),supplier_eta:text,permit:z.enum(['Yes','No']),supplier:text,last_updated:text});
export type Order = z.infer<typeof orderSchema>;
export type Supplier = z.infer<typeof supplierSchema>;
export type Dataset = { orders: Order[]; suppliers: Supplier[] };
export const baseline: Dataset = {orders: fixture.orders as Order[], suppliers: fixture.suppliers as Supplier[]};
export type Category = 'Integrity' | 'Readiness' | 'Performance';
export type Severity = 'Critical' | 'High' | 'Medium';
export type Finding = {id:string;record_id:string;order_id:string;rule_id:string;category:Category;severity:Severity;issue:string;evidence:string;owner:string;next_action:string};
export type Assessment = {order:Order; supplier:Supplier | undefined; supplierMatches:Supplier[]; findings:Finding[];qualityPass:boolean;readiness:'Ready'|'Blocked'|'Unknown'|'Not applicable';performance:'On track'|'At risk'|'Overdue'|'Unknown'|'Not assessed';overdueDays:number};

export function dateMs(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const ms = Date.parse(value+'T00:00:00Z');
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0,10)===value ? ms : null;
}
export function analyse(data:Dataset, snapshot=SNAPSHOT):Assessment[] {
  const asOf=dateMs(snapshot); if(asOf===null) throw new Error('Snapshot must be an ISO calendar date.');
  const counts=new Map<string,number>();
  for(const o of data.orders) counts.set(o.order_id,(counts.get(o.order_id)||0)+1);
  return data.orders.map(order=>{
    const matches=data.suppliers.filter(s=>s.order_id===order.order_id);
    const supplier=matches[0];
    const findings:Finding[]=[];
    const add=(rule_id:string,category:Category,severity:Severity,issue:string,evidence:string,next_action:string)=>findings.push({id:order.record_id+':'+rule_id,record_id:order.record_id,order_id:order.order_id,rule_id,category,severity,issue,evidence,owner:order.owner||'Unassigned',next_action});
    const parsed=orderSchema.safeParse(order);
    if(!parsed.success) add('INVALID_RECORD','Integrity','Critical','Essential CRM fields missing or invalid',parsed.error.issues.map(i=>i.path.join('.')+': '+i.message).join('; '),'Correct the named essential source fields.');
    if((counts.get(order.order_id)||0)>1) add('DUPLICATE_ORDER_ID','Integrity','Critical','Duplicate order identifier',`${counts.get(order.order_id)} CRM rows share ${order.order_id}. Rows remain separate.`,'Verify the intended ID for every duplicate row. Do not delete the evidence.');
    if(matches.length===0) add('SUPPLIER_RECORD_MISSING','Integrity','Critical','Supplier record missing','No supplier-feed match for this CRM order ID.','Add the verified synthetic supplier record or correct the join key.');
    if(matches.length>1) add('SUPPLIER_DUPLICATE_ID','Integrity','Critical','Ambiguous supplier match',`${matches.length} supplier rows match. First row is a preview only; all matches remain visible.`,'Correct duplicate supplier identifiers before trusting the join.');
    for(const s of matches) {
      const p=supplierSchema.safeParse(s);
      if(!p.success) add('INVALID_SUPPLIER_'+s.source_id,'Integrity','Critical','Essential supplier fields missing or invalid',p.error.issues.map(i=>i.path.join('.')+': '+i.message).join('; '),'Correct the named supplier source fields.');
      for(const key of ['supplier_eta','last_updated'] as const) if(dateMs(s[key])===null) add('INVALID_DATE_'+s.source_id+'_'+key,'Integrity','Critical','Supplier date is invalid',`${key}: ${s[key]}`,'Enter a real ISO calendar date (YYYY-MM-DD).');
    }
    const target=dateMs(order.planned_date), eta=supplier?dateMs(supplier.supplier_eta):null;
    if(target===null) add('INVALID_TARGET_DATE','Integrity','Critical','Target date is invalid',`planned_date: ${order.planned_date}`,'Enter a real ISO calendar date (YYYY-MM-DD).');
    const conflict=matches.some(s=>(order.crm_status==='Completed')!==(s.supplier_status==='Completed'));
    if(conflict) add('COMPLETION_CONFLICT','Integrity','Critical','Conflicting completion statuses',`CRM: ${order.crm_status}; supplier: ${matches.map(s=>s.supplier_status).join(', ')}`,'Investigate and reconcile the source completion statuses.');
    const open=order.crm_status!=='Completed';
    if(open && order.approval==='No') add('CUSTOMER_APPROVAL_MISSING','Readiness','High','Customer approval outstanding','Approval is explicitly recorded as No. The data can still be reliable.','Obtain customer sign-off and update the approval field.');
    if(open && supplier?.permit==='No') add('PERMIT_MISSING','Readiness','High','Required permit outstanding','Permit: No. Demo assumption: every open order requires a permit.','Obtain permission and update the permit field.');
    if(open && order.crm_status==='Blocked') add('DELIVERY_BLOCKER','Readiness','High','Delivery prerequisite blocked',`Recorded constraint: ${order.constraint}`,'Investigate the stated prerequisite; update the source status when cleared.');
    if(open && target!==null && eta!==null && (eta-target)/DAY>14) add('ETA_DRIFT','Performance','Medium','Supplier ETA drift exceeds 14 days',`${Math.round((eta-target)/DAY)} days after target. Illustrative threshold, not an SLA.`,'Agree a recovery plan or a documented revised forecast.');
    const overdueDays=open && target!==null && target<asOf ? Math.round((asOf-target)/DAY):0;
    if(overdueDays>0) add('OVERDUE_OPEN_ORDER','Performance','High','Open order past target',`${overdueDays} days overdue at ${snapshot}.`,'Confirm delivery position and escalate the next action.');
    const readiness:Assessment['readiness']=!open?'Not applicable':findings.some(f=>f.category==='Readiness')?'Blocked':!supplier||conflict||!['Yes','No'].includes(order.approval)||!['Yes','No'].includes(supplier.permit)?'Unknown':'Ready';
    const performance:Assessment['performance']=!open?'Not assessed':target===null||conflict?'Unknown':overdueDays>0?'Overdue':readiness==='Blocked'||(eta!==null&&eta>target)?'At risk':eta===null?'Unknown':'On track';
    return {order,supplier,supplierMatches:matches,findings,qualityPass:!findings.some(f=>f.category==='Integrity'),readiness,performance,overdueDays};
  });
}
export const pct=(n:number,d:number)=>d===0?'N/A':(100*n/d).toFixed(1)+'%';
export function metrics(rows:Assessment[]) {
  const trusted=rows.filter(r=>r.qualityPass), open=trusted.filter(r=>r.order.crm_status!=='Completed');
  const forecast=open.filter(r=>dateMs(r.order.planned_date)!==null && r.supplier && dateMs(r.supplier.supplier_eta)!==null);
  const ready=open.filter(r=>r.readiness==='Ready').length;
  const onSchedule=forecast.filter(r=>dateMs(r.supplier!.supplier_eta)!<=dateMs(r.order.planned_date)!).length;
  return {total:rows.length,pass:trusted.length,fail:rows.length-trusted.length,open:open.length,ready,readinessRate:pct(ready,open.length),passRate:pct(trusted.length,rows.length),forecastTotal:forecast.length,onSchedule,forecastRate:pct(onSchedule,forecast.length),overdue:open.filter(r=>r.performance==='Overdue').length,blocked:open.filter(r=>r.readiness==='Blocked').length,atRisk:open.filter(r=>r.performance==='At risk').length,completed:trusted.filter(r=>r.order.crm_status==='Completed').length};
}
export function workbookControls(data:Dataset) {
  return data.orders.map(o=>{
    const s=data.suppliers.find(s=>s.order_id===o.order_id);
    const duplicate=data.orders.filter(x=>x.order_id===o.order_id).length>1;
    const drift=s&&dateMs(s.supplier_eta)!-dateMs(o.planned_date)!>14*DAY;
    const fail=duplicate||!s||o.approval==='No'||s.permit==='No'||!!drift;
    const overdue=o.crm_status!=='Completed'&&dateMs(o.planned_date)!<dateMs(SNAPSHOT)!;
    return {fail,overdue,escalate:fail||overdue};
  });
}
