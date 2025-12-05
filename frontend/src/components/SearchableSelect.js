import React, { useState, useEffect, useRef } from "react";

const SearchableSelect = ({ options = [], value, onChange, placeholder }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Update selected value preview
  useEffect(() => {
    const selected = options.find((o) => o._id === value);
    setQuery(selected ? selected.displayName : "");
  }, [value, options]);

  // Filter options
  const filtered = options.filter((o) =>
    o.displayName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        className="w-full border p-2 rounded"
        onFocus={() => setOpen(true)}
      />

      {open && (
        <ul className="absolute w-full bg-white border rounded mt-1 max-h-48 overflow-auto shadow-xl z-50">
          {filtered.length === 0 && (
            <li className="p-2 text-gray-500 text-sm">No results</li>
          )}

          {filtered.map((o) => (
            <li
              key={o._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(o._id);
                setQuery(o.displayName);
                setOpen(false);
              }}
            >
              {o.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;
