import { forwardRef } from "react";

const Card = forwardRef(
    ({ title, children, className = "", ...props }, ref) => {
        return (
        <div ref={ref} {...props} className={`card ${className}`}>
            {title && <h3 className="card-title">{title}</h3>}
            {children}
        </div>
        );
    }
);

export default Card;
