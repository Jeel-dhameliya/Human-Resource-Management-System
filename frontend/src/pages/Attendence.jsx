import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  useEffect(() => {
    if (!search) {
      setFiltered(attendance);
      return;
    }

    const value = search.toLowerCase();

    setFiltered(
      attendance.filter((emp) =>
        emp.employeeId.email.toLowerCase().includes(value)
      )
    );
  }, [search, attendance]);

  const fetchAttendance = async () => {
    try {
      const date = new Date(selectedDate);

      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const res = await axios.get(
        `/api/attendance/all?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const onlyCurrentDate = res.data.filter((r) => {
        return (
          new Date(r.date).toDateString() ===
          new Date(selectedDate).toDateString()
        );
      });

      setAttendance(onlyCurrentDate);
      setFiltered(onlyCurrentDate);
    } catch (err) {
      console.log(err);
    }
  };

  const previousDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const getHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "--";

    const diff =
      (new Date(checkOut) - new Date(checkIn)) /
      (1000 * 60 * 60);

    const hrs = Math.floor(diff);
    const mins = Math.floor((diff - hrs) * 60);

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}`;
  };

  const extraHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "--";

    const diff =
      (new Date(checkOut) - new Date(checkIn)) /
      (1000 * 60 * 60);

    const extra = diff - 8;

    if (extra <= 0) return "00:00";

    const hrs = Math.floor(extra);
    const mins = Math.floor((extra - hrs) * 60);

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <>
      <Navbar />

      <div className="bg-gray-100 min-h-screen p-8">

        <div className="bg-white rounded-xl shadow">

          {/* Header */}

          <div className="flex justify-between items-center border-b p-5">

            <h1 className="text-2xl font-semibold">
              Attendance
            </h1>

            <input
              placeholder="Search employee..."
              className="border rounded-lg px-4 py-2 w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          {/* Controls */}

          <div className="flex gap-3 p-5 border-b">

            <button
              onClick={previousDay}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              ←
            </button>

            <button
              onClick={nextDay}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              →
            </button>

            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
            />

            <div className="border rounded-lg px-5 py-2 bg-gray-50">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
              })}
            </div>

          </div>

          {/* Table */}

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left p-4 border-b">
                  Employee
                </th>

                <th className="text-left p-4 border-b">
                  Check In
                </th>

                <th className="text-left p-4 border-b">
                  Check Out
                </th>

                <th className="text-left p-4 border-b">
                  Work Hours
                </th>

                <th className="text-left p-4 border-b">
                  Extra Hours
                </th>

                <th className="text-left p-4 border-b">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.length === 0 && (
                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >
                    No attendance found
                  </td>

                </tr>
              )}

              {filtered.map((emp) => (
                <tr
                  key={emp._id}
                  className="hover:bg-gray-50"
                >
                  <td className="p-4 border-b">
                    {emp.employeeId.email}
                  </td>

                  <td className="p-4 border-b">
                    {emp.checkIn
                      ? new Date(
                          emp.checkIn
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--"}
                  </td>

                  <td className="p-4 border-b">
                    {emp.checkOut
                      ? new Date(
                          emp.checkOut
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--"}
                  </td>

                  <td className="p-4 border-b">
                    {getHours(emp.checkIn, emp.checkOut)}
                  </td>

                  <td className="p-4 border-b">
                    {extraHours(emp.checkIn, emp.checkOut)}
                  </td>

                  <td className="p-4 border-b capitalize">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        emp.status === "present"
                          ? "bg-green-100 text-green-700"
                          : emp.status === "half-day"
                          ? "bg-yellow-100 text-yellow-700"
                          : emp.status === "leave"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>
    </>
  );
}