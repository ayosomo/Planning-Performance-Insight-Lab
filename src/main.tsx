import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<main className="fatal"><h1>The lab could not load</h1><p>Reload the page to retry. Your browser demo is separate from the original fixture.</p><button onClick={()=>location.reload()}>Reload lab</button></main>:this.props.children;}
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>);
