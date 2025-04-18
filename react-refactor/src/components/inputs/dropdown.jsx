import React, { useEffect, useRef, useState } from "react";
import usei18n from "../../hooks/usei18n";

const DropdownMenu = React.memo(({ options, placeholder = 'choose_case', onSelect }) => {
    const [isOpen, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [holder, setHolder] = useState("");
    const [cases, setCases] = useState([]);

    const dropdownRef = useRef(null);
    const { t } = usei18n();
    const toggleDropdown = () => setOpen(prev => !prev);

    const handleSelect = (value) => {
        t(value).then(setSelected);
        onSelect?.(value);
        setOpen(false);
    };

    // If clickes outside of dropbox if it was opened
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target))
                setOpen(false);
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Translate the options and placeholder tags for rendering
    useEffect(() => {
        Promise.all(options.map(option => t(option))).then(setCases);
        t(placeholder).then(setHolder);
    }, [options, placeholder])

    return (
        <div ref={dropdownRef} className="dropdown">
            <div 
                className="dropdown-header" 
                onClick={toggleDropdown} 
                style={{cursor: "pointer"}}
            >
                {selected || holder}
            </div>

            {isOpen && (
                <ul className="dropdown-menu">
                    {cases.map((item, index) => (
                        <li key={`drop_${index}`}
                            onClick={() => handleSelect(options[index])}
                            className={ item === selected ? 'selected' : ''}
                            style={{cursor: "pointer"}}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

export default DropdownMenu;