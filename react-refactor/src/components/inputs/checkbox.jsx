import React, { useState, useEffect } from "react";

const Checkbox = React.memo(({ checked = false, onClick }) => {
    const [active, setActive] = useState(checked);
    
    useEffect(() => {
        setActive(checked);
    }, [checked]);

    const handleClick = () => {
        const newValue = !active;
        setActive(newValue);
        onClick?.(newValue);
    };

    return (
        <div className="checkbox" style={{cursor: "pointer"}} onClick={handleClick}>
            <div className={active ? "active" : ""} />
        </div>
    );
});

export default Checkbox;