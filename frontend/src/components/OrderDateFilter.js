import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const OrderDateFilter = ({ onApply }) => {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- APPLY ---------------- */
  const handleApply = () => {
    const start = format(range[0].startDate, "yyyy-MM-dd");
    const end = format(range[0].endDate, "yyyy-MM-dd");

    onApply(start, end);
    setOpen(false); // ✅ CLOSE AFTER APPLY
  };

  /* ---------------- INPUT LABEL ---------------- */
  const label =
    format(range[0].startDate, "dd MMM yyyy") +
    (range[0].endDate &&
    range[0].endDate.toDateString() !==
      range[0].startDate.toDateString()
      ? " - " + format(range[0].endDate, "dd MMM yyyy")
      : "");

  return (
    <div className="relative" ref={wrapperRef}>
      {/* INPUT */}
      <input
        readOnly
        value={label}
        onClick={() => setOpen(!open)}
        placeholder="Select date"
        className="border px-4 py-2 rounded-lg text-sm cursor-pointer w-[230px] bg-white"
      />

      {/* CALENDAR */}
      {open && (
        <div className="absolute z-50 mt-2 bg-white shadow-xl rounded-xl">
          <div className="p-3">
            <DateRange
              ranges={range}
              onChange={(item) => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              editableDateInputs={true}
              months={1}
              direction="vertical"
              showDateDisplay={false}
            />

            <button
              onClick={handleApply}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDateFilter;
