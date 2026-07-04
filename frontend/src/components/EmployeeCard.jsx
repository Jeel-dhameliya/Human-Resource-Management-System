import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';

const EmployeeCard = ({ employee, status }) => {
  const navigate = useNavigate();
  let StatusIcon;
  let statusColor;

  if (status === 'present') {
    statusColor = '#00e676'; // Green
    StatusIcon = <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white z-10 shadow-sm" style={{ backgroundColor: statusColor }}></div>;
  } else if (status === 'leave') {
    statusColor = '#00b0ff'; // Blue
    StatusIcon = (
      <div className="absolute -top-1.5 -right-1.5 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.2)] bg-white rounded-full p-0.5 flex items-center justify-center" style={{ color: statusColor }}>
        <Plane size={14} />
      </div>
    );
  } else {
    // default to absent (yellow)
    statusColor = '#ffd700'; // Yellow
    StatusIcon = <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white z-10 shadow-sm" style={{ backgroundColor: statusColor }}></div>;
  }

  const renderAvatar = () => {
    if (employee.personalDetails?.profilePic) {
      const pic = employee.personalDetails.profilePic;
      return <img src={pic.startsWith('http') ? pic : `http://localhost:5001/${pic.replace(/^\//, '').replace(/\\/g, '/')}`} alt={employee.fullName} className="w-full h-full object-cover" />;
    }
    return <div className="font-semibold text-slate-500 text-2xl">{employee.fullName.charAt(0).toUpperCase()}</div>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center relative hover:shadow-md hover:border-purple-500 hover:-translate-y-0.5" onClick={() => navigate(`/employee/${employee._id}`)}>
      <div className="w-full flex justify-between items-start absolute top-4 left-4 right-4 w-auto">
        <input type="radio" className="cursor-pointer w-4 h-4 accent-purple-600" name="selectedEmployee" value={employee._id} onClick={(e) => e.stopPropagation()} />
        <div className="relative">
          {StatusIcon}
        </div>
      </div>
      
      <div className="flex flex-col items-center mt-4">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 overflow-hidden border border-slate-200">
          {renderAvatar()}
        </div>
        <div className="font-semibold text-slate-800 text-[1.1rem] text-center">
          {employee.fullName}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
