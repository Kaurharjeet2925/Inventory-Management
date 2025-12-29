import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiclient/apiclient';
import { toast } from 'react-toastify';
import AddClient from './AddClient';
import PageContainer from "../../components/PageContainer";

const Client = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
const [selectedClient, setSelectedClient] = useState(null);


  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/clients'); // adjust endpoint if needed
      setClients(response.data?.clients || []);
    } catch (err) {
      toast.error('Failed to fetch clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase()) ||
    client.phone?.includes(search)
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await apiClient.delete(`/clients/${id}`);
        setClients(clients.filter(c => c._id !== id));
        toast.success('Client deleted successfully');
      } catch (err) {
        toast.error('Failed to delete client');
      }
    }
  };

  const handleAddClient = (client, editMode) => {
    if (editMode) {
      // 🔥 Update existing client
      setClients(prev =>
        prev.map(c => (c._id === client._id ? client : c))
      );
    } else {
      // ➕ Add new client
      setClients(prev => [...prev, client]);
    }
  };
  

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Clients</h1>
        
        {/* Search Bar and Add Button */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchClients}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Refresh
          </button>
          <button
            onClick={() => setIsAddClientOpen(true)}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            + Add Client
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-600">Loading clients...</p>}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
          <thead className="bg-gray-200">
  <tr>
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">City</th>
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
  </tr>
         </thead>

            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client._id} className="border-b hover:bg-gray-50 transition">
  <td className="px-6 py-3 text-gray-800">{client.name}</td>
  <td className="px-6 py-3 text-gray-800">{client.email}</td>
  <td className="px-6 py-3 text-gray-800">{client.phone}</td>

  {/* New Company Column */}
  <td className="px-6 py-3 text-gray-800">{client.companyName || '-'}</td>

  <td className="px-6 py-3 text-gray-800">{client.address || '-'}</td>
  <td className="px-6 py-3 text-gray-800">{client.city || '-'}</td>
  
  <td className="px-6 py-3 space-x-2">
  <button
  onClick={() => {
    setSelectedClient(client);
    setIsEdit(true);
    setIsAddClientOpen(true);
  }}
      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition"
    >
      Edit
    </button>
    <button
      onClick={() => handleDelete(client._id)}
      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
    >
      Delete
    </button>
  </td>
</tr>

                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Client Modal */}
      <AddClient 
  isOpen={isAddClientOpen}
  onClose={() => {
    setIsAddClientOpen(false);
    setIsEdit(false);
    setSelectedClient(null);
  }}
  onAddClient={handleAddClient}
  clientData={selectedClient}
  isEdit={isEdit}
/>

    </div>
  );
};

export default Client;
