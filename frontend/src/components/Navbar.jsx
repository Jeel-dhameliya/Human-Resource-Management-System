import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [myAttendance, setMyAttendance] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchNavbarData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        // Fetch company logo (first admin)
        const logoRes = await axios.get('/api/auth/company-logo');
        setCompanyInfo(logoRes.data);
      } catch (err) {
        console.log('No company logo found');
      }

      try {
        // Fetch my profile for the avatar
        const profileRes = await axios.get('/api/employees/me', config);
        setUserProfile(profileRes.data);

        // Fetch my attendance to determine check-in status
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const attRes = await axios.get(`/api/attendance/me?month=${month}&year=${year}`, config);
        
        // Find today's record
        const today = new Date().setHours(0, 0, 0, 0);
        const todayRecord = attRes.data.find(record => {
          return new Date(record.date).setHours(0, 0, 0, 0) === today;
        });
        setMyAttendance(todayRecord);

      } catch (err) {
        console.error('Error fetching navbar user data', err);
      }
    };

    fetchNavbarData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/attendance/checkin', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyAttendance(res.data.record);
      setDropdownOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/attendance/checkout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyAttendance(res.data.record);
      setDropdownOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  // Determine avatar status dot for the logged-in user
  let statusDotColor = '#ffd700'; // Yellow (absent default)
  if (myAttendance) {
    if (myAttendance.status === 'present' || myAttendance.status === 'half-day') {
      statusDotColor = '#00e676'; // Green
    } else if (myAttendance.status === 'leave') {
      statusDotColor = '#00b0ff'; // Blue airplane placeholder
    }
  }

  // Formatting time for systray
  const checkInTime = myAttendance?.checkIn 
    ? new Date(myAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : null;

  return (
    <nav className="flex justify-between items-center px-8 h-[70px] bg-white border-b border-slate-200 shadow-sm relative z-50">
      <div className="flex-1">
        {companyInfo?.logoUrl ? (
          <img 
            src={`http://localhost:5001${companyInfo.logoUrl}`} 
            alt="Company Logo" 
            className="max-h-10 object-contain" 
          />
        ) : (
          <div className="font-semibold text-xl text-purple-600">Company Logo</div>
        )}
      </div>

      <div className="flex gap-8">
        <div className="py-6 px-2 font-medium text-purple-600 cursor-pointer relative after:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[3px] after:bg-purple-600 after:rounded-t-sm">Employees</div>
        <div className="py-6 px-2 font-medium text-slate-500 cursor-pointer relative hover:text-slate-800 transition-colors" onClick={() => navigate('/attendance')}>Attendance</div>
        <div className="py-6 px-2 font-medium text-slate-500 cursor-pointer relative hover:text-slate-800 transition-colors">Time Off</div>
      </div>

      <div className="flex-1 flex justify-end">
        <div className="relative cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="w-[45px] h-[45px] rounded-full relative bg-slate-200 flex items-center justify-center border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            {userProfile?.personalDetails?.profilePic ? (
              <img src={`http://localhost:5001/${userProfile.personalDetails.profilePic}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="font-semibold text-slate-500 text-lg">{userProfile?.fullName?.[0] || 'U'}</div>
            )}
            <div className="absolute -top-[2px] -right-[2px] w-[14px] h-[14px] rounded-full border-2 border-white z-10" style={{ backgroundColor: statusDotColor }}></div>
          </div>
          
          {dropdownOpen && (
            <div className="absolute top-[60px] right-0 w-[220px] bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden transform origin-top-right transition-all">
              <div className="px-5 py-4 text-slate-800 font-medium cursor-pointer transition-colors flex items-center justify-between hover:bg-slate-50 hover:text-purple-600">My Profile</div>
              <div className="h-px bg-slate-200 m-0"></div>
              
              {!myAttendance?.checkIn && (
                <div className="px-5 py-4 text-slate-800 font-medium cursor-pointer transition-colors flex items-center justify-between hover:bg-slate-50 hover:text-purple-600" onClick={handleCheckIn}>
                  Check IN &rarr;
                </div>
              )}
              
              {myAttendance?.checkIn && !myAttendance?.checkOut && (
                <div className="bg-purple-50/50 py-2">
                  <div className="px-5 pb-2 text-xs text-slate-500">Since {checkInTime}</div>
                  <div className="px-5 py-4 text-slate-800 font-medium cursor-pointer transition-colors flex items-center justify-between hover:bg-slate-50 hover:text-purple-600" onClick={handleCheckOut}>
                    Check Out &rarr;
                  </div>
                </div>
              )}

              {myAttendance?.checkOut && (
                <div className="bg-purple-50/50 py-2">
                  <div className="px-5 pb-2 text-xs text-slate-500">Completed for today</div>
                </div>
              )}

              <div className="h-px bg-slate-200 m-0"></div>
              <div className="px-5 py-4 text-slate-800 font-medium cursor-pointer transition-colors flex items-center justify-between hover:bg-slate-50 hover:text-purple-600" onClick={handleLogout}>Log Out</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
