import React, { useState } from "react";
import moment from "moment";

const SalesReport = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const downloadReport = () => {
    if (!start || !end) {
      alert("Please select date range");
      return;
    }

    window.open(
      `${process.env.REACT_APP_BACKEND_URL}/daily-sales?start=${start}&end=${end}`,
      "_blank"
    );
  };

  return (
    <div className="ml-64 mt-12 p-6">
      <h1 className="text-3xl font-bold mb-4">Sales Report</h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl">

        <label className="block font-semibold mb-2">Start Date</label>
        <input
          type="date"
          onChange={(e) =>
            setStart(moment(e.target.value).format("DD-MM-YYYY"))
          }
          className="w-full border p-2 rounded mb-4"
        />

        <label className="block font-semibold mb-2">End Date</label>
        <input
          type="date"
          onChange={(e) =>
            setEnd(moment(e.target.value).format("DD-MM-YYYY"))
          }
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={downloadReport}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download Excel Report
        </button>

      </div>
    </div>
  );
};

export default SalesReport;
