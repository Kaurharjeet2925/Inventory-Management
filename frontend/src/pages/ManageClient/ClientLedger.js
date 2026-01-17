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
    ? `₹ ${bal.toLocaleString()} Dr`
    : bal < 0
    ? `₹ ${Math.abs(bal).toLocaleString()} Cr`
    : "₹ 0";

const ClientLedger = () => {
  /* ================= ROUTE PARAM ================= */
  const { id: clientId } = useParams();

  /* ================= STATE ================= */
  const [ledgerData, setLedgerData] = useState([]);
  const [summary, setSummary] = useState({
    openingBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
    currentBalance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

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

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  /* ================= FILTERED LEDGER ================= */
  const filteredLedger = useMemo(() => {
    return ledgerData.filter((row) => {
      const rowDate = new Date(row.createdAt);

      if (fromDate && rowDate < new Date(fromDate)) return false;
      if (toDate && rowDate > new Date(toDate + "T23:59:59"))
        return false;

      if (type === "debit" && row.debit <= 0) return false;
      if (type === "credit" && row.credit <= 0) return false;

      return true;
    });
  }, [ledgerData, fromDate, toDate, type]);

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
          disabled={summary.currentBalance === 0}
          className={`h-9 px-4 rounded-md text-sm font-medium
            ${
              summary.currentBalance === 0
                ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                : "bg-slate-800 text-white hover:bg-slate-900"
            }`}
        >
          Record Payment
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-xs text-slate-500">Opening Balance</p>
          <p className="text-lg font-semibold text-slate-800">
            {formatBalance(summary.openingBalance)}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <p className="text-xs text-green-600">Total Debit</p>
          <p className="text-lg font-semibold text-green-700">
            {formatAmount(summary.totalDebit)}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <p className="text-xs text-red-600">Total Credit</p>
          <p className="text-lg font-semibold text-red-700">
            {formatAmount(summary.totalCredit)}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-600">Current Balance</p>
          <p className="text-lg font-semibold text-blue-800">
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
