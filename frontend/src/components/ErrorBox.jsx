export default function ErrorBox({ message, onRetry, retryLabel = "Try again" }) {
  if (!message) return null;
  return (
    <div className="error-box" role="alert">
      <span className="error-icon" aria-hidden="true">!</span>
      <div className="error-text">
        <p>{message}</p>
        {onRetry && (
          <button type="button" className="btn btn-small btn-outline" onClick={onRetry}>
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
