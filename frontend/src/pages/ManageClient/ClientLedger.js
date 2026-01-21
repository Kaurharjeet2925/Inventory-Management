import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import ThemedTable from "../../components/ThemedTable";
import AdjustPaymentModal from "./AdjustPaymentModal";
import { apiClient } from "../../apiclient/apiclient";

/* ================= HELPERS ================= */
const formatAmount = (amt) =>
  amt ? `₹ ${amt.toLocaleString()}` : "-";

const formatBalance = (bal) =>
  bal > 0
    ? `₹ ${bal.toLocaleString()} Debit`
    : bal < 0
    ? `₹ ${Math.abs(bal).toLocaleString()} Credit`
    : "₹ 0";

const ClientLedger = () => {
  /* ================= ROUTE PARAM ================= */
  const { id: clientId } = useParams();

  /* ================= STATE ================= */
  const [ledgerData, setLedgerData] = useState([]);
  const [client, setClient] = useState(null);

  const [summary, setSummary] = useState({
    openingBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
    currentBalance: 0,
  });
  const [stats, setStats] = useState({
  totalOrders: 0,
  totalOrderAmount: 0,
});

  const [loading, setLoading] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
const [search, setSearch] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState("all");

  /* ================= FETCH LEDGER ================= */
  const fetchLedger = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);

      const res = await apiClient.get(
        `/clients/${clientId}/client-ledger`
      );

      setLedgerData(res.data.ledger || []);
      setSummary({
        openingBalance: res.data.openingBalance || 0,
        totalDebit: res.data.totalDebit || 0,
        totalCredit: res.data.totalCredit || 0,
        currentBalance: res.data.currentBalance || 0,
      });
    } catch (error) {
      console.error("ledger fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);
 const handleDownloadReport = async () => {
  if (!filteredLedger.length) {
    alert("No data to download");
    return;
  }

  try {
    const params = new URLSearchParams({
      fromDate,
      toDate,
      type,
      search,
    });

    const res = await apiClient.get(
      `/reports/client-ledger/${clientId}?${params.toString()}`,
      {
        responseType: "blob", // 👈 VERY IMPORTANT
      }
    );

    // Create file from blob
    const blob = new Blob([res.data], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    // Auto download (NO new tab)
    const a = document.createElement("a");
    a.href = url;
    a.download = `Client-Ledger-${client?.name || "Report"}.xlsx`;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed", error);
    alert("Failed to download report");
  }
};



const getInitials = (name = "") => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};
useEffect(() => {
  const orders = ledgerData.filter((row) => row.type === "order");

  const totalOrders = orders.length;

  const totalOrderAmount = orders.reduce(
    (sum, o) => sum + (o.debit || 0),
    0
  );

  setStats({
    totalOrders,
    totalOrderAmount,
  });
}, [ledgerData]);

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  /* ================= FILTERED LEDGER ================= */
  const filteredLedger = useMemo(() => {
  return ledgerData.filter((row) => {
    const rowDate = new Date(row.createdAt);

    if (fromDate && rowDate < new Date(fromDate)) return false;
    if (toDate && rowDate > new Date(toDate + "T23:59:59")) return false;

    if (type === "debit" && row.debit <= 0) return false;
    if (type === "credit" && row.credit <= 0) return false;

    if (
      search &&
      !row.description?.toLowerCase().includes(search.toLowerCase())
    )
      return false;

    return true;
  });
}, [ledgerData, fromDate, toDate, type, search]);

const fetchClient = useCallback(async () => {
  if (!clientId) return;
  const res = await apiClient.get(`/clients/${clientId}`);
  setClient(res.data.client);
}, [clientId]);

useEffect(() => {
  fetchClient();
}, [fetchClient]);

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Client Ledger
          </h1>
          <p className="text-sm text-slate-500">
            Complete transaction history with running balance
          </p>
        </div>

        <button
          onClick={() => setAdjustOpen(true)}
          className={`h-9 px-4 rounded-md text-sm font-medium
            ${
              
                "bg-slate-800 text-white hover:bg-slate-900"
            }`}
        >
          Record Payment
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">

  {/* COLUMN 1 — CLIENT */}
<div className="bg-white p-5 rounded-xl border flex items-center gap-4">
  <div className="h-14 w-14 rounded-full bg-blue-900 text-white
                  flex items-center justify-center text-xl font-bold">
    {getInitials(client?.name)}
  </div>

  <div className="min-w-0">
    <h2 className="text-lg font-semibold truncate">
      {client?.name || "—"}
    </h2>
    <p className="text-xs text-slate-500 truncate">
      {client?.companyName || "—"}
    </p>
    <p className="text-xs text-slate-500">
      {client?.phone || "—"}
    </p>
  </div>
</div>

  {/* COLUMN 2 */}
  <div className="bg-orange-50 border-orange-300 p-4 rounded-xl border">
    <p className="text-xs text-orange500">Total Orders</p>
    <p className="text-2xl text-orange-700 font-bold">
      {stats.totalOrders}
    </p>
  </div>

  {/* COLUMN 3 */}
  <div className="bg-green-100 p-4 rounded-xl border border-green-300">
    <p className="text-xs text-green-600">Total Amount</p>
    <p className="text-2xl font-bold text-green-700">
      ₹ {stats.totalOrderAmount.toLocaleString()}
    </p>
  </div>

  {/* COLUMN 4 */}
  <div className="bg-blue-50 p-4 rounded-xl border border-blue-300">
    <p className="text-xs text-blue-600">Current Balance</p>
    <p className="text-2xl font-bold text-blue-800">
      {formatBalance(summary.currentBalance)}
    </p>
  </div>

</div>


      {/* ================= FILTER BAR ================= */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-6">
  <div className="flex flex-col sm:flex-row gap-3 items-center">

    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      className="h-9 px-3 rounded-md border text-sm"
    />

    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      className="h-9 px-3 rounded-md border text-sm"
    />

    <select
      value={type}
      onChange={(e) => setType(e.target.value)}
      className="h-9 px-3 rounded-md border text-sm"
    >
      <option value="all">All</option>
      <option value="debit">Debit</option>
      <option value="credit">Credit</option>
    </select>

    {/* 🔍 SEARCH */}
    <input
      type="text"
      placeholder="Search description / order..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="h-9 px-3 rounded-md border text-sm flex-1"
    />

    {/* ⬇️ DOWNLOAD */}
    <button
      onClick={handleDownloadReport}
      className="h-9 px-4 rounded-md text-sm font-medium
                 bg-green-600 text-white hover:bg-green-700"
    >
      Download Report
    </button>
  </div>
</div>


      {/* ================= LEDGER TABLE ================= */}
      <ThemedTable>
        <thead className="bg-gray-200 text-slate-700">
          <tr className="h-12">
            <th className="px-6 text-left">Date</th>
            <th className="px-6 text-left">Description</th>
            <th className="px-6 text-right">Debit</th>
            <th className="px-6 text-right">Credit</th>
            <th className="px-6 text-right">Balance</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan="5"
                className="px-6 py-6 text-center text-slate-500"
              >
                Loading ledger...
              </td>
            </tr>
          ) : filteredLedger.length > 0 ? (
            filteredLedger.map((row) => (
              <tr
                key={row._id}
                className="border-b h-[56px] hover:bg-gray-50"
              >
                <td className="px-6">
                  {new Date(row.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 font-medium">
                  {row.description}
                </td>

                <td className="px-6 text-right text-green-700 font-medium">
                  {row.debit ? formatAmount(row.debit) : "-"}
                </td>

                <td className="px-6 text-right text-red-700 font-medium">
                  {row.credit ? formatAmount(row.credit) : "-"}
                </td>

                <td className="px-6 text-right font-semibold">
                  {formatBalance(row.balanceAfter)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="px-6 py-6 text-center text-slate-500"
              >
                No ledger entries found
              </td>
            </tr>
          )}
        </tbody>
      </ThemedTable>

      {/* ================= ADJUST PAYMENT MODAL ================= */}
      <AdjustPaymentModal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        clientId={clientId}
        onSuccess={fetchLedger}
      />
    </div>
  );
};

export default ClientLedger;
