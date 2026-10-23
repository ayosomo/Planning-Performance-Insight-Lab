import {analyse,baseline,metrics,orderSchema,supplierSchema,workbookControls,SNAPSHOT,type Dataset} from './engine';

export function assessSnapshot(data:Dataset) {
  const rows=analyse(data),controls=workbookControls(data),findings=rows.flatMap(row=>row.findings);
  return {
    snapshot:SNAPSHOT,source:'committed-synthetic-fixture' as const,synthetic:true as const,
    population:{crmRows:data.orders.length,supplierRows:data.suppliers.length,accounts:new Set(data.orders.map(row=>row.account_id)).size},
    schemaValid:data.orders.every(row=>orderSchema.safeParse(row).success)&&data.suppliers.every(row=>supplierSchema.safeParse(row).success),
    workbookComparison:{pass:controls.filter(row=>!row.fail).length,review:controls.filter(row=>row.fail).length,overdue:controls.filter(row=>row.overdue).length,escalation:controls.filter(row=>row.escalate).length},
    metrics:metrics(rows),
    findingsByRule:Object.fromEntries([...new Set(findings.map(f=>f.rule_id))].sort().map(rule=>[rule,findings.filter(f=>f.rule_id===rule).length])),
  };
}
export function summarizeSnapshot(assessment:ReturnType<typeof assessSnapshot>) {
  const checks=[
    {name:'CRM population',actual:assessment.population.crmRows,expected:240},
    {name:'Supplier population',actual:assessment.population.supplierRows,expected:236},
    {name:'Fictional accounts',actual:assessment.population.accounts,expected:35},
    {name:'Workbook PASS',actual:assessment.workbookComparison.pass,expected:208},
    {name:'Workbook REVIEW',actual:assessment.workbookComparison.review,expected:32},
    {name:'Workbook overdue',actual:assessment.workbookComparison.overdue,expected:69},
    {name:'Workbook escalation',actual:assessment.workbookComparison.escalation,expected:92},
    {name:'Integrity passing rows',actual:assessment.metrics.pass,expected:228},
    {name:'Integrity failing rows',actual:assessment.metrics.fail,expected:12},
  ].map(check=>({...check,pass:check.actual===check.expected}));
  return {...assessment,checks,baselineMatches:assessment.schemaValid&&checks.every(check=>check.pass),
    interpretation:'Known integrity and delivery findings are intentional synthetic examples. Baseline matching does not mean every row is reliable.',
    limitations:['Fixed synthetic snapshot; no live source refresh.','Browser-local reviewer corrections are not uploaded or assessed.','Actual completion dates are unavailable; forecasts are separate from actual delivery performance.']};
}
export type SnapshotQaSummary=ReturnType<typeof summarizeSnapshot>;
export const snapshotQaBaseline=()=>summarizeSnapshot(assessSnapshot(baseline));
