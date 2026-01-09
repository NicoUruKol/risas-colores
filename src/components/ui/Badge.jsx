export default function Badge({ variant = "blue", children, className = "" }) {
    const map = {
        blue: "bg-ui-tintBlue",
        orange: "bg-ui-tintOrange",
        lavender: "bg-ui-tintLavender",
    };

    return (
        <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-ui-border text-ui-text ${map[variant]} ${className}`}
        >
        {children}
        </span>
    );
}

