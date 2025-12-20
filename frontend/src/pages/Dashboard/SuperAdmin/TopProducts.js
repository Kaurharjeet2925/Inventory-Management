import { useEffect, useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";

const TopProducts = () => {
  const [items, setItems] = useState([]);
  const [period, setPeriod] = useState("year");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiClient.get(
          `/top-products?period=${period}&limit=4`
        );
        console.log("[TopProducts] API response:", res.data);
        setItems(res.data || []);
      } catch (err) {
        console.error("Failed to fetch top items", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [period]);

  return (
<div className="bg-white rounded-xl p-4 border border-gray-200 w-full h-64 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700">
          Top Selling Items
        </h4>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs border rounded-md px-2 py-1"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">Previous Year</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center text-sm text-gray-400">
          Loading items...
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.productId || item._id || item.productName}
              className="border rounded-lg p-3 hover:shadow-sm transition"
            >
              {/* IMAGE */}
              <div className="h-24 flex items-center justify-center bg-gray-50 rounded-md mb-2">
                {(() => {
                  const raw = item.image;
                  // Prefer explicit image base; fall back to backend base or localhost
                  let base = process.env.REACT_APP_IMAGE_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
                  // Normalize base: remove trailing '/uploads' or trailing slash to avoid double paths
                  base = base.replace(/\/uploads\/?$/i, '');
                  base = base.replace(/\/$/, '');

                  let src = null;
                  if (raw) {
                    if (raw.startsWith("http")) {
                      src = raw;
                    } else {
                      // Ensure path includes /uploads/ when raw is just a filename
                      const path = raw.startsWith("/") ? raw : `/uploads/${raw}`;
                        src = `${base}${path}`;
                        console.log("[TopProducts] image src:", src);
                    }
                  }

                    if (src) {
                    return <img src={src} alt={item.productName || item.name} className="h-full object-contain" />;
                  }

                  // Fallback: show initial letter of product name
                  let nameForInitial = item.productName || item.name || "?";
                  // If name looks like an ObjectId (24 hex chars) treat it as unknown
                  if (/^[0-9a-fA-F]{24}$/.test(nameForInitial)) nameForInitial = "Unknown";
                  const initial = nameForInitial.charAt(0).toUpperCase();
                  return (
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold">
                      {initial}
                    </div>
                  );
                })()}
              </div>

              {/* NAME */}
              <p className="text-xs font-medium text-gray-700 truncate">
                {item.productName || item.name}
              </p>

              {/* QTY */}
              <p className="text-lg font-bold text-gray-900 mt-1">
                {item.quantitySold}{" "}
                <span className="text-xs font-medium text-gray-500">
                  pcs
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProducts;
