// src/pages/Privacy.jsx
import React from 'react';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0e1017] text-slate-200 py-24 px-6 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        </div>
        <p>At NetMeet, we prioritize absolute privacy through peer-to-peer (P2P) WebRTC architecture.</p>
        <h2 className="text-xl font-semibold text-white mt-8">1. Data We Do Not Collect</h2>
        <p>We do not record, store, or monitor your audio/video calls or real-time text chats. Media content travels directly between peers and never touches our servers.</p>
        <h2 className="text-xl font-semibold text-white mt-8">2. Authentication Data</h2>
        <p>We use Clerk for secure authentication. Basic identifiers (name, email) are handled securely through Clerk to manage room access.</p>
        <h2 className="text-xl font-semibold text-white mt-8">3. Signaling Server Logs</h2>
        <p>Our Socket.io server processes temporary session descriptions for peer handshakes. These are wiped immediately after connection.</p>
        <h2 className="text-xl font-semibold text-white mt-8">4. Analytics</h2>
        <p>We use Google Analytics to measure site traffic. IPs are anonymized, and tracking is only enabled for European users upon explicit consent.</p>
      </div>
    </div>
  );
}