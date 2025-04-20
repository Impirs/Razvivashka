import React from "react";

const TextInput = ({ placeholder = "", value = "", onChange }) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  );
};

export default TextInput;