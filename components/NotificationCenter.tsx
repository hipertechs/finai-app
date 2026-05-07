
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-xs w-full">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onRemove={() => removeNotification(n.id)} />
      ))}
    </div>
  );
};

const NotificationItem: React.FC<{ notification: Notification; onRemove: () => void }> = ({ notification, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50',
    error: 'bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50',
    warning: 'bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50',
    info: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-xl animate-in fade-in slide-in-from-right-4 duration-300 ${bgColors[notification.type]}`}>
      <div className="shrink-0">{icons[notification.type]}</div>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex-1">{notification.message}</p>
      <button onClick={onRemove} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
};

export default NotificationCenter;
