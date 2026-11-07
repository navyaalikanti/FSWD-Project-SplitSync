import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Wallet, X } from 'lucide-react';

const Login = ({ onClose, onSwitchToRegister, isModal = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      if (onClose) onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-[#FEE8EB] p-7 sm:p-8 space-y-6">
      {isModal && onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-[#767676] hover:text-[#111111] hover:bg-[#FAF9F8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#E60023] flex items-center justify-center text-white mx-auto shadow-md shadow-[#E60023]/25">
          <Wallet className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111111]">Welcome Back</h2>
        <p className="text-xs text-[#767676]">
          Log in to manage your group expenses and settlements
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#111111]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-xs text-[#767676]">
        Don't have an account yet?{' '}
        {isModal && onSwitchToRegister ? (
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#E60023] hover:underline"
          >
            Create account
          </button>
        ) : (
          <Link to="/register" className="font-bold text-[#E60023] hover:underline">
            Create account
          </Link>
        )}
      </p>
    </div>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[#FAF9F8] py-12 px-4 sm:px-6 lg:px-8">
      {content}
    </div>
  );
};

export default Login;
