// pages/Notifications/ActivityLog.jsx
import React, { useEffect, useState } from "react";
import { apiClient } from "../apiclient/apiclient";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header"
import PageContainer from "../components/PageContainer";
const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLogs(page);
  }, [page]);

  const loadLogs = async (p) => {
    const res = await apiClient.get("/notifications/activity?page=1&limit=20");
    setLogs(res.data.data);
  };

  return (
     <div className="w-full min-h-screen ">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <div className="flex-1 w-full">
            <PageContainer>
               <div>
      <h1 className="text-xl font-semibold mb-4">Activity Log</h1>

      <div className="bg-white rounded-lg shadow divide-y">
        {logs.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">No activity yet</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="p-4">
              <p className="text-sm">{log.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
            </PageContainer>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ActivityLog;
