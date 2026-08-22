import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';
import StaticSEO from '../../components/StaticSEO';
import { useCart } from '../../context/CartContext';

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { syncCartFromServer } = useCart();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      localStorage.setItem('dk_exporting_token', data.token);
      await syncCartFromServer();
      navigate('/address');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <StaticSEO 
        pagePath="/signup" 
        defaultTitle="Sign Up - DK Exporting | Create an Account" 
        defaultDescription="Create your DK Exporting account with quick mobile OTP verification to explore our premium spices and nuts collection." 
      />
      <div className="auth-container">
        <h2>Create an Account</h2>
        <p className="auth-subtitle">
          {step === 1 ? 'Enter your mobile number to get started' : 'Verify mobile number and set password'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="auth-form">
            <div className="auth-form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="auth-form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your mobile number"
                required
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySignup} className="auth-form">
            <div className="auth-form-group">
              <label>Mobile Number</label>
              <input type="tel" value={phone} disabled className="disabled-input" />
            </div>
            <div className="auth-form-group">
              <label>OTP Sent to Mobile Number</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
              />
            </div>
            <div className="auth-form-group">
              <label>Create Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a secure password"
                required
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign Up'}
            </button>
            <button 
              type="button" 
              className="auth-link-btn" 
              onClick={() => setStep(1)}
              style={{ marginTop: '12px' }}
            >
              Change Mobile Number
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
