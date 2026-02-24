import "../../css/server-errorpage.css"

import { useNavigate, useLocation } from "react-router-dom";

export default function ServerErrorPage() {
     const navigate = useNavigate();
     const location = useLocation();

     const errorState = {
          message: location.state?.message,
          status: location.state?.status || 500,
          title: location.state?.title || "Server Error",
          retryURL: location.state?.retryURL || "/error",
          goBackURL: location.state?.goBackURL || -1
     }

     return (
          <div className="se-wrapper">
               <div className="se-card">
                    <span className="se-code">Error code : {errorState.status}</span>

                    <h2 className="se-title">{errorState.title}</h2>
                    <p className="se-text">
                         {
                              errorState.message || "We're sorry, but something went wrong on our end. Please try again later or contact support if the issue persists."
                         }

                    </p>

                    <div className="se-actions">
                         <button className="se-btn primary" onClick={() => window.location.href = errorState.retryURL}>
                              Try again
                         </button>
                         <button className="se-btn ghost" onClick={() => navigate(location.state?.goBackURL || -1)}>
                              Go back
                         </button>
                    </div>
               </div>
          </div>
     );
};
