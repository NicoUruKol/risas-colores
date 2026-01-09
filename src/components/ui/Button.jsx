export default function Button({
    variant = "primary",
    size = "md",
    className = "",
    ...props
    }) {
    const base =
        "inline-flex items-center justify-center font-semibold rounded-md transition active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed";

    const sizes = {
        sm: "h-10 px-3 text-sm",
        md: "h-12 px-4 text-sm",
    };

    const variants = {
        primary:
        "bg-brand-orange text-white hover:bg-brand-orangeHover shadow-card",
        secondary:
        "bg-brand-blue text-white hover:brightness-95 shadow-card",
        ghost:
        "bg-transparent border border-ui-border text-ui-text hover:shadow-card",
    };

    return (
        <button
        {...props}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        />
    );
}
