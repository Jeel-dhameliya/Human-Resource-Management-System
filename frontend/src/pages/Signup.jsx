import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Upload } from 'lucide-react';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [logoFile, setLogoFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('companyName', formData.companyName);
      data.append('phone', formData.phone);
      data.append('role', 'admin');
      
      if (logoFile) {
        data.append('logo', logoFile);
      }
      
      const response = await axios.post('/api/auth/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">Human Resource Management System</h1>
      </div>
      
      <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-[600px] hover:-translate-y-1 transition-transform duration-300">
        <h2 className="text-center mb-8 text-2xl font-medium flex justify-center">
          {logoFile ? (
            <img 
              src={URL.createObjectURL(logoFile)} 
              alt="Logo Preview" 
              className="max-h-[60px] object-contain"
            />
          ) : (
            'App/Web Logo'
          )}
        </h2>

        {error && <div className="text-red-500 mb-4 text-center text-sm">{error}</div>}
        {success && <div className="text-green-500 mb-4 text-center text-sm">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6 relative flex gap-3 items-end">
            <div className="flex-1">
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-800 mb-2">Company Name :-</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="w-full px-4 py-3 text-base text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 transition-all"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="relative">
              <input 
                type="file" 
                id="logo" 
                name="logo" 
                accept="image/*" 
                onChange={handleFileChange}
                className="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer z-10"
              />
              <button type="button" className="inline-flex items-center justify-center p-3.5 bg-purple-500 text-white rounded-lg cursor-pointer hover:bg-purple-600 transition-colors pointer-events-none" title="Upload Logo">
                <Upload size={20} />
              </button>
            </div>
          </div>

          <div className="mb-6 relative">
            <label htmlFor="name" className="block text-sm font-medium text-slate-800 mb-2">Name :-</label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-3 text-base text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 transition-all"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6 relative">
            <label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-2">Email :-</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-3 text-base text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6 relative">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-800 mb-2">Phone :-</label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="w-full px-4 py-3 text-base text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 transition-all"
              value={formData.phone}
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

          <div className="mb-6 relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-800 mb-2">Confirm Password :-</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-4 py-3 text-base text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 transition-all"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-[2.4rem] text-slate-500 hover:text-purple-600 flex items-center justify-center cursor-pointer bg-transparent border-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="w-full p-3.5 text-base font-semibold text-white bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg shadow-[0_4px_12px_rgba(155,81,224,0.3)] hover:shadow-[0_6px_16px_rgba(155,81,224,0.4)] hover:-translate-y-px active:translate-y-px transition-all cursor-pointer border-none" disabled={loading}>
            {loading ? 'SIGNING UP...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center text-[0.95rem] text-slate-500">
          Already have an account? <Link to="/login" className="text-purple-500 font-medium hover:text-purple-600 hover:underline transition-colors">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
