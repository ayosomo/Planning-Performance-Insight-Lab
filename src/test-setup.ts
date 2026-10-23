import '@testing-library/jest-dom/vitest';
// jsdom does not implement native dialog modality. Browser QA verifies focus containment.
Object.defineProperty(HTMLDialogElement.prototype,'showModal',{configurable:true,value:function(){this.setAttribute('open','');}});
Object.defineProperty(HTMLDialogElement.prototype,'close',{configurable:true,value:function(){this.removeAttribute('open');}});
