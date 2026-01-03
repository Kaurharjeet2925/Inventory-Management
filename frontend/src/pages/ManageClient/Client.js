import React, { useState, useEffect } from "react";
import { apiClient } from "../../apiclient/apiclient";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import AddClient from "./AddClient";
import ThemedTable from "../../components/ThemedTable";
import PageContainer from "../../components/PageContainer";

const Client = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  /* ================= FETCH CLIENTS ================= */
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/clients");
      setClients(res.data?.clients || []);
    } catch {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  /* ================= EDIT ================= */
  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsEdit(true);
    setIsAddClientOpen(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (client) => {
    if (!window.confirm(`Delete client "${client.name}"?`)) return;

    try {
      await apiClient.delete(`/clients/${client._id}`);
      setClients((prev) => prev.filter((c) => c._id !== client._id));
      toast.success("Client deleted successfully");
    } catch {
      toast.error("Failed to delete client");
    }
  };

  /* ================= ADD / UPDATE CALLBACK ================= */
  const handleAddClient = (client, editMode) => {
    if (editMode) {
      setClients((prev) =>
        prev.map((c) => (c._id === client._id ? client : c))
      );
    } else {
      setClients((prev) => [...prev, client]);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          Clients
        </h1>
        <p className="text-sm text-slate-500">
          Manage client information
        </p>
      </div>

      {/* SEARCH + ACTIONS */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-10 px-3 border rounded-md text-sm
                     focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
        />

        <button
          onClick={fetchClients}
          className="px-5 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>

        <button
          onClick={() => {
            setIsAddClientOpen(true);
            setIsEdit(false);
            setSelectedClient(null);
          }}
          className="px-6 py-2 rounded-md bg-blue-900 text-white hover:bg-amber-500"
        >
          + Add Client
        </button>
      </div>

      {/* TABLE */}
      {!loading && (
        <ThemedTable className="text-sm">
          <thead className="bg-gray-200 text-slate-700">
            <tr className="h-12">
              <th className="px-6 text-left">Name</th>
              <th className="px-6 text-left">Email</th>
              <th className="px-6 text-left">Phone</th>
              <th className="px-6 text-left">Company</th>
              <th className="px-6 text-left">City</th>
              <th className="px-6 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr
                  key={client._id}
                  className="border-b hover:bg-gray-50 transition h-[60px]"
                >
                  <td className="px-6">{client.name}</td>
                  <td className="px-6">{client.email}</td>
                  <td className="px-6">{client.phone}</td>
                  <td className="px-6">{client.companyName || "-"}</td>
                  <td className="px-6">{client.city || "-"}</td>

                  {/* ACTIONS */}
                  <td className="px-6">
                    <div className="flex justify-center gap-2">
                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => handleEdit(client)}
                        title="Edit Client"
                        className="
                          w-9 h-9 flex items-center justify-center
                          rounded-full border border-blue-200
                          text-blue-600 hover:bg-blue-100 hover:text-blue-700
                          focus:outline-none focus:ring-2 focus:ring-blue-400
                          transition
                        "
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => handleDelete(client)}
                        title="Delete Client"
                        className="
                          w-9 h-9 flex items-center justify-center
                          rounded-full border border-red-200
                          text-red-600 hover:bg-red-100 hover:text-red-700
                          focus:outline-none focus:ring-2 focus:ring-red-400
                          transition
                        "
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
                  colSpan="6"
                  className="px-6 py-6 text-center text-slate-500"
                >
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </ThemedTable>
      )}

      {/* ADD / EDIT MODAL */}
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
