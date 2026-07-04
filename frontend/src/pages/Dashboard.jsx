import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmployeeCard from '../components/EmployeeCard';
import NewEmployeeModal from '../components/NewEmployeeModal';
import { User, Clock, Calendar, LogOut, CheckCircle, AlertCircle, Plus, Search } from 'lucide-react';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [myAttendanceToday, setMyAttendanceToday] = useState(null);
  const navigate = useNavigate();

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isAdmin = user?.role === 'admin';

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isAdmin) {
        const empRes = await axios.get('/api/employees', config);
        setEmployees(empRes.data);
        const now = new Date();
        const attRes = await axios.get(`/api/attendance/all?month=${now.getMonth() + 1}&year=${now.getFullYear()}`, config);
        setAttendanceData(attRes.data);
      } else {
        const now = new Date();
        const attRes = await axios.get(`/api/attendance/me?month=${now.getMonth() + 1}&year=${now.getFullYear()}`, config);
        const todayStr = new Date().setHours(0, 0, 0, 0);
        const todayRec = attRes.data.find(r => new Date(r.date).setHours(0, 0, 0, 0) === todayStr);
        setMyAttendanceToday(todayRec);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate, fetchData]);

  const getTodayStatus = (userId) => {
    if (!userId) return 'absent';
    const today = new Date().setHours(0, 0, 0, 0);
    const record = attendanceData.find(r => {
      const recordDate = new Date(r.date).setHours(0, 0, 0, 0);
      return r.employeeId?._id?.toString() === userId.toString() && recordDate === today;
    });
    if (!record) return 'absent';
    if (record.status === 'present' || record.status === 'half-day') return 'present';
    if (record.status === 'leave') return 'leave';
    return 'absent';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.personalDetails?.phone || '').includes(searchQuery) ||
    (emp.jobDetails?.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />
      
      <div className="p-8 lg:px-12 max-w-7xl mx-auto w-full flex-1">
        {!isAdmin ? (
          /* Employee Dashboard (Spec 3.2.1) */
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.fullName || user.email || 'Employee'}!</h1>
              <p className="text-purple-100">Here is your personal Human Resource management portal. Select a quick-access action below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                onClick={() => navigate('/employee/me')}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-500 transition cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
                  <User size={26} />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Profile</h3>
                <p className="text-slate-500 text-xs mt-1">View personal details, job role, and read-only salary structure</p>
              </div>

              <div 
                onClick={() => navigate('/attendance')}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-500 transition cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Clock size={26} />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Attendance</h3>
                <p className="text-slate-500 text-xs mt-1">Check in/out and view your daily and weekly attendance records</p>
              </div>

              <div 
                onClick={() => navigate('/timeoff')}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-500 transition cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition">
                  <Calendar size={26} />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Leave Requests</h3>
                <p className="text-slate-500 text-xs mt-1">Apply for paid, sick, or unpaid time-off on the calendar</p>
              </div>

              <div 
                onClick={handleLogout}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-red-500 transition cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition">
                  <LogOut size={26} />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Logout</h3>
                <p className="text-slate-500 text-xs mt-1">Securely end your session and exit the HRMS system</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle className="text-purple-600" size={20} />
                Recent Activity & Alerts
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={myAttendanceToday ? "text-green-500" : "text-amber-500"} size={20} />
                    <div>
                      <div className="font-medium text-slate-800 text-sm">Today's Check-In Status</div>
                      <div className="text-xs text-slate-500">
                        {myAttendanceToday ? `Checked in at ${new Date(myAttendanceToday.checkIn).toLocaleTimeString()}` : "You have not checked in today yet. Use the top Navbar dropdown to Check IN."}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${myAttendanceToday ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {myAttendanceToday ? myAttendanceToday.status.toUpperCase() : "PENDING"}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-blue-500" size={20} />
                    <div>
                      <div className="font-medium text-slate-800 text-sm">Time-Off Allocation Ready</div>
                      <div className="text-xs text-slate-500">You can select date ranges directly on the calendar to submit leave requests.</div>
                    </div>
                  </div>
                  <button onClick={() => navigate('/timeoff')} className="text-xs text-purple-600 font-medium hover:underline">View Calendar →</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Admin / HR Dashboard (Spec 3.2.2) */
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Employee Management</h1>
                <p className="text-slate-500 text-sm mt-1">Manage employees, review attendance, and oversee payroll details.</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-[260px]">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search employees..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500" 
                  />
                </div>
                <button 
                  onClick={() => setShowNewModal(true)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <Plus size={18} />
                  NEW
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500">Loading employees...</div>
            ) : filteredEmployees.length === 0 ? (
              <div className="py-20 text-center text-slate-500 bg-white rounded-xl border">No employees found matching your search.</div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                {filteredEmployees.map(emp => (
                  <EmployeeCard 
                    key={emp._id} 
                    employee={emp} 
                    status={getTodayStatus(emp.userId?._id)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showNewModal && <NewEmployeeModal close={() => setShowNewModal(false)} onSuccess={fetchData} />}
    </div>
  );
};

export default Dashboard;
