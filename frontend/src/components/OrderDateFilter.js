import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const OrderDateFilter = ({ fromDate, toDate, onApply, onClear }) => {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

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
    onApply(
      format(range[0].startDate, "yyyy-MM-dd"),
      format(range[0].endDate, "yyyy-MM-dd")
    );
    setOpen(false);
  };

  /* ---------------- CLEAR ---------------- */
  const handleClear = () => {
    onClear();
    setOpen(false);
  };

  /* ---------------- LABEL ---------------- */
  let label = "Select dates";

  if (fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);

    const sameDay = start.toDateString() === end.toDateString();
    const sameYear = start.getFullYear() === end.getFullYear();

    if (sameDay) {
      label = format(start, "dd MMM yyyy");
    } else if (sameYear) {
      label = `${format(start, "dd MMM")} – ${format(end, "dd MMM yyyy")}`;
    } else {
      label = `${format(start, "dd MMM yyyy")} – ${format(end, "dd MMM yyyy")}`;
    }
  }

  /* ---------------- OPEN HANDLER ---------------- */
  const handleOpen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      left: rect.right - 340,
    });
    setOpen((prev) => !prev);
  };

  return (
    <div ref={wrapperRef}>
      {/* INPUT BUTTON */}
      <button
        onClick={handleOpen}
        className="h-9 w-40 px-3 rounded-md border border-gray-300 bg-white
                   hover:bg-gray-50 text-xs font-medium text-gray-700
                   flex items-center gap-2"
      >
        <Calendar size={14} className="text-gray-500 shrink-0" />
        <span className="max-w-[120px] truncate whitespace-nowrap">
          {label}
        </span>
      </button>

      {/* CALENDAR (FIXED POSITION — NO SCROLL) */}
      {open && (
        <div
          className="fixed z-[9999] bg-white rounded-xl shadow-2xl border w-[340px]"
          style={{ top: pos.top, left: pos.left }}
        >
          {/* Calendar body */}
          <div className="p-3">
            <DateRange
              ranges={range}
              onChange={(item) => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              editableDateInputs={false}
              months={1}
              direction="horizontal"
              showDateDisplay={false}
              rangeColors={["#2563eb"]}
            />
          </div>

          {/* Footer buttons */}
          <div className="flex gap-2 p-3 border-t bg-gray-50 rounded-b-xl">
            <button
              onClick={handleApply}
              className="flex-1 bg-blue-600 hover:bg-blue-700
                         text-white py-1.5 rounded-md text-xs font-medium"
            >
              Apply
            </button>

            <button
              onClick={handleClear}
              className="flex-1 bg-white border hover:bg-gray-100
                         text-gray-700 py-1.5 rounded-md text-xs font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDateFilter;
