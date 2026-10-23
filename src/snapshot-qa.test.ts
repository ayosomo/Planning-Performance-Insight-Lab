import {describe,it,expect} from 'vitest';
import {baseline} from './engine';
import {assessSnapshot,snapshotQaBaseline,summarizeSnapshot} from './snapshot-qa';
describe('synthetic snapshot QA summary',()=>{
  it('distinguishes expected baseline parity from intentionally unreliable records',()=>{
    const summary=snapshotQaBaseline();
    expect(summary.baselineMatches).toBe(true);
    expect(summary.population).toEqual({crmRows:240,supplierRows:236,accounts:35});
    expect(summary.workbookComparison).toEqual({pass:208,review:32,overdue:69,escalation:92});
    expect(summary.metrics.fail).toBe(12);
    expect(summary.findingsByRule.SUPPLIER_RECORD_MISSING).toBe(4);
  });
  it('flags fixture drift instead of silently publishing a passing QA result',()=>{
    const altered=structuredClone(baseline);altered.orders.pop();
    const summary=summarizeSnapshot(assessSnapshot(altered));
    expect(summary.baselineMatches).toBe(false);
    expect(summary.checks.find(check=>check.name==='CRM population')?.pass).toBe(false);
    expect(baseline.orders).toHaveLength(240);
  });
});
