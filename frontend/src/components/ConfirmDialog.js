import { X } from "lucide-react";

const ConfirmDialog = ({
  open,
  title = "Confirm Action",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  variant = "danger", // danger | warning | info
}) => {
  if (!open) return null;

  const VARIANT_STYLES = {
    danger: {
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      iconBg: "bg-yellow-100",
      iconText: "text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const styles = VARIANT_STYLES[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* MODAL */}
      <div
        className="
          relative bg-white rounded-xl shadow-xl
          w-[95%] max-w-md
          mx-auto p-5 sm:p-6
        "
      >
        {/* HEADER */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}
          >
            <span className={`text-lg font-bold ${styles.iconText}`}>
              !
            </span>
          </div>

          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gray-600 mt-1">
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
          <button
            onClick={onCancel}
            className="
              w-full sm:w-auto
              px-4 py-2 rounded-lg border border-gray-300
              text-sm font-medium text-gray-700
              hover:bg-gray-100 transition
            "
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`
              w-full sm:w-auto
              px-4 py-2 rounded-lg text-sm font-medium text-white
              transition
              ${loading ? "opacity-60 cursor-not-allowed" : styles.button}
            `}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
