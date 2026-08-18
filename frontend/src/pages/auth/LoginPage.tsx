import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';
import StaticSEO from '../../components/StaticSEO';
import { useCart } from '../../context/CartContext';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { syncCartFromServer } = useCart();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token (in real app, use Context/Redux and secure storage)
      localStorage.setItem('dk_exporting_token', data.token);
      await syncCartFromServer();
      
      // Redirect based on role
      if (data.user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <StaticSEO 
        pagePath="/login" 
        defaultTitle="Log In - DK Exporting | Welcome Back" 
        defaultDescription="Log in to your DK Exporting account to manage orders, track shipments, and access your wishlist." 
      />
      <div className="auth-container">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to your DK Exporting account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-form-group">
            <label>Mobile Number or Email</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your mobile number or email"
              required
            />
          </div>
          <div className="auth-form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
