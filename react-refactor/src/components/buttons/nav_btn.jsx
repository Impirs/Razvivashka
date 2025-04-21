import React from "react";

function NavButton({ value, onClick }) {
    return (
        <button className="nav-button" onClick={onClick}>
            {value}
        </button>
    );
}

export default NavButton;