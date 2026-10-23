import {baseline,type Dataset} from '../src/engine';
import {assessSnapshot,summarizeSnapshot} from '../src/snapshot-qa';

export async function validateSyntheticSnapshot() {
  'use workflow';
  const data=await loadSyntheticFixture();
  const assessment=await assessSyntheticFixture(data);
  return await produceQaSummary(assessment);
}
async function loadSyntheticFixture() {
  'use step';
  console.log('Snapshot QA: loading the committed synthetic fixture.');
  return structuredClone(baseline);
}
async function assessSyntheticFixture(data:Dataset) {
  'use step';
  console.log('Snapshot QA: assessing source controls and independent indicators.');
  return assessSnapshot(data);
}
async function produceQaSummary(assessment:ReturnType<typeof assessSnapshot>) {
  'use step';
  const summary=summarizeSnapshot(assessment);
  console.log('Snapshot QA complete.',{baselineMatches:summary.baselineMatches,crmRows:summary.population.crmRows});
  return summary;
}
