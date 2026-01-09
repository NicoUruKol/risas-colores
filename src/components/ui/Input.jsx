export default function Input({ label, helper, error, ...props }) {
    return (
        <div className="input-group">
            {label && <div className="label">{label}</div>}
            <input className="input" {...props} />
            {error ? (
                <div className="helper-error">{error}</div>
            ) : helper ? (
                <div className="helper">{helper}</div>
            ) : null}
        </div>
    );
}
