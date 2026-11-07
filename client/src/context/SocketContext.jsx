import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastLiveEvent, setLastLiveEvent] = useState(null);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.warn('Could not fetch notifications:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Manage Socket.IO connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to SplitSync Socket.IO server');
    });

    // Real-time notification handler
    newSocket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setLastLiveEvent({ type: 'notification', data: notif, timestamp: Date.now() });
    });

    // Live group event handlers
    newSocket.on('expense_added', (data) => {
      setLastLiveEvent({ type: 'expense_added', data, timestamp: Date.now() });
    });

    newSocket.on('expense_updated', (data) => {
      setLastLiveEvent({ type: 'expense_updated', data, timestamp: Date.now() });
    });

    newSocket.on('expense_deleted', (data) => {
      setLastLiveEvent({ type: 'expense_deleted', data, timestamp: Date.now() });
    });

    newSocket.on('settlement_recorded', (data) => {
      setLastLiveEvent({ type: 'settlement_recorded', data, timestamp: Date.now() });
    });

    newSocket.on('member_joined', (data) => {
      setLastLiveEvent({ type: 'member_joined', data, timestamp: Date.now() });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  const joinGroup = useCallback((groupId) => {
    if (socket && groupId) {
      socket.emit('join_group', groupId);
    }
  }, [socket]);

  const leaveGroup = useCallback((groupId) => {
    if (socket && groupId) {
      socket.emit('leave_group', groupId);
    }
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        joinGroup,
        leaveGroup,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        lastLiveEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
