export default function Container({ className = "", children }) {
    return (
        <div className={`mx-auto w-full max-w-[1200px] px-4 ${className}`}>
            {children}
        </div>
    );
}
