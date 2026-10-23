import {useEffect,useRef} from 'react';
export function Badge({children,tone='neutral'}:{children:React.ReactNode;tone?:string}) {return <span className={'badge '+tone}>{children}</span>;}
export function ResetDialog({onClose,onReset}:{onClose:()=>void;onReset:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const d=ref.current!;if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');return ()=>{if(typeof d.close==='function')d.close();};},[]);
  return <dialog ref={ref} className="reset-dialog" aria-labelledby="reset-title" onCancel={onClose}><h2 id="reset-title">Reset this browser demo?</h2><p>This clears local corrections, review statuses and audit history. Export the audit first if you want to keep a copy.</p><div className="button-row"><button className="secondary" autoFocus onClick={onClose}>Keep my changes</button><button className="primary" onClick={onReset}>Reset to original fixture</button></div></dialog>;
}
