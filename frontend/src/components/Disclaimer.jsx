export default function Disclaimer({ compact = false }) {
  return (
    <div className={compact ? "disclaimer compact" : "disclaimer"} role="note">
      <strong>This is a student project, not a medical diagnosis.</strong>{" "}
      {!compact && (
        <>
          The result comes from an AI model that can be wrong. Only a doctor can tell you what a
          skin spot really is.
        </>
      )}
    </div>
  );
}
