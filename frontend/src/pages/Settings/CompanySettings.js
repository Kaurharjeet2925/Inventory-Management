import { useState } from "react";
import SettingsLayout from "../../components/SettingsLayout";

const CompanySettings = () => {
  const [companyName, setCompanyName] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logo, setLogo] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    // Example: send data to backend
    // const formData = new FormData();
    // formData.append("companyName", companyName);
    // if (logo) formData.append("logo", logo);
    // await apiClient.post("/settings/company", formData);
    alert("Changes saved!");
  };

  return (
    <div className="space-y-6">

      <div>
        <label className="text-sm font-medium text-slate-600">
          Company Name
        </label>
        <input className="mt-2 w-full h-10 border rounded px-3" />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600">
          Company Logo
        </label>
        <input type="file" className="mt-2" />
      </div>

      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          Save
        </button>
      </div>

    </div>
  );
};


export default CompanySettings;
