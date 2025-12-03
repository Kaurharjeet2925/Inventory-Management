import React, { useState, useEffect } from "react";
import { apiClient } from "../../apiclient/apiclient";
import { toast } from "react-toastify";
import AddLocationModal from "./components/AddLocation";
import { Pencil, Trash2 } from "lucide-react";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
   const openEdit = (loc) => {
  setEditId(loc._id);
  setLocationName(loc.name);
  setAddress(loc.address);
  setIsAddLocationOpen(true);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/locations");
      setLocations(response.data?.locations || []);
    } catch (err) {
      toast.error("Failed to fetch locations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name?.toLowerCase().includes(search.toLowerCase()) ||
    loc.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await apiClient.delete(`/locations/${id}`);
        setLocations(locations.filter((l) => l._id !== id));
        toast.success("Location deleted successfully");
      } catch (err) {
        toast.error("Failed to delete location");
      }
    }
  };

  const handleAddLocation = async () => {
    if (!locationName.trim() || !address.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await apiClient.post("/locations/create", {
        name: locationName,
        address: address,
      });

      setLocations([...locations, res.data.location]);
      toast.success("Location added successfully");

      setLocationName("");
      setAddress("");
      setIsAddLocationOpen(false);
    } catch (err) {
      toast.error("Failed to add location");
    }
  };
const handleUpdateLocation = async () => {
  if (!locationName.trim() || !address.trim()) {
    toast.error("Please fill all fields");
    return;
  }

  try {
    const res = await apiClient.put(`/locations/${editId}`, {
      name: locationName,
      address: address,
    });

    setLocations(locations.map(loc =>
      loc._id === editId ? res.data.location : loc
    ));

    toast.success("Location updated successfully");

    setEditId(null);
    setLocationName("");
    setAddress("");
    setIsAddLocationOpen(false);

  } catch (err) {
    toast.error("Failed to update location");
    console.error(err);
  }
};


  return (
    <div className="ml-64 mt-12 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Locations</h1>

        {/* Search + Buttons */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* <button
            onClick={fetchLocations}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Refresh
          </button> */}

          <button
            onClick={() => setIsAddLocationOpen(true)}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            + Add Location
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-600">Loading locations...</p>}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Address
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <tr
                    key={loc._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {/* NAME */}
                    <td className="px-6 py-3 text-gray-800">{loc.name}</td>

                    {/* ADDRESS */}
                    <td className="px-6 py-3 text-gray-800">{loc.address}</td>

                    {/* ACTIONS - RIGHT CORNER */}
                    <td className="px-6 py-3 text-center">
                      <div className="inline-flex items-center gap-3">

                        {/* EDIT */}
                        <button
                          onClick={() => openEdit(loc)}

                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition border border-blue-200"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(loc._id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-100 transition border border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No locations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Location Modal */}
     <AddLocationModal
  show={isAddLocationOpen}
  onClose={() => {
    setIsAddLocationOpen(false);
    setEditId(null);
    setLocationName("");
    setAddress("");
  }}
  onSave={editId ? handleUpdateLocation : handleAddLocation}
  locationName={locationName}
  address={address}
  setLocationName={setLocationName}
  setAddress={setAddress}
  isEdit={!!editId}
/>


    </div>
  );
};

export default Locations;
