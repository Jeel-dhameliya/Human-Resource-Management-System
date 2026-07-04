import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function LeaveModal({ close }) {
  const token = localStorage.getItem("token");

  const [employee, setEmployee] = useState("");
  const [type, setType] = useState("Paid");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/employees/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEmployee(res.data.fullName);
    } catch (err) {
      console.log(err);
    }
  };

  const totalDays = () => {
    if (!startDate || !endDate) return 0;

    const s = new Date(startDate);
    const e = new Date(endDate);

    return (
      Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  const submitLeave = async () => {
    try {
      const formData = new FormData();

      formData.append("type", type);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      await axios.post("/api/timeoff", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Leave Request Submitted");

      close();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl w-[520px] shadow-xl">

        <div className="flex justify-between items-center border-b px-6 py-4">

          <h2 className="text-xl font-semibold">
            Time Off Request
          </h2>

          <button onClick={close}>
            <X />
          </button>

        </div>

        <div className="p-6 space-y-5">

          <div>

            <label className="block text-sm font-medium mb-2">
              Employee
            </label>

            <input
              value={employee}
              readOnly
              className="w-full border rounded-lg px-4 py-2 bg-slate-100"
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Leave Type
            </label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option>Paid</option>
              <option>Sick</option>
              <option>Unpaid</option>
            </select>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block text-sm mb-2">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-2"
              />

            </div>

            <div>

              <label className="block text-sm mb-2">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-2"
              />

            </div>

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Allocation
            </label>

            <input
              value={`${totalDays()} Day(s)`}
              readOnly
              className="w-full border rounded-lg px-4 py-2 bg-slate-100"
            />

          </div>

          {type === "Sick" && (
            <div>

              <label className="block text-sm font-medium mb-2">
                Medical Certificate
              </label>

              <input
                type="file"
                onChange={(e) =>
                  setAttachment(e.target.files[0])
                }
              />

            </div>
          )}

        </div>

        <div className="flex justify-end gap-3 border-t p-5">

          <button
            onClick={close}
            className="px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={submitLeave}
            className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Submit
          </button>

        </div>

      </div>

    </div>
  );
}