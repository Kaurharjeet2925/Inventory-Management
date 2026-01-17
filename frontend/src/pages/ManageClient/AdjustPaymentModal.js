import { useState } from "react";
import { X } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";

const paymentModes = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

const AdjustPaymentModal = ({ open, onClose, clientId, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!mode) {
      alert("Please select payment mode");
      return;
    }

    try {
      setLoading(true);

      await apiClient.post(
        `/clients/${clientId}/adjust-payment`,
        {
          amount: Number(amount),
          mode,
          note,
        }
      );

      onSuccess?.();
      onClose();
      setAmount("");
      setMode("");
      setNote("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Record Payment (Adjustment)
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          <p className="text-sm text-gray-500">
            Use this when client gives money without any order reference
            (advance, late payment, or remaining amount).
          </p>

          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount Received
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Enter amount"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Payment Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select payment mode</option>
              {paymentModes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Note (optional)
            </label>
            <textarea
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Example: Advance received via UPI"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdjustPaymentModal;
