import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, Server, WifiOff } from 'lucide-react';

const NotFound = ({ onRetry, title, message }) => {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#0e1017] text-slate-100 font-sans flex items-center justify-center p-6 z-[999] overflow-hidden">
      
      {/* Background ambient glow effect */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#14161f] border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10 text-center flex flex-col items-center">
        
        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title & Message */}
        <h1 className="text-2xl font-bold text-white mb-2">
          {title || "404 - Page Not Found"}
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          {message || "The page you are looking for doesn't exist, or our signaling server experienced an unexpected disconnect."}
        </p>

        {/* System Diagnostics Box */}
        <div className="w-full bg-[#0a0c10] border border-slate-800/60 rounded-2xl p-4 mb-8 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center space-x-2">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Signaling Node</span>
            </span>
            <span className="text-red-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              <span>Disconnected</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center space-x-2">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>P2P Tunnel</span>
            </span>
            <span className="text-slate-500">Standby</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {onRetry ? (
            <button 
              onClick={onRetry}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-lg cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reconnect</span>
            </button>
          ) : (
            <Link 
              to="/"
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-lg cursor-pointer no-underline"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          )}
        </div>

        <p className="text-[11px] text-slate-500 mt-6 font-mono">
          NetMeet Open-Source Secure Architecture
        </p>

      </div>
    </div>
  );
};

export default NotFound;