import { QrCode, Sliders, LineChart, Download, CreditCard, Sparkles } from 'lucide-react';

const COMING_SOON_FEATURES = [
  {
    icon: QrCode,
    title: 'QR Code & Email Invitations',
    desc: 'Scan instant group QR codes or invite friends via auto-magic email invites with one tap.',
    tag: 'Group Collab',
  },
  {
    icon: Sliders,
    title: 'Custom Shares & Itemized Receipt Split',
    desc: 'Snap a receipt photo with OCR recognition to assign individual menu items to group members.',
    tag: 'Smart Splitting',
  },
  {
    icon: LineChart,
    title: 'Predictive Spending Insights',
    desc: 'AI-driven budget forecasts and automated spend alerts to prevent end-of-month budget shocks.',
    tag: 'Analytics',
  },
  {
    icon: Download,
    title: 'Export to PDF & CSV Reports',
    desc: 'Generate branded PDF summary invoices and audit-ready spreadsheets for trip archives.',
    tag: 'Reporting',
  },
  {
    icon: CreditCard,
    title: 'Direct UPI & Payment Gateway',
    desc: 'Settle debts instantly via Razorpay, Google Pay, and UPI deep-links right inside the dashboard.',
    tag: 'Instant Pay',
  },
];

const ComingSoonSection = () => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FEE8EB] shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FEE8EB] text-[#E60023]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-[#111111]">
              Roadmap & Upcoming Innovations
            </h3>
          </div>
          <p className="text-xs text-[#767676] mt-1">
            Exciting additions in progress for next phase releases
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF5F6] text-[#E60023] border border-[#FCD5DA]">
          SplitSync 2.0
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMING_SOON_FEATURES.map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-[#FAF9F8] border border-[#FEE8EB] hover:border-[#FCD5DA] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-[#FEE8EB] flex items-center justify-center text-[#E60023] group-hover:scale-105 transition-transform">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FEE8EB] text-[#C8001A]">
                  Coming Soon
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#111111] mb-1.5">{item.title}</h4>
              <p className="text-xs text-[#767676] leading-relaxed">{item.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#FEE8EB] flex justify-between items-center text-[11px] text-[#E60023] font-semibold">
              <span>{item.tag}</span>
              <span className="text-[#767676] font-normal">Q2 2026</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComingSoonSection;
