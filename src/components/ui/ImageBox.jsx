export default function ImageBox({ src, alt = "", className = "" }) {
    return (
        <div className={`aspect-square rounded-md bg-gray-200 border border-ui-border overflow-hidden ${className}`}>
        {src ? (
            <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : null}
        </div>
    );
}
