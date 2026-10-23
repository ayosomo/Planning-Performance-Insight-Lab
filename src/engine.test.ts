import {describe,expect,it} from 'vitest';
import {analyse,baseline,dateMs,metrics,pct,workbookControls,type Dataset,type Order,type Supplier} from './engine';
export const order:Order={record_id:'CRM-4',order_id:'ORD-1',account_id:'Account 01',region:'North',service:'Ethernet',planned_date:'2026-11-01',crm_status:'Planned',approval:'Yes',owner:'Owner 1',constraint:'None'};
export const supplier:Supplier={source_id:'SUP-4',order_id:'ORD-1',supplier_status:'Waiting',supplier_eta:'2026-11-01',permit:'Yes',supplier:'Supplier A',last_updated:'2026-10-22'};
export const sample=(o:Partial<Order>={},s:Partial<Supplier>={}):Dataset=>({orders:[{...order,...o}],suppliers:[{...supplier,...s}]});
describe('reproducible workbook parity',()=>{
  it('retains all CRM rows, source rows and fictional groups',()=>{expect(baseline.orders).toHaveLength(240);expect(baseline.suppliers).toHaveLength(236);expect(new Set(baseline.orders.map(o=>o.account_id)).size).toBe(35);expect(analyse(baseline)).toHaveLength(240);});
  it('independently reproduces the workbook combined controls and overdue population',()=>{const a=workbookControls(baseline);expect(a.filter(x=>!x.fail)).toHaveLength(208);expect(a.filter(x=>x.fail)).toHaveLength(32);expect(a.filter(x=>x.overdue)).toHaveLength(69);expect(a.filter(x=>x.escalate)).toHaveLength(92);});
  it('is independent of the current clock and leaves source objects unchanged',()=>{const before=JSON.stringify(baseline);expect(analyse(baseline)).toEqual(analyse(baseline));expect(JSON.stringify(baseline)).toBe(before);});
});
describe('integrity controls',()=>{
  it('flags both duplicate CRM rows without silently deduplicating',()=>{const d=sample();d.orders.push({...order,record_id:'CRM-5'});const r=analyse(d);expect(r).toHaveLength(2);expect(r.every(r=>!r.qualityPass)).toBe(true);expect(r.flatMap(r=>r.findings).filter(f=>f.rule_id==='DUPLICATE_ORDER_ID')).toHaveLength(2);});
  it('retains a missing supplier row as a critical issue',()=>{const d=sample();d.suppliers=[];const [r]=analyse(d);expect(r.order.order_id).toBe('ORD-1');expect(r.qualityPass).toBe(false);expect(r.readiness).toBe('Unknown');expect(r.findings.map(f=>f.rule_id)).toContain('SUPPLIER_RECORD_MISSING');});
  it('keeps all ambiguous supplier matches and excludes their KPI row',()=>{const d=sample();d.suppliers.push({...supplier,source_id:'SUP-5'});const [r]=analyse(d);expect(r.supplierMatches).toHaveLength(2);expect(r.qualityPass).toBe(false);expect(metrics([r]).open).toBe(0);});
  it('fails conflicting completion statuses',()=>{const [r]=analyse(sample({crm_status:'Completed'}));expect(r.findings.map(f=>f.rule_id)).toContain('COMPLETION_CONFLICT');expect(r.qualityPass).toBe(false);});
  it('flags missing essential columns instead of dropping a record',()=>{const d=sample();delete (d.orders[0] as Partial<Order>).owner;const r=analyse(d);expect(r).toHaveLength(1);expect(r[0].findings.map(f=>f.rule_id)).toContain('INVALID_RECORD');});
  it.each(['2026-02-30','not-a-date','2026-2-01',''])('rejects invalid calendar date %s',date=>{expect(dateMs(date)).toBeNull();expect(analyse(sample({planned_date:date}))[0].qualityPass).toBe(false);});
  it('accepts leap dates and rejects invalid snapshot dates',()=>{expect(dateMs('2024-02-29')).not.toBeNull();expect(()=>analyse(sample(),'2026-02-30')).toThrow();});
  it('checks supplier update dates and ETA dates',()=>{const [r]=analyse(sample({}, {last_updated:'2026-02-30',supplier_eta:'bad'}));expect(r.findings.filter(f=>f.rule_id.startsWith('INVALID_DATE'))).toHaveLength(2);});
});
describe('independent operational indicators',()=>{
  it('a known absent approval remains reliable but blocked and at risk',()=>{const [r]=analyse(sample({approval:'No'}));expect(r.qualityPass).toBe(true);expect(r.readiness).toBe('Blocked');expect(r.performance).toBe('At risk');});
  it('a known absent permit remains reliable but blocked',()=>{const [r]=analyse(sample({}, {permit:'No'}));expect(r.qualityPass).toBe(true);expect(r.readiness).toBe('Blocked');});
  it('does not infer a live blocker from a constraint category alone',()=>{expect(analyse(sample({constraint:'Technical'}))[0].readiness).toBe('Ready');expect(analyse(sample({constraint:'Technical',crm_status:'Blocked'}, {supplier_status:'Blocked'}))[0].readiness).toBe('Blocked');});
  it('uses strictly greater than 14 days for the ETA-drift finding',()=>{const fourteen=analyse(sample({}, {supplier_eta:'2026-11-15'}))[0],fifteen=analyse(sample({}, {supplier_eta:'2026-11-16'}))[0];expect(fourteen.findings.map(f=>f.rule_id)).not.toContain('ETA_DRIFT');expect(fifteen.findings.map(f=>f.rule_id)).toContain('ETA_DRIFT');expect(fifteen.qualityPass).toBe(true);expect(fourteen.performance).toBe('At risk');});
  it('treats a target on the fixed snapshot as not overdue',()=>{expect(analyse(sample({planned_date:'2026-10-23'},{supplier_eta:'2026-10-23'}))[0].overdueDays).toBe(0);});
  it('overdue takes precedence over other delivery warnings',()=>{const [r]=analyse(sample({planned_date:'2026-10-22',approval:'No'},{supplier_eta:'2026-11-20'}));expect(r.overdueDays).toBe(1);expect(r.performance).toBe('Overdue');expect(r.qualityPass).toBe(true);});
  it('completed records are not open overdue or an invented actual on-time outcome',()=>{const [r]=analyse(sample({crm_status:'Completed',planned_date:'2026-10-01'},{supplier_status:'Completed'}));expect(r.overdueDays).toBe(0);expect(r.performance).toBe('Not assessed');expect(r.readiness).toBe('Not applicable');expect(metrics([r]).open).toBe(0);});
});
describe('metric denominators',()=>{
  it('keeps critical rows in quality denominators and excludes them from trusted operational KPIs',()=>{const d=sample();d.orders.push({...order,record_id:'CRM-5',order_id:'ORD-2'});const m=metrics(analyse(d));expect(m.total).toBe(2);expect(m.passRate).toBe('50.0%');expect(m.fail).toBe(1);expect(m.open).toBe(1);expect(m.readinessRate).toBe('100.0%');expect(m.forecastRate).toBe('100.0%');});
  it('returns unavailable for empty denominators',()=>{expect(pct(0,0)).toBe('N/A');expect(metrics([]).forecastRate).toBe('N/A');});
  it('forecast adherence includes equality and only uses trusted open records',()=>{const d=sample();d.orders.push({...order,record_id:'CRM-5',order_id:'ORD-2'});d.suppliers.push({...supplier,source_id:'SUP-5',order_id:'ORD-2',supplier_eta:'2026-11-02'});const m=metrics(analyse(d));expect(m.onSchedule).toBe(1);expect(m.forecastTotal).toBe(2);expect(m.forecastRate).toBe('50.0%');});
});
