import React from "react";

function NavButton({ id, value = '', onClick }) {
    return (
        <button className={`nav-button ${value === '' ? "small" : "large"}`} onClick={onClick}>
            <div id={id} className="nav-btn-icon"/>
            <h2>{value}</h2>
        </button>
    );
}

export default NavButton;