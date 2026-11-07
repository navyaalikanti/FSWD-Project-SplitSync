import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Wallet,
  LogOut,
  User,
  Plus,
  Sparkles,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';

const Navbar = ({ onOpenAddExpense, onOpenLogin, onOpenRegister }) => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#FEE8EB] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand in Pinterest Red */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-[#E60023] flex items-center justify-center text-white shadow-md shadow-[#E60023]/25 group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[#111111]">
                  Split<span className="text-[#E60023]">Sync</span>
                </span>
                <span className="text-[10px] font-semibold text-[#767676] -mt-1 tracking-wider uppercase">
                  Expense Sharing
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#767676] hover:text-[#E60023] hover:bg-[#FFF5F6] transition-all"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/groups"
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#767676] hover:text-[#E60023] hover:bg-[#FFF5F6] transition-all"
                  >
                    My Groups
                  </Link>
                </>
              ) : (
                <>
                  <a
                    href="#features"
                    className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#767676] hover:text-[#E60023] hover:bg-[#FFF5F6] transition-all"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#767676] hover:text-[#E60023] hover:bg-[#FFF5F6] transition-all"
                  >
                    How It Works
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Right Section Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {onOpenAddExpense && (
                  <button
                    onClick={onOpenAddExpense}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FFF5F6] text-[#E60023] border border-[#FCD5DA] hover:bg-[#FEE8EB] transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Add Expense
                  </button>
                )}

                <NotificationDropdown />

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2 border-l border-[#FEE8EB]">
                  <div className="flex items-center gap-2">
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                      alt={user?.name}
                      className="w-9 h-9 rounded-full bg-[#FEE8EB] border-2 border-[#FCD5DA] object-cover"
                    />
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold text-[#111111] leading-tight truncate max-w-[120px]">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-[#767676] truncate max-w-[120px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    title="Log Out"
                    className="p-2 rounded-xl text-[#767676] hover:text-[#E60023] hover:bg-[#FFF5F6] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onOpenLogin?.(); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#767676] hover:text-[#111111] hover:bg-[#EFEFEF] transition-all"
                >
                  Login
                </button>

                <button
                  onClick={() => { onOpenRegister?.(); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all active:scale-98"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#767676] hover:text-[#111111] hover:bg-[#FFF5F6] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#FEE8EB] px-4 pt-2 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#111111] hover:bg-[#FFF5F6]"
              >
                Dashboard
              </Link>
              <Link
                to="/groups"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#111111] hover:bg-[#FFF5F6]"
              >
                My Groups
              </Link>
              {onOpenAddExpense && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAddExpense();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#E60023] hover:bg-[#FFF5F6]"
                >
                  + Add Expense
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin?.();
                }}
                className="w-full text-center px-4 py-2 rounded-xl text-sm font-medium text-[#111111] hover:bg-[#EFEFEF]"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister?.();
                }}
                className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
