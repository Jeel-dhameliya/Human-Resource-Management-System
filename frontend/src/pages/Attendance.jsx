import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import Navbar from '../components/Navbar';

const Attendance = () => {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);
  const [viewMode, setViewMode] = useState('date');

  const token = localStorage.getItem('token');
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);
  const isAdmin = currentUser?.role === 'admin';

  const selectedDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();
  const monthLabel = selectedDate.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        if (isAdmin) {
          const res = await axios.get(`/api/attendance/all?month=${month}&year=${year}`, config);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const filtered = res.data
            .filter(record => {
              const recordDate = new Date(record.date);
              recordDate.setHours(0, 0, 0, 0);
              return (record.status === 'present' || record.status === 'half-day') && recordDate.getTime() === today.getTime();
            })
            .map(record => ({
              id: record._id,
              employee: record.employeeId?.employeeId || record.employeeId?.email || 'Unknown',
              date: new Date(record.date),
              day: new Date(record.date).toLocaleString('default', { weekday: 'short' }),
              checkIn: record.checkIn ? new Date(record.checkIn) : null,
              checkOut: record.checkOut ? new Date(record.checkOut) : null,
              workHours: record.checkIn && record.checkOut ? formatDuration(new Date(record.checkOut) - new Date(record.checkIn)) : '--:--',
              extraHours: record.checkIn && record.checkOut ? formatDuration(Math.max(0, new Date(record.checkOut) - new Date(record.checkIn) - 8 * 3600 * 1000)) : '--:--',
              status: record.status,
            }));

          setAttendanceData(filtered);
        } else {
          const res = await axios.get(`/api/attendance/me?month=${month}&year=${year}`, config);
          setAttendanceData(buildMonthRows(res.data, month, year));
        }
      } catch (err) {
        console.error('Failed to fetch attendance data', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [token, navigate, month, year, isAdmin]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return attendanceData;

    const query = search.toLowerCase();
    return attendanceData.filter(item =>
      (item.employee?.toLowerCase().includes(query)) ||
      (item.date?.toLocaleDateString().toLowerCase().includes(query)) ||
      (item.day?.toLowerCase().includes(query)) ||
      (item.status?.toLowerCase().includes(query))
    );
  }, [attendanceData, search]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <Navbar />

      <div className="p-6 lg:px-10 max-w-7xl mx-auto w-full">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_70px_-40px_rgba(15,23,42,0.2)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Attendance</h1>
              <p className="mt-2 text-slate-500 max-w-2xl">
                {isAdmin
                  ? 'Today’s present employees attendance summary. Use the search to locate attendance records quickly.'
                  : `Your attendance for ${monthLabel} ${year}. The system uses these records for payslip computation.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-between sm:justify-end">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-purple-500"
                  onClick={() => setMonthOffset(offset => offset - 1)}
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="px-4 text-sm font-medium text-slate-900">{monthLabel} {year}</div>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-purple-500"
                  onClick={() => setMonthOffset(offset => offset + 1)}
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${viewMode === 'date' ? 'bg-purple-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setViewMode('date')}
                >
                  Date
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${viewMode === 'day' ? 'bg-purple-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setViewMode('day')}
                >
                  Day
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-[1fr_320px]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Status</div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <StatusPill label="Present" value={attendanceData.filter(item => item.status === 'present').length} color="bg-emerald-100 text-emerald-600" />
                <StatusPill label="Half-day" value={attendanceData.filter(item => item.status === 'half-day').length} color="bg-sky-100 text-sky-600" />
                <StatusPill label="Absent" value={attendanceData.filter(item => item.status === 'absent').length} color="bg-amber-100 text-amber-600" />
              </div>
            </div>

            <div className="relative rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="absolute inset-y-0 left-4 flex items-center text-slate-500"><Search size={18} /></div>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search attendance"
                className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white">
            <table className="min-w-full border-collapse text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  {isAdmin ? (
                    <>
                      <th className="px-6 py-4">Emp</th>
                      <th className="px-6 py-4">Check In</th>
                      <th className="px-6 py-4">Check Out</th>
                      <th className="px-6 py-4">Work Hours</th>
                      <th className="px-6 py-4">Extra Hours</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Day</th>
                      <th className="px-6 py-4">Check In</th>
                      <th className="px-6 py-4">Check Out</th>
                      <th className="px-6 py-4">Work Hours</th>
                      <th className="px-6 py-4">Extra Hours</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 6} className="px-6 py-16 text-center text-slate-500">Loading attendance...</td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 6} className="px-6 py-16 text-center text-slate-500">No attendance records found.</td>
                  </tr>
                ) : filteredData.map((row) => (
                  <tr key={row.id} className="border-b border-slate-200 even:bg-slate-50 transition-colors hover:bg-slate-100">
                    {isAdmin ? (
                      <>
                        <td className="px-6 py-4 font-medium text-slate-900">{row.employee}</td>
                        <td className="px-6 py-4 text-slate-700">{row.checkIn ? formatTime(row.checkIn) : '--:--'}</td>
                        <td className="px-6 py-4 text-slate-700">{row.checkOut ? formatTime(row.checkOut) : '--:--'}</td>
                        <td className="px-6 py-4 text-slate-700">{row.workHours}</td>
                        <td className="px-6 py-4 text-slate-700">{row.extraHours}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-medium text-slate-900">{formatShortDate(row.date)}</td>
                        <td className="px-6 py-4 text-slate-700">{row.day}</td>
                        <td className="px-6 py-4 text-slate-700">{row.checkIn ? formatTime(row.checkIn) : '--:--'}</td>
                        <td className="px-6 py-4 text-slate-700">{row.checkOut ? formatTime(row.checkOut) : '--:--'}</td>
                        <td className="px-6 py-4 text-slate-700">{row.workHours}</td>
                        <td className="px-6 py-4 text-slate-700">{row.extraHours}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusPill = ({ label, value, color }) => (
  <div className={`rounded-3xl border border-slate-200 p-4 ${color}`}>
    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
    <div className="mt-3 text-2xl font-semibold text-slate-900">{value}</div>
  </div>
);

const buildMonthRows = (records, month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const recordMap = new Map();
  records.forEach(record => {
    const date = new Date(record.date);
    date.setHours(0, 0, 0, 0);
    recordMap.set(date.getTime(), record);
  });

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month - 1, index + 1);
    const saved = recordMap.get(date.getTime());
    const checkIn = saved?.checkIn ? new Date(saved.checkIn) : null;
    const checkOut = saved?.checkOut ? new Date(saved.checkOut) : null;
    const workMs = checkIn && checkOut ? new Date(checkOut) - new Date(checkIn) : 0;
    const extraMs = Math.max(0, workMs - 8 * 3600 * 1000);
    const status = saved?.status || 'absent';

    return {
      id: `${date.toISOString()}-${status}`,
      date,
      day: date.toLocaleString('default', { weekday: 'short' }),
      checkIn,
      checkOut,
      workHours: checkIn && checkOut ? formatDuration(workMs) : '--:--',
      extraHours: checkIn && checkOut ? formatDuration(extraMs) : '--:--',
      status,
    };
  });
};

const formatDuration = (durationMs) => {
  const totalMinutes = Math.round(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const formatTime = (date) => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatShortDate = (date) => {
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

export default Attendance;
