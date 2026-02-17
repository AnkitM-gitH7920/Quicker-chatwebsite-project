import { useNavigate } from "react-router-dom";
import "../../css/not-foundpage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="nf-wrapper">
      <div className="nf-box">
        <div className="nf-badge">Error code : 404</div>

        <h2 className="nf-heading">Resource not found</h2>
        <p className="nf-subtext">
          This resource is either deleted or not available at the moment
        </p>

        <div className="nf-buttons">
          <button className="nf-btn primary" onClick={() => window.location.reload()}>
            Try again
          </button>
          <button className="nf-btn ghost" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};