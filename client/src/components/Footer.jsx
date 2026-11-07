import { Wallet, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#FEE8EB] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#E60023] flex items-center justify-center text-white shadow-sm">
                <Wallet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#111111]">
                Split<span className="text-[#E60023]">Sync</span>
              </span>
            </div>
            <p className="text-sm text-[#767676] max-w-sm leading-relaxed">
              Real-time collaborative expense management and debt simplification engine.
              Split bills fairly, settle easily, and keep group finances in sync.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#FFF5F6] text-[#C8001A] border border-[#FCD5DA]">
              <Sparkles className="w-3.5 h-3.5 text-[#E60023]" />
              Full Stack Web Development Project
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-4">
              Features
            </h4>
            <ul className="space-y-2 text-sm text-[#767676]">
              <li><a href="#features" className="hover:text-[#E60023] transition-colors">Instant Splitting</a></li>
              <li><a href="#features" className="hover:text-[#E60023] transition-colors">Debt Simplification</a></li>
              <li><a href="#features" className="hover:text-[#E60023] transition-colors">Live Charts & Analytics</a></li>
              <li><a href="#features" className="hover:text-[#E60023] transition-colors">Real-time Sockets</a></li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-4">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-[#767676]">
              <li><Link to="/login" className="hover:text-[#E60023] transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-[#E60023] transition-colors">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#E60023] transition-colors">Dashboard</Link></li>
              <li><Link to="/groups" className="hover:text-[#E60023] transition-colors">Group Hub</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#FEE8EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#767676]">
          <p>© {new Date().getFullYear()} SplitSync. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3.5 h-3.5 text-[#E60023] fill-[#E60023]" /> for seamless group harmony
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
