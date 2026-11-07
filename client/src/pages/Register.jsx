import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Wallet, X } from 'lucide-react';

const Register = ({ onClose, onSwitchToLogin, isModal = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { label: '', color: 'bg-gray-200', width: 'w-0' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/3' };
    if (pass.length < 10) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      if (onClose) onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-[#FEE8EB] p-7 sm:p-8 space-y-5">
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

      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-[#E60023] flex items-center justify-center text-white mx-auto shadow-md shadow-[#E60023]/25">
          <Wallet className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111111]">Join SplitSync</h2>
        <p className="text-xs text-[#767676]">
          Split expenses and settle debts seamlessly with your circle
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            placeholder="e.g. Navya Alikanti"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
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
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
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
          {password && (
            <div className="mt-1">
              <div className="h-1.5 w-full bg-[#FEE8EB] rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
              </div>
              <div className="text-[10px] text-right mt-0.5 font-semibold text-[#767676]">{strength.label}</div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
            Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-xs text-[#767676]">
        Already have an account?{' '}
        {isModal && onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#E60023] hover:underline"
          >
            Log in
          </button>
        ) : (
          <Link to="/login" className="font-bold text-[#E60023] hover:underline">
            Log in
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

export default Register;
