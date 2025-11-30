import React, { useEffect, useState } from "react";
import { apiClient } from "../../apiclient/apiclient";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const geocodeAddress = async () => {
  const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.results.length > 0) {
    const location = data.results[0].geometry.location;
    setCoords({ lat: location.lat, lng: location.lng });
    return location;
  }

  alert("Could not find location on map");
  return null;
};

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      const res = await apiClient.get("/locations");

      // Works for both API formats:
      // [{}, {}]  OR  { locations: [...] }
      setLocations(res.data.locations || res.data);
      setLoading(false);

    } catch (err) {
      console.log("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Add Location
 const handleAddLocation = async () => {
  if (!locationName.trim() || !address.trim()) return;

  // Convert address → Lat/Lng
  const geo = await geocodeAddress();
  if (!geo) return;

  try {
    const res = await apiClient.post("/add-location", {
      name: locationName,
      address,
      latitude: geo.lat,
      longitude: geo.lng,
    });

    setLocations(prev => [...prev, res.data.location]);
    setLocationName("");
    setAddress("");
    setCoords({ lat: null, lng: null });
    setShowModal(false);

  } catch (err) {
    console.log("Add error:", err);
  }
};

  // Delete location
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this location?")) return;

    try {
      await apiClient.delete(`/locations/${id}`);
      setLocations((prev) => prev.filter((loc) => loc._id !== id));
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="ml-64 mt-12 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventory Locations</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowModal(true)}
        >
          + Add Location
        </button>
      </div>

      {/* Locations Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 w-14">#</th>
              <th className="border p-2">Location Name</th>
              <th className="border p-2 w-40">Actions</th>
            </tr>
          </thead>

          <tbody>
            {locations.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No locations found
                </td>
              </tr>
            )}

            {locations.map((loc, index) => (
              <tr key={loc._id}>
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{loc.name}</td>
                <td className="border p-2 text-center">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded mr-2">
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(loc._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Add Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Add Location</h2>

           <label className="font-semibold mb-2 block">Location Name</label>
<input
  type="text"
  className="w-full border p-2 rounded mb-4"
  value={locationName}
  onChange={(e) => setLocationName(e.target.value)}
/>

<label className="font-semibold mb-2 block">Address</label>
<input
  type="text"
  className="w-full border p-2 rounded mb-4"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
/>

{/* GOOGLE MAP PREVIEW */}
{coords.lat && coords.lng && (
  <iframe
    className="w-full h-52 rounded mb-4 border"
    src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
  ></iframe>
)}


            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleAddLocation}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Locations;
