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
          <option value="year">This Year</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center text-sm text-gray-400">
          Loading items...
        </p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <tbody>
            {items.map((item, index) => {
              const raw = item.image;
              let base =
                process.env.REACT_APP_IMAGE_URL ||
                process.env.REACT_APP_BACKEND_URL ||
                "http://localhost:5000";

              base = base.replace(/\/uploads\/?$/i, "").replace(/\/$/, "");

              let imgSrc = null;
              if (raw) {
                imgSrc = raw.startsWith("http")
                  ? raw
                  : `${base}${raw.startsWith("/") ? raw : `/uploads/${raw}`}`;
              }

              const name = item.productName || item.name || "Unknown";
              const initial = name.charAt(0).toUpperCase();

              return (
                <tr
                  key={item.productId || item._id || index}
                  className={`border-b last:border-b-0 transition-colors ${
                  
                       "bg-gray-50 hover:bg-amber-100"
                      
                  }`}
                >
                  {/* RANK */}
                  <td className="p-2 w-8 text-gray-500 font-medium">
                    {index + 1}
                  </td>

                  {/* PRODUCT */}
                  <td className="p-2 flex items-center gap-3">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={name}
                        className="w-8 h-8 rounded object-contain bg-gray-50"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700
                                      flex items-center justify-center text-sm font-semibold">
                        {initial}
                      </div>
                    )}

                    <span className="truncate">{name}</span>
                  </td>

                  {/* SOLD */}
                  <td className="p-2 text-right font-semibold text-gray-800">
                    {item.quantitySold}
                    <span className="text-xs text-gray-500 ml-1">pcs</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TopProducts;
