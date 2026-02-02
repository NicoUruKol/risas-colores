export default function ImageBox({
    src,
    alt = "",
    className = "",
    fit = "cover",        // "cover" | "contain"
    tone = "default",     // "default" | "soft"
    bordered = true,
    rounded = "md",       // "md" | "lg" | "xl"
    ratio = "square",     // "square" | "auto"
    }) {
    const roundedClass =
        rounded === "xl" ? "rounded-2xl" : rounded === "lg" ? "rounded-xl" : "rounded-md";

    const ratioClass = ratio === "square" ? "aspect-square" : "";

    const toneClass =
        tone === "soft"
        ? "bg-white/70"
        : "bg-gray-200";

    const borderClass = bordered ? "border border-ui-border" : "border-0";

    const fitClass = fit === "contain" ? "object-contain" : "object-cover";

    return (
        <div
        className={`${ratioClass} ${roundedClass} ${toneClass} ${borderClass} overflow-hidden ${className}`}
        >
        {src ? <img src={src} alt={alt} className={`h-full w-full ${fitClass}`} /> : null}
        </div>
    );
}

