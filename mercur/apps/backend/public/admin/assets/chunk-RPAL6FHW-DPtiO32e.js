import{dl as i,cs as o,s}from"./index-CGbMzQsL.js";var u="workflow_executions",n=i(u),w=(e,t)=>{const{data:r,...a}=o({queryFn:()=>s.admin.workflowExecution.list(e),queryKey:n.list(e),...t});return{...r,...a}},T=(e,t)=>{const{data:r,...a}=o({queryFn:()=>s.admin.workflowExecution.retrieve(e),queryKey:n.detail(e),...t});return{...r,...a}},d=["compensating","invoking"],l=["skipped","skipped_failure"],_=["done"],f=["failed","reverted","timeout","dormant"],v=["not_started"],c=["failed","reverted"],E=["invoking","waiting_to_compensate","compensating"],k=e=>{let t="green";return c.includes(e)&&(t="red"),E.includes(e)&&(t="orange"),t},g=(e,t)=>{switch(t){case"done":return e("workflowExecutions.state.done");case"failed":return e("workflowExecutions.state.failed");case"reverted":return e("workflowExecutions.state.reverted");case"invoking":return e("workflowExecutions.state.invoking");case"waiting_to_compensate":return e("workflowExecutions.transaction.state.waitingToCompensate");case"compensating":return e("workflowExecutions.state.compensating");case"not_started":return e("workflowExecutions.state.notStarted")}};export{v as S,k as a,T as b,f as c,d,_ as e,l as f,g,w as u,n as w};
