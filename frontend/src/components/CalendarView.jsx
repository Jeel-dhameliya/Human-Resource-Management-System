import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  Calendar,
  momentLocalizer,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function CalendarView({ openModal }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("/api/timeoff/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const calendarEvents = res.data.map((leave) => ({
        title: leave.type,
        start: new Date(leave.startDate),
        end: new Date(leave.endDate),
        status: leave.status,
      }));

      setEvents(calendarEvents);
    } catch (err) {
      console.log(err);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = "#8b5cf6";

    if (event.status === "Approved")
      backgroundColor = "#22c55e";

    if (event.status === "Rejected")
      backgroundColor = "#ef4444";

    if (event.status === "Pending")
      backgroundColor = "#f59e0b";

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        border: "none",
        color: "white",
      },
    };
  };

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-2xl font-semibold">
          My Time Off
        </h2>

        <button
          onClick={openModal}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg"
        >
          + Request Leave
        </button>

      </div>

      <div className="h-[650px] bg-white rounded-xl border p-4">

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
        />

      </div>

    </div>
  );
}