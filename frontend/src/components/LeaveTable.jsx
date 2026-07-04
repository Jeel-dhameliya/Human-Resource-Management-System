import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";

export default function LeaveTable() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");

      // Change this endpoint to yours
      const res = await axios.get("/api/timeoff/all", {
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

      await axios.put(
        `/api/timeoff/${id}`,
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

      setFilteredLeaves((prev) =>
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

              <th className="text-center px-6 py-4">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredLeaves.length === 0 && (
              <tr>

                <td
                  colSpan={6}
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
                      leave.type === "Paid"
                        ? "bg-blue-100 text-blue-700"
                        : leave.type === "Sick"
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
                      leave.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : leave.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {leave.status}
                  </span>

                </td>

                <td className="px-6 py-5">

                  {leave.status === "Pending" ? (
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