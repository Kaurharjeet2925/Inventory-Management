import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";

const inputClass =
  "w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition";

const labelClass = "block text-sm font-medium text-slate-600 mb-1";

const CompanySettings = () => {
  const [companyName, setCompanyName] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get("/settings/company");

        if (res.data) {
          setCompanyName(res.data.companyName || "");

          if (res.data.logo) {
            setLogoPreview(
              `${process.env.REACT_APP_IMAGE_URL}/${res.data.logo}?t=${Date.now()}`
            );
          }
        }
      } catch (err) {
        console.error("Failed to load company settings");
      }
    };

    loadSettings();
  }, []);

  /* ================= LOGO HANDLER ================= */
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      if (!companyName.trim()) {
        alert("Company name is required");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("companyName", companyName);
      if (logo) formData.append("logo", logo);

      await apiClient.post("/settings/company", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Company settings saved successfully");
      setLogo(null); // reset file input
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to save company settings"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl h-[500px] bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          Company Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage application and account settings
        </p>
      </div>

      <div className="border-b mb-6"></div>

      {/* COMPANY NAME */}
      <div className="mb-6">
        <label className={labelClass}>Company Name</label>
        <input
          type="text"
          placeholder="Enter company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* COMPANY LOGO */}
      <div className="mb-6">
        <label className={labelClass}>Company Logo</label>

        <div className="flex items-center gap-4 mt-2">
          {/* PREVIEW */}
          <div className="w-20 h-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Company Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-slate-400">No Logo</span>
            )}
          </div>

          {/* UPLOAD */}
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-900 text-white text-sm hover:bg-amber-500 transition">
            <Upload className="w-4 h-4" />
            Upload Logo
            <input
              type="file"
              accept="image/png, image/jpeg"
              hidden
              onChange={handleLogoChange}
            />
          </label>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Recommended size: 300×300px • PNG / JPG
        </p>
      </div>

      {/* ACTIONS */}
      <div className="border-t mt-8 pt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 rounded-md bg-blue-900 text-white hover:bg-amber-500 transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default CompanySettings;
