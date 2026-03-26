import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  msg: string;
  type: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ msg, type }) => {
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <CheckCircle size={14} /> : type === 'error' ? <AlertCircle size={14} /> : <Info size={14} />}
      <span>{msg}</span>
    </div>
  );
};
