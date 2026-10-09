import React, { useState } from 'react';
import { Video, Shield, Zap, MonitorSmartphone, Users, ChevronDown, Mic, Phone, Bell, X, Share2, MessageSquare } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const LandingPage = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#fbfcff] text-slate-900 font-sans overflow-hidden relative">
      
      {/* ================= MODALS ================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm z-[100]">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto transform transition-all">
            
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-600 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'privacy' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-indigo-50 p-3 rounded-2xl">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Privacy Policy</h2>
                    <p className="text-xs text-slate-500">Last updated: October 2026</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                  <p>
                    At <strong>NetMeet</strong>, we prioritize your absolute privacy. Because NetMeet is built on a peer-to-peer (P2P) WebRTC architecture, your audio, video streams, and chat messages travel directly between you and your meeting participants.
                  </p>
                  <h4 className="font-semibold text-slate-900 mt-4">1. Data We Do Not Collect</h4>
                  <p>
                    We <strong>do not</strong> record, store, or monitor your audio/video calls or real-time text chats on any servers. Your media content never touches our signaling infrastructure once the peer connection is established.
                  </p>
                  <h4 className="font-semibold text-slate-900 mt-4">2. Authentication Data</h4>
                  <p>
                    We use Clerk for secure authentication. Only basic account identifiers (such as your name and email provided via sign-in) are handled securely through Clerk to manage room access.
                  </p>
                  <h4 className="font-semibold text-slate-900 mt-4">3. Signaling Server Logs</h4>
                  <p>
                    Our lightweight Socket.io signaling server only processes temporary session descriptions required to establish initial peer handshakes. These logs are wiped immediately after a call ends.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'terms' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-indigo-50 p-3 rounded-2xl">
                    <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Terms of Service</h2>
                    <p className="text-xs text-slate-500">Last updated: October 2026</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                  <p>
                    Welcome to <strong>NetMeet</strong>. By accessing or using our open-source video communication platform, you agree to comply with and be bound by these Terms of Service.
                  </p>
                  <h4 className="font-semibold text-slate-900 mt-4">1. Acceptable Use</h4>
                  <p>
                    You agree not to use NetMeet for any unlawful, harmful, or abusive activities. Because rooms are initialized via shareable links, you are responsible for maintaining control over who you invite into your sessions.
                  </p>
                  <h4 className="font-semibold text-slate-900 mt-4">2. Open-Source & "As-Is" Basis</h4>
                  <p>
                    NetMeet is provided as an open-source project on an "as-is" and "as-available" basis without warranties of any kind, whether express or implied.
                  </p>
                  <h4 className="font-semibold text-slate-900 mt-4">3. Limitation of Liability</h4>
                  <p>
                    In no event shall the creators or maintainers of NetMeet be liable for any indirect, incidental, or consequential damages arising from your use of the platform or network disruptions.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center space-x-2 cursor-pointer group active:scale-95 transition-transform" onClick={() => window.scrollTo(0,0)}>
          <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
            <Video className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">NetMeet</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 active:opacity-70 transition-all">Features</a>
          <a href="#tech" className="hover:text-indigo-600 active:opacity-70 transition-all">Technology</a>
          <a href="#faq" className="hover:text-indigo-600 active:opacity-70 transition-all">FAQ</a>
        </div>

        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 active:opacity-70 transition-all cursor-pointer">
                Sign in
              </button>
            </SignInButton>
            
            <SignInButton mode="modal">
              <button className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5">
                Start a meeting
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center space-x-3">
              <button 
                onClick={onGetStarted} 
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5"
              >
                Go to Room
              </button>
              
              <div className="flex items-center bg-slate-100 p-1.5 rounded-full border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="flex flex-col items-center text-center pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <p className="text-indigo-600 font-semibold tracking-wide text-sm mb-4 uppercase tracking-widest">
          Open-Source Peer-to-Peer Communication
        </p>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-slate-900">
          Video calls built for <br/> speed and simplicity
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl">
          Connect instantly with zero-latency WebRTC streams. No downloads, no heavy media servers tracking your data. Just you and your team in perfect sync.
        </p>
        
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-8 py-3.5 rounded-full text-base font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mb-16 inline-block cursor-pointer">
              Get NetMeet Free
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-8 py-3.5 rounded-full text-base font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mb-16 inline-block cursor-pointer">
            Enter Meeting Room
          </button>
        </SignedIn>

        {/* CUSTOM NETMEET P2P ARCHITECTURE DEMO GRAPHIC */}
        <div className="w-full max-w-5xl bg-[#0e1017] rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.3)] hover:shadow-[0_25px_65px_rgba(79,70,229,0.2)] overflow-hidden p-6 lg:p-8 border-2 border-slate-800 relative transition-all duration-500">
          
          <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block hover:opacity-80 cursor-pointer"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block hover:opacity-80 cursor-pointer"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block hover:opacity-80 cursor-pointer"></span>
              <span className="text-xs text-slate-400 ml-3 font-mono bg-slate-800/50 px-3 py-1 rounded-md">netmeet.live/room/secure-p2p</span>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>WebRTC Direct P2P Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="bg-[#14161f] rounded-2xl p-4 border border-slate-700/80 hover:border-indigo-500/50 relative overflow-hidden aspect-video flex flex-col justify-between transition-colors duration-300 group">
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-slate-200 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-medium">Host (You)</span>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600" 
                alt="Portrait of the meeting host in a brightly lit room" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 opacity-90 group-hover:opacity-100 transform group-hover:-translate-y-1 transition-all duration-300">
                <div className="bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center space-x-4 text-white shadow-xl border border-white/10">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <Video className="w-4 h-4 text-indigo-400" />
                  <Share2 className="w-4 h-4 text-teal-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#14161f] rounded-2xl p-4 border border-slate-700/80 hover:border-emerald-500/50 relative overflow-hidden aspect-video flex flex-col justify-between transition-colors duration-300 group">
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-slate-200 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-medium">Guest Peer</span>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" 
                alt="Portrait of the guest peer connecting from an office setting" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute bottom-4 right-4 z-10 transform group-hover:-translate-y-1 transition-all duration-300">
                <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-lg font-mono shadow-lg border border-indigo-500 flex items-center space-x-1.5">
                  <Shield className="w-3 h-3" />
                  <span>AES-256</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-4 text-xs text-slate-400 font-mono">
            <span className="bg-slate-800/50 px-3 py-1 rounded-md">Client A</span>
            <div className="h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent flex-1 relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
            </div>
            <span className="text-indigo-300 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/30 font-medium">Zero Server Routing</span>
            <div className="h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent flex-1 relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <span className="bg-slate-800/50 px-3 py-1 rounded-md">Client B</span>
          </div>
        </div>
      </header>

      {/* CORE PRIVACY FEATURE */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Talk in total privacy</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              While other video conferencing apps can snoop on your calls and store your data on their servers, NetMeet is completely confidential. WebRTC peer-to-peer architecture ensures your audio, video, and chats travel directly to your guest and stay private, even from us.
            </p>
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-8 py-3.5 rounded-full text-base font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 inline-block cursor-pointer">
                  Start a free meeting
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-8 py-3.5 rounded-full text-base font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 inline-block cursor-pointer">
                Start a free meeting
              </button>
            </SignedIn>
          </div>

          <div className="w-full lg:w-1/2 relative mt-12 lg:mt-0 pl-6 md:pl-12">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl relative bg-slate-200 group">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                alt="Business professional smiling during a secure NetMeet video conference call" 
                className="w-full h-auto object-cover aspect-[4/3] transform group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <div className="bg-[#2d2f36]/90 backdrop-blur-md rounded-2xl px-6 py-3 flex items-center space-x-5 shadow-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-slate-700/80 hover:bg-slate-600 active:scale-90 flex items-center justify-center transition-all cursor-pointer"><Mic className="w-4 h-4 text-white"/></div>
                  <div className="w-10 h-10 rounded-full bg-slate-700/80 hover:bg-slate-600 active:scale-90 flex items-center justify-center transition-all cursor-pointer"><Video className="w-4 h-4 text-white"/></div>
                  <div className="w-12 h-12 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-90 flex items-center justify-center shadow-md ml-2 transition-all cursor-pointer"><Phone className="w-5 h-5 text-white"/></div>
                </div>
              </div>
            </div>

            <div className="absolute -top-8 -left-4 md:-left-8 w-36 md:w-48 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-[6px] border-[#fbfcff] z-20 hover:-translate-y-2 transition-transform duration-300">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=300" 
                  alt="Picture-in-picture view of a secondary meeting participant" 
                  className="w-full h-auto object-cover aspect-square" 
                />
                <div className="absolute inset-0 border-[3px] border-teal-400 rounded-xl pointer-events-none m-1"></div>
              </div>
            </div>

            <div className="absolute -top-10 right-4 md:-right-6 w-20 h-20 bg-white rounded-3xl shadow-[0_15px_40px_-10px_rgba(79,70,229,0.3)] flex items-center justify-center z-20 hover:rotate-12 transition-transform duration-300 cursor-pointer">
               <Bell className="w-8 h-8 text-indigo-500 fill-indigo-500/20 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="features" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          <div className="flex flex-col group hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-indigo-50 group-hover:bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 transition-colors duration-300 shadow-sm">
              <Zap className="text-indigo-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Start in seconds</h3>
            <p className="text-slate-600 leading-relaxed">
              Create meetings and invite guests with a single URL. Our custom signaling server connects peers instantly without requiring accounts.
            </p>
          </div>

          <div className="flex flex-col group hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-indigo-50 group-hover:bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 transition-colors duration-300 shadow-sm">
              <MonitorSmartphone className="text-indigo-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Join from any device</h3>
            <p className="text-slate-600 leading-relaxed">
              Responsive UI featuring a custom Picture-in-Picture mode that seamlessly adapts to mobile screens without dropping the video feed.
            </p>
          </div>

          <div className="flex flex-col group hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-indigo-50 group-hover:bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 transition-colors duration-300 shadow-sm">
              <Shield className="text-indigo-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Direct & Secure</h3>
            <p className="text-slate-600 leading-relaxed">
              Media never touches our servers. WebRTC establishes a direct, encrypted connection between participants for true privacy.
            </p>
          </div>

          <div className="flex flex-col group hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-indigo-50 group-hover:bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 transition-colors duration-300 shadow-sm">
              <Users className="text-indigo-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Zero-Latency</h3>
            <p className="text-slate-600 leading-relaxed">
              Enjoy uninterrupted video, audio, and screen sharing powered by optimized Socket.io tripwires and Google STUN servers.
            </p>
          </div>
        </div>
      </section>

      {/* TECHNICAL CARDS */}
      <section id="tech" className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Enterprise logic, in your browser</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Built from the ground up using modern web technologies to ensure your calls remain stable, even on poor networks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-3xl p-8 text-white flex flex-col items-start justify-end h-80 overflow-hidden group shadow-lg hover:shadow-2xl shadow-slate-200 border border-slate-200 hover:-translate-y-2 active:scale-[0.98] transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-[#0e1017]/60 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" 
                alt="Abstract glowing technology network map representing WebRTC infrastructure" 
                className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="relative z-20 transform group-hover:translate-y-[-8px] transition-transform duration-300">
                <h3 className="text-xl font-bold mb-3">WebRTC Architecture</h3>
                <p className="text-slate-200 text-sm leading-relaxed drop-shadow-md">Bypassing media servers completely to eliminate bandwidth bottlenecks and deliver zero-latency streams.</p>
              </div>
            </div>
            
            <div className="relative rounded-3xl p-8 text-white flex flex-col items-start justify-end h-80 overflow-hidden group shadow-lg hover:shadow-2xl shadow-slate-200 border border-slate-200 hover:-translate-y-2 active:scale-[0.98] transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-[#0e1017]/60 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800" 
                alt="Digital network nodes and global data connections over Earth representing smart peer disconnects" 
                className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="relative z-20 transform group-hover:translate-y-[-8px] transition-transform duration-300">
                <h3 className="text-xl font-bold mb-3">Smart Disconnects</h3>
                <p className="text-slate-200 text-sm leading-relaxed drop-shadow-md">Custom 5-second server heartbeats detect tab closures instantly, cleanly resetting the room for other peers.</p>
              </div>
            </div>

            <div className="relative rounded-3xl p-8 text-white flex flex-col items-start justify-end h-80 overflow-hidden group shadow-lg hover:shadow-2xl shadow-slate-200 border border-slate-200 hover:-translate-y-2 active:scale-[0.98] transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-[#0e1017]/60 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>
              <img 
                src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800" 
                alt="Computer screen displaying lines of code for dynamic UI binding" 
                className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="relative z-20 transform group-hover:translate-y-[-8px] transition-transform duration-300">
                <h3 className="text-xl font-bold mb-3">Dynamic UI Binding</h3>
                <p className="text-slate-200 text-sm leading-relaxed drop-shadow-md">React Callback Refs ensure video tracks never detach from the DOM during complex mobile layout shifts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">Frequently asked questions</h2>
        
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button onClick={() => toggleFaq(1)} className="flex justify-between items-center w-full p-6 text-left focus:outline-none cursor-pointer active:bg-slate-50 transition-colors">
              <span className="font-semibold text-slate-900">Is NetMeet completely free?</span>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === 1 && (
              <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-fadeIn">
                Yes! NetMeet is an open-source project. Because we use WebRTC to connect you directly with your peers, we don't have to pay for expensive video-routing servers, allowing us to keep the platform free forever.
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button onClick={() => toggleFaq(2)} className="flex justify-between items-center w-full p-6 text-left focus:outline-none cursor-pointer active:bg-slate-50 transition-colors">
              <span className="font-semibold text-slate-900">Do my guests need an account to join?</span>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === 2 && (
              <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-fadeIn">
                No. Only the host needs to sign in to generate a secure meeting link. Anyone you share the link with can join your room instantly right from their browser, no account or downloads required.
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button onClick={() => toggleFaq(3)} className="flex justify-between items-center w-full p-6 text-left focus:outline-none cursor-pointer active:bg-slate-50 transition-colors">
              <span className="font-semibold text-slate-900">Is my communication secure?</span>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openFaq === 3 ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === 3 && (
              <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-fadeIn">
                Absolutely. Because NetMeet utilizes a peer-to-peer architecture, your audio, video, and screen-sharing data travels directly between you and the other participants. Your private media data never touches our servers.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <div className="flex items-center space-x-2 mb-6 md:mb-0 group cursor-pointer active:scale-95 transition-transform" onClick={() => window.scrollTo(0,0)}>
             <Video className="text-indigo-600 w-5 h-5 group-hover:scale-110 transition-transform" />
             <span className="font-bold text-slate-900 text-base">NetMeet</span>
             <span className="pl-4 border-l border-slate-300 font-medium">© 2026 Aman Kumar.</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <a href="#features" className="hover:text-indigo-600 active:opacity-70 font-medium transition-all">Features</a>
            
            <button 
              onClick={() => setActiveModal('privacy')} 
              className="hover:text-indigo-600 active:opacity-70 font-medium transition-all cursor-pointer bg-transparent border-none text-sm text-slate-500 p-0"
            >
              Privacy Policy
            </button>
            
            <button 
              onClick={() => setActiveModal('terms')} 
              className="hover:text-indigo-600 active:opacity-70 font-medium transition-all cursor-pointer bg-transparent border-none text-sm text-slate-500 p-0"
            >
              Terms of Service
            </button>
            
            <a href="https://github.com/aman830-ak" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 active:opacity-70 font-medium transition-all">GitHub</a>
            <a href="https://www.linkedin.com/in/aman-kumar-9b497428b" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 active:opacity-70 font-medium transition-all">LinkedIn</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;