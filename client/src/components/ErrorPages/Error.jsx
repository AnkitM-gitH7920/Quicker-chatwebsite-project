import "../../css/server-errorpage.css"

import { useNavigate } from "react-router-dom";

export default function ServerErrorPage(){
  const navigate = useNavigate();

  return (
    <div className="se-wrapper">
      <div className="se-card">
        <span className="se-code">Error code : 500</span>

        <h2 className="se-title">Something Went Wrong</h2>
        <p className="se-text">
          Our servers are having a bad day 😔 <br />
          Please try again in a moment.
        </p>

        <div className="se-actions">
          <button className="se-btn primary" onClick={() => window.location.reload()}>
            Try again
          </button>
          <button className="se-btn ghost" onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};
