interface Props {
  type: "loading" | "error";
  message?: string;
}

export function StatusMessage({ type, message }: Props) {
  if (type === "loading") {
    return (
      <div className="status" role="status">
        <span className="spinner" aria-hidden="true" />
        <span>{message ?? "טוען נתונים…"}</span>
      </div>
    );
  }
  return (
    <div className="status status--error" role="alert">
      <strong>שגיאה:</strong> {message}
    </div>
  );
}
