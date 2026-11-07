import { useState, useRef, useEffect, useContext } from 'react';
import { Bell, Check, Clock, DollarSign, Users, UserPlus } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(SocketContext);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'EXPENSE_ADDED':
      case 'EXPENSE_UPDATED':
        return <DollarSign className="w-4 h-4 text-[#E60023]" />;
      case 'SETTLEMENT_RECORDED':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'MEMBER_JOINED':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#E60023]" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-[#767676] hover:text-[#111111] hover:bg-[#FFF5F6] transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E60023] text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-[#FEE8EB] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 border-b border-[#FEE8EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-[#111111]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEE8EB] text-[#C8001A]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#E60023] hover:text-[#C8001A] font-medium hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#FEE8EB]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-[#767676]">
                <Bell className="w-8 h-8 mx-auto text-[#FCD5DA] mb-2 stroke-1" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id || Math.random()}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                  className={`px-4 py-3 hover:bg-[#FFF5F6] transition-colors cursor-pointer flex gap-3 items-start ${
                    !notif.isRead ? 'bg-[#FFF5F6]/60' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white shadow-xs border border-[#FEE8EB] shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-medium truncate ${!notif.isRead ? 'text-[#111111] font-semibold' : 'text-[#767676]'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-[#767676] shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#767676] mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#E60023] shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
