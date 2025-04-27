import React from "react";

const TextInput = React.memo(({ placeholder = "", value = "", onChange }) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <input
      className="text-input"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  );
});

export default TextInput;