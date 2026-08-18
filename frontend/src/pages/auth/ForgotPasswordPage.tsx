import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';
import StaticSEO from '../../components/StaticSEO';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep(2);
      setSuccess(data.message || 'OTP sent successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, password: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(data.message || 'Password reset successful');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <StaticSEO 
        pagePath="/forgot-password" 
        defaultTitle="Forgot Password - DK Exporting | Reset Your Password" 
        defaultDescription="Reset your DK Exporting account password securely using mobile OTP verification." 
      />
      <div className="auth-container">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          {step === 1 
            ? 'Enter your email to receive an OTP' 
            : 'Enter the OTP and your new password'}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-error" style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #10b981' }}>{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="auth-form">
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
          <form onSubmit={handleResetPassword} className="auth-form">
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
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
            <div className="auth-form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button 
              type="button" 
              className="auth-link-btn" 
              onClick={() => setStep(1)}
              style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--maroon)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
            >
              Change Mobile Number
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remember your password? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
