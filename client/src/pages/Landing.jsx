
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Receipt,
  Scale,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Landing = ({ onOpenLogin, onOpenRegister }) => {
  const { isAuthenticated } = useContext(AuthContext);

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Collaboration',
      desc: 'Instant updates via Socket.IO. When anyone adds or updates an expense, balances refresh live for all group members without reloading.',
    },
    {
      icon: Receipt,
      title: 'Smart Splitting Engine',
      desc: 'Support Equal, Exact, or Percentage splits. Integer minor unit (paise) math ensures zero floating-point calculation drift.',
    },
    {
      icon: Scale,
      title: 'Debt Simplification',
      desc: 'A Min-Cash-Flow graph algorithm reduces tangled multi-way debts into the smallest number of direct payments.',
    },
    {
      icon: PieChart,
      title: 'Live Analytics & Charts',
      desc: 'Interactive Recharts visualizations breaking down monthly trends, category distributions, and individual balances.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create or Join a Group',
      desc: 'Start a group for your trip, housemates, or college team. Share the 6-digit invite code with friends.',
    },
    {
      step: '02',
      title: 'Add & Split Expenses',
      desc: 'Log costs on the go. Choose who paid and whether to split equally, by exact amounts, or by percentages.',
    },
    {
      step: '03',
      title: 'Simplify & Settle Up',
      desc: 'Let our algorithm minimize debts. One-click settlement records payments and keeps balances transparent.',
    },
  ];

  const benefits = [
    'No manual spreadsheet formulas or rounding errors',
    'Instant notifications whenever an expense is logged',
    'Transparent ledger history for all repayments',
    'Minimizes transactions so you make fewer payments',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F8]">
      {/* Hero Section: Full-width edge-to-edge background image with no black shade */}
      <section
        className="relative w-full min-h-[calc(100vh-64px)] bg-cover bg-center bg-no-repeat flex items-center justify-end overflow-hidden"
        style={{
          backgroundImage: "url('/expense.jpg')",
        }}
      >
        {/* Content directly on the photo, shifted further right with larger font size */}
        <div className="w-full max-w-xl pl-4 pr-6 sm:pr-8 md:pr-10 lg:pr-12 xl:pr-16 py-12 space-y-5 mr-0 sm:mr-2 md:mr-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#111111] leading-[1.15]">
            Every Expense.
            <br />
            Every Friend.
            <br />
            <span className="text-[#E60023]">
              In Sync.
            </span>
          </h1>

          <p className="max-w-lg text-sm sm:text-base text-[#4a4a4a] leading-relaxed">
            Track shared expenses, split bills fairly, and settle up
            without the awkward calculations. Powered by an automated
            debt-simplification engine.
          </p>

          <div className="pt-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl text-sm sm:text-base font-bold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onOpenRegister?.()}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl text-sm sm:text-base font-bold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm font-medium text-[#333333]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Math Stress</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Socket.IO Live Sync</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Debt Optimization</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-white border-y border-[#FEE8EB]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FEE8EB] text-[#C8001A]">
              Complete Feature Suite
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Engineered for Frictionless Group Finances
            </h2>

            <p className="text-sm sm:text-base text-[#767676]">
              Eliminate complicated spreadsheets and endless WhatsApp
              arguments with intuitive tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="p-6 rounded-3xl bg-[#FAF9F8] border border-[#FEE8EB] hover:bg-white hover:border-[#E60023]/40 hover:shadow-lg hover:shadow-[#E60023]/5 transition-all duration-300 flex flex-col"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#FEE8EB] flex items-center justify-center text-[#E60023] mb-5">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h3 className="text-base font-bold text-[#111111] mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-[#767676] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#FAF9F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FEE8EB] text-[#C8001A]">
              Simplicity First
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              How SplitSync Works in 3 Steps
            </h2>

            <p className="text-sm sm:text-base text-[#767676]">
              Set up in seconds and manage shared expenses effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white p-7 rounded-3xl border border-[#FEE8EB] shadow-sm space-y-4 hover:border-[#E60023]/40 transition-colors"
              >
                <div className="text-3xl font-extrabold text-[#E60023]/30 font-mono">
                  {step.step}
                </div>

                <h3 className="text-lg font-bold text-[#111111]">
                  {step.title}
                </h3>

                <p className="text-sm text-[#767676] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose SplitSync Section */}
      <section className="py-16 bg-white border-t border-[#FEE8EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FEE8EB] text-[#C8001A]">
                Why Choose SplitSync?
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
                Built to Keep Friendships Drama-Free
              </h2>

              <p className="text-sm text-[#767676] leading-relaxed">
                Money conversations with friends don't have to be awkward.
                SplitSync provides total transparency, so everyone knows
                exactly where every rupee went and how to settle up with
                zero confusion.
              </p>

              <div className="space-y-3 pt-2">
                {benefits.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 text-sm text-[#111111] font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-[#E60023] text-white space-y-6 shadow-xl shadow-[#E60023]/20">
              <h3 className="text-2xl sm:text-3xl font-extrabold">
                Ready to Experience Effortless Group Expense Sharing?
              </h3>

              <p className="text-sm text-red-100 leading-relaxed">
                Join SplitSync today to start splitting shared costs,
                tracking balances, and settling debts in real time.
              </p>

              <div className="pt-2">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-[#E60023] font-bold text-sm text-center shadow-md hover:bg-red-50 transition-all"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenRegister?.()}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-[#E60023] font-bold text-sm text-center shadow-md hover:bg-red-50 transition-all cursor-pointer"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-[#FAF9F8] border-t border-[#FEE8EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#767676]">
          <p>
            © {new Date().getFullYear()} SplitSync. All rights reserved.
          </p>

          <p>Share expenses. Simplify friendships.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
