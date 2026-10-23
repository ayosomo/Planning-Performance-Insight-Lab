import {useEffect,useState} from 'react';
import type {SnapshotQaSummary} from './snapshot-qa';

const key='insight-lab-snapshot-qa-run';
type Run={runId:string;status:string;summary?:SnapshotQaSummary};
export function SnapshotQaPanel(){
  const [run,setRun]=useState<Run|null>(()=>{try{const runId=sessionStorage.getItem(key);return runId?{runId,status:'pending'}:null;}catch{return null;}});
  const [starting,setStarting]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  const active=run?.status==='pending'||run?.status==='running';
  useEffect(()=>{
    if(!run?.runId||!active)return;
    const controller=new AbortController();let timer:ReturnType<typeof setTimeout>;
    const poll=async()=>{
      try{
        const response=await fetch(`/api/qa-runs/${encodeURIComponent(run.runId)}`,{signal:controller.signal,cache:'no-store'});
        if(!response.ok)throw Error(response.status===404?'This run is unavailable. Start a new snapshot check.':'The run status could not be loaded. Try checking again.');
        const next:Run=await response.json();
        if(controller.signal.aborted)return;
        setRun(next);setError('');
        if(['pending','running'].includes(next.status))timer=setTimeout(poll,1000);
      }catch(cause){if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:'The run status could not be loaded.');}
    };
    void poll();return()=>{controller.abort();clearTimeout(timer);};
  },[run?.runId,active,retry]);
  async function start(){
    setStarting(true);setError('');
    try{
      const response=await fetch('/api/qa-runs',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
      if(!response.ok)throw Error('The snapshot check could not be started. Please try again.');
      const next:Run=await response.json();setRun(next);
      try{sessionStorage.setItem(key,next.runId);}catch{/* The run remains available in this view. */}
    }catch(cause){setError(cause instanceof Error?cause.message:'The snapshot check could not be started.');}
    finally{setStarting(false);}
  }
  function download(){
    const url=URL.createObjectURL(new Blob([JSON.stringify({runId:run?.runId,...run?.summary},null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='synthetic-snapshot-qa.json';a.click();URL.revokeObjectURL(url);
  }
  const status=starting?'Starting':run?.status==='completed'?'Complete':run?.status==='failed'?'Failed':run?.status==='cancelled'?'Cancelled':active?'Running':'Not started';
  return <section className="panel snapshot-qa" aria-label="Synthetic snapshot workflow">
    <div className="panel-heading"><div><span className="eyebrow">DURABLE SNAPSHOT CHECK</span><h2>Validate the synthetic baseline</h2></div><span className="badge" role="status">{status}</span></div>
    <div className="snapshot-qa-body"><p>Run the source controls and generate a QA summary for the committed 240-row synthetic snapshot. Your browser-local review changes stay separate.</p>
      <div className="button-row"><button className="primary" disabled={starting||(active&&!error)} onClick={()=>void start()}>{starting?'Starting…':active&&!error?'Checking snapshot…':'Run snapshot QA'}</button>{run?.summary&&<button className="secondary" onClick={download}>Download QA summary</button>}{error&&<button className="secondary" onClick={()=>setRetry(value=>value+1)}>Check status again</button>}</div>
      {error&&<p role="alert">{error}</p>}
      {run?.status==='failed'&&<p role="alert">The workflow did not complete. Start a new check to try again.</p>}
      {run?.summary&&<div className="snapshot-qa-result"><strong>{run.summary.baselineMatches?'Expected synthetic baseline confirmed':'Baseline differences need review'}</strong><p>{run.summary.population.crmRows} CRM rows · {run.summary.population.supplierRows} supplier rows · {run.summary.population.accounts} fictional accounts</p><p>Workbook: {run.summary.workbookComparison.pass} PASS / {run.summary.workbookComparison.review} REVIEW. Integrity: {run.summary.metrics.pass} passing / {run.summary.metrics.fail} failing.</p><p className="small">Known demo findings remain visible. Actual on-time performance is unavailable.</p></div>}
    </div>
  </section>;
}
