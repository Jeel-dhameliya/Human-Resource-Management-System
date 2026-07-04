import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the global company logo
    axios.get('/api/auth/company-logo')
      .then(res => setCompanyInfo(res.data))
      .catch(() => console.log('No global company logo found yet.'));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Assuming backend is running on localhost:5000 for now. We can proxy it later.
      const response = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard'); // placeholder
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">Human Resource Management System</h1>
      </div>
      
      <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-[480px] hover:-translate-y-1 transition-transform duration-300">
        <h2 className="text-center mb-8 text-2xl font-medium flex justify-center">
          {companyInfo?.logoUrl ? (
            <img 
              src={companyInfo.logoUrl.startsWith('http') ? companyInfo.logoUrl : `http://localhost:5001/${companyInfo.logoUrl.replace(/^\//, '').replace(/\\/g, '/')}`} 
              alt={companyInfo.companyName || "Company Logo"} 
              className="max-h-[60px] object-contain"
            />
          ) : (
            'App/Web Logo'
          )}
        </h2>

        {error && <div className="text-red-500 mb-4 text-center text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6 relative">
            <label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-2">Login Id/Email :-</label>
            <input
              type="text"
              id="email"
              name="email"
              className="w-full px-4 py-3 text-base text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-sm font-medium text-slate-800 mb-2">Password :-</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="w-full px-4 py-3 text-base text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 transition-all"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-[2.4rem] text-slate-500 hover:text-purple-600 flex items-center justify-center cursor-pointer bg-transparent border-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="w-full p-3.5 text-base font-semibold text-white bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg shadow-[0_4px_12px_rgba(155,81,224,0.3)] hover:shadow-[0_6px_16px_rgba(155,81,224,0.4)] hover:-translate-y-px active:translate-y-px transition-all cursor-pointer border-none" disabled={loading}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-8 text-center text-[0.95rem] text-slate-500">
          Don't have an Account? <Link to="/signup" className="text-purple-500 font-medium hover:text-purple-600 hover:underline transition-colors">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
