import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";

export default function LeaveTable({ search = "" }) {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAttachmentUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/\\/g, "/");
    return `http://localhost:5001/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredLeaves(leaves);
    } else {
      const q = search.toLowerCase();
      setFilteredLeaves(
        leaves.filter((l) =>
          (l.employee?.fullName || l.employeeName || "").toLowerCase().includes(q) ||
          (l.type || "").toLowerCase().includes(q) ||
          (l.status || "").toLowerCase().includes(q)
        )
      );
    }
  }, [search, leaves]);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("/api/leave/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeaves(res.data);
      setFilteredLeaves(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `/api/leave/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLeaves((prev) =>
        prev.map((leave) =>
          leave._id === id ? { ...leave, status } : leave
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="overflow-auto rounded-xl border">

        <table className="w-full">

          <thead className="bg-slate-100 sticky top-0">

            <tr className="text-slate-700">

              <th className="text-left px-6 py-4">
                Employee
              </th>

              <th className="text-left px-6 py-4">
                Start Date
              </th>

              <th className="text-left px-6 py-4">
                End Date
              </th>

              <th className="text-left px-6 py-4">
                Leave Type
              </th>

              <th className="text-left px-6 py-4">
                Status
              </th>

              <th className="text-left px-6 py-4">
                Remarks / Doc
              </th>

              <th className="text-center px-6 py-4">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredLeaves.length === 0 && (
              <tr>

                <td
                  colSpan={7}
                  className="text-center py-12 text-slate-500"
                >
                  No Leave Requests
                </td>

              </tr>
            )}

            {filteredLeaves.map((leave) => (
              <tr
                key={leave._id}
                className="border-t hover:bg-slate-50 transition"
              >

                <td className="px-6 py-5 font-medium">
                  {leave.employee?.fullName ||
                    leave.employeeName}
                </td>

                <td className="px-6 py-5">
                  {new Date(
                    leave.startDate
                  ).toLocaleDateString()}
                </td>

                <td className="px-6 py-5">
                  {new Date(
                    leave.endDate
                  ).toLocaleDateString()}
                </td>

                <td className="px-6 py-5">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                    ${
                      leave.type?.toLowerCase() === "paid"
                        ? "bg-blue-100 text-blue-700"
                        : leave.type?.toLowerCase() === "sick"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {leave.type}
                  </span>

                </td>

                <td className="px-6 py-5">

                  <span
                    className={`px-3 py-1 rounded-full text-sm
                    ${
                      leave.status?.toLowerCase() === "approved"
                        ? "bg-green-100 text-green-700"
                        : leave.status?.toLowerCase() === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {leave.status}
                  </span>

                </td>

                <td className="px-6 py-5 max-w-[200px] truncate">
                  <div className="text-sm text-slate-700">{leave.remarks || "—"}</div>
                  {leave.attachment && (
                    <a
                      href={getAttachmentUrl(leave.attachment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 underline hover:text-purple-800 block mt-1"
                    >
                      View Cert
                    </a>
                  )}
                </td>

                <td className="px-6 py-5">

                  {leave.status?.toLowerCase() === "pending" ? (
                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() =>
                          updateStatus(
                            leave._id,
                            "Approved"
                          )
                        }
                        className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                      >
                        <Check size={18} />
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            leave._id,
                            "Rejected"
                          )
                        }
                        className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                      >
                        <X size={18} />
                      </button>

                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      —
                    </div>
                  )}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}