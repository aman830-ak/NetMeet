import React, { useContext, useState, useEffect, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, Share, 
  Users, MessageSquare, Smile, MoreVertical, Shield, X, Send, Copy, Check 
} from 'lucide-react';

export default function VideoPlayer({ meetingSettings }) {
  const { 
    name, callAccepted, myVideo, userVideo, callEnded, stream, remoteStream, call, leaveCall,
    toggleAudio, toggleVideo, shareScreen, isAudioMuted, isVideoOff,
    messages, sendMessage, persistentRoomId
  } = useContext(SocketContext);
  
  const navigate = useNavigate();

  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinNotification, setJoinNotification] = useState(null);
  const [timer, setTimer] = useState(0);
  const [messageInput, setMessageInput] = useState('');

  const localName = meetingSettings?.name || localStorage.getItem('netmeet_name') || name || 'You';
  const remoteName = call?.name || 'Guest';

  // 1. Bind LOCAL stream to the local video element
  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream, myVideo]);

  // 🔥 FIX: 2. Bind REMOTE stream to the remote video element and force playback
  useEffect(() => {
    if (userVideo.current && remoteStream) {
      userVideo.current.srcObject = remoteStream;
      
      // Mobile browsers often pause auto-playing video unless explicitly told to play
      userVideo.current.play().catch(err => {
        console.warn("Video auto-play prevented by browser policy:", err);
      });
    }
  }, [remoteStream, userVideo, callAccepted]);

  // Handle remote participant join notification toast
  useEffect(() => {
    if (callAccepted && !callEnded) {
      setJoinNotification(`${remoteName} joined the meeting`);
      const timerId = setTimeout(() => setJoinNotification(null), 4000);
      return () => clearTimeout(timerId);
    }
  }, [callAccepted, callEnded, remoteName]);

  // Meeting Duration Timer
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Intercept floating emoji payloads received via data channel
  useEffect(() => {
    if (messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg.text && latestMsg.text.startsWith('EMOJI_PAYLOAD:') && latestMsg.sender !== 'You') {
        const emoji = latestMsg.text.split(':')[1];
        showFloatingEmoji(emoji);
      }
    }
  }, [messages]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleLeave = () => {
    leaveCall();
    navigate('/left');
  };

  // Safe screen share toggle with fallback on cancellation
  const handleScreenShareClick = async () => {
    if (!isSharingScreen) {
      const screenTrack = await shareScreen(() => setIsSharingScreen(false));
      if (screenTrack) {
        setIsSharingScreen(true);
      }
    } else {
      if (myVideo.current && myVideo.current.srcObject) {
        const tracks = myVideo.current.srcObject.getVideoTracks();
        tracks.forEach(t => t.stop());
      }
    }
  };

  const showFloatingEmoji = (emoji) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 3000);
  };

  const triggerEmoji = (emoji) => {
    setShowEmojis(false);
    showFloatingEmoji(emoji); 
    sendMessage(`EMOJI_PAYLOAD:${emoji}`); 
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const copyMeetingLink = () => {
    let linkToCopy = window.location.href;
    
    if (!linkToCopy.includes('invite=')) {
      const baseUrl = window.location.origin + window.location.pathname;
      linkToCopy = `${baseUrl}?invite=${persistentRoomId}`;
    }
    
    navigator.clipboard.writeText(linkToCopy);
    setCopied(true);
    setShowMoreMenu(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (n) => n ? n.charAt(0).toUpperCase() : 'U';

  const visibleMessages = messages.filter(msg => msg.text && !msg.text.startsWith('EMOJI_PAYLOAD:'));

  return (
    <div className="h-[100dvh] w-full bg-[#0b101e] flex flex-col font-sans overflow-hidden text-slate-200 relative">
      
      {/* FLOATING EMOJIS OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
        {floatingEmojis.map(item => (
          <div key={item.id} className="absolute bottom-24 left-1/2 text-4xl md:text-5xl animate-bounce transition-all duration-1000 transform -translate-x-1/2 drop-shadow-2xl">
            {item.emoji}
          </div>
        ))}
      </div>

      {/* JOIN NOTIFICATION TOAST POPUP */}
      {joinNotification && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#171d2d] border border-slate-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 w-max max-w-[90vw]">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <span className="text-xs md:text-sm font-semibold truncate">{joinNotification}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex p-2 md:p-4 lg:p-6 gap-2 md:gap-4 lg:gap-6 relative h-[calc(100dvh-80px)] md:h-[calc(100dvh-96px)] w-full max-w-[1600px] mx-auto items-stretch justify-center">
        
        {/* VIDEO CONTAINER */}
        <div className="flex-1 flex items-center justify-center h-full w-full overflow-hidden">
          
          <div className={`flex w-full gap-2 md:gap-4 lg:gap-6 transition-all duration-300 items-center justify-center ${callAccepted && !callEnded ? 'flex-col md:flex-row h-full max-h-[85vh]' : 'flex-col max-w-[1000px] max-h-[80vh]'}`}>
            
            {/* LOCAL VIDEO TILE */}
            <div className={`relative bg-[#131826] rounded-2xl md:rounded-[24px] overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300 aspect-video md:aspect-auto ${
              callAccepted && !callEnded ? 'w-full md:w-1/2 h-1/2 md:h-full max-h-full' : 'w-full h-full' 
            }`}>
              
              <video 
                playsInline 
                muted 
                ref={myVideo} 
                autoPlay 
                className={`w-full h-full object-cover transform ${!isSharingScreen ? '-scale-x-100' : ''} ${isVideoOff && !isSharingScreen ? 'opacity-0 absolute' : 'opacity-100 relative'}`} 
              />
              
              {isVideoOff && !isSharingScreen && (
                <div className="absolute inset-0 z-10 bg-[#131826] flex items-center justify-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-[#3b4168] rounded-full flex items-center justify-center text-4xl md:text-5xl font-medium text-white shadow-lg">
                    {getInitials(localName)}
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 bg-[#0b101e]/70 backdrop-blur-md px-2 md:px-3.5 py-1.5 md:py-2 rounded-lg md:rounded-xl flex items-center gap-2 border border-white/5 z-20">
                <Shield className="w-3 md:w-4 h-3 md:h-4 text-slate-300" />
                <span className="text-xs md:text-sm font-semibold tracking-wide truncate max-w-[100px] md:max-w-[200px]">{localName} {isSharingScreen && '(Screen)'}</span>
              </div>
              
              {isAudioMuted && (
                <div className="absolute top-3 right-3 md:top-5 md:right-5 bg-slate-900/80 backdrop-blur-md p-2 md:p-3 rounded-full shadow-lg z-20">
                  <MicOff className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                </div>
              )}
            </div>

            {/* REMOTE VIDEO TILE */}
            {callAccepted && !callEnded && (
              <div className="relative bg-[#131826] rounded-2xl md:rounded-[24px] overflow-hidden shadow-2xl flex items-center justify-center w-full md:w-1/2 h-1/2 md:h-full max-h-full aspect-video md:aspect-auto">
                 {/* 🔥 Ensure the remote video tag is here and referenced properly */}
                 <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                
                <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 bg-[#0b101e]/70 backdrop-blur-md px-2 md:px-3.5 py-1.5 md:py-2 rounded-lg md:rounded-xl flex items-center gap-2 border border-white/5">
                  <Shield className="w-3 md:w-4 h-3 md:h-4 text-slate-300" />
                  <span className="text-xs md:text-sm font-semibold tracking-wide truncate max-w-[100px] md:max-w-[200px]">{remoteName}</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* SIDEBAR CHAT PANEL */}
        {isChatOpen && (
          <div className="absolute md:relative z-40 right-2 md:right-auto w-[calc(100%-16px)] md:w-[320px] lg:w-[380px] bg-[#131826] rounded-2xl md:rounded-[24px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right-4 shrink-0 h-[calc(100%-16px)] md:h-full border border-slate-800/60">
            <div className="p-4 md:p-5 border-b border-slate-800/50 flex items-center justify-between bg-[#171d2d]">
              <div className="flex items-center gap-2 font-bold text-white tracking-wide text-base md:text-lg">
                <Shield className="w-4 h-4 md:w-5 h-5 text-indigo-400" />
                Room Chat
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-4 md:p-5 overflow-y-auto flex flex-col gap-4">
              {visibleMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/40 flex items-center justify-center mb-3 text-xl">👋</div>
                  <p className="text-xs md:text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                visibleMessages.map((msg, index) => (
                  <div key={index} className={`p-3 rounded-2xl border border-slate-700/50 max-w-[85%] ${msg.sender === 'You' ? 'bg-indigo-600/40 self-end text-right border-indigo-500/30' : 'bg-slate-800/60 self-start'}`}>
                    <p className="text-[10px] md:text-xs font-bold text-indigo-400 mb-1">{msg.sender}</p>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed break-words">{msg.text}</p>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-slate-800/50 bg-[#171d2d]">
              <div className="bg-[#0b101e] rounded-full flex items-center pr-1 md:pr-2 border border-slate-700/50 focus-within:border-indigo-500 transition-colors">
                <input 
                  type="text" 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type message..." 
                  className="bg-transparent border-none outline-none text-xs md:text-sm px-3 md:px-4 py-2 md:py-3 w-full text-white placeholder-slate-500" 
                />
                <button type="submit" className="p-1.5 md:p-2 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"><Send className="w-4 h-4 md:w-5 md:h-5" /></button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROL BAR */}
      <div className="h-[80px] md:h-[96px] bg-[#0b101e] flex items-center justify-center md:justify-between px-2 md:px-8 shrink-0 relative z-50">
        
        {/* Hidden on Mobile */}
        <div className="hidden md:flex flex-col w-48">
          <span className="font-bold text-white tracking-wide text-sm mb-0.5">NetMeet Secure</span>
          <span className="text-slate-500 text-xs font-semibold">{formatTime(timer)}</span>
        </div>

        <div className="flex items-center justify-center gap-2 md:gap-3 relative w-full md:w-auto">
          
          {/* Emoji Tray */}
          {showEmojis && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#171d2d] border border-slate-700 rounded-full px-3 md:px-5 py-2 md:py-3 flex gap-3 md:gap-5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-50">
              {['👍','👎','👏','😂','❤️','🎉','🙌','✋'].map(e => (
                <button type="button" key={e} onClick={() => triggerEmoji(e)} className="hover:scale-125 transition-transform text-lg md:text-xl cursor-pointer">{e}</button>
              ))}
            </div>
          )}

          {/* 3-Dots Menu */}
          {showMoreMenu && (
            <div className="absolute bottom-full mb-4 right-0 md:left-1/2 md:-translate-x-1/2 bg-[#171d2d] border border-slate-700 rounded-2xl p-2 w-48 md:w-52 shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-50">
              <button 
                onClick={copyMeetingLink}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-[#21293e] rounded-xl transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
                <span>{copied ? 'Link Copied!' : 'Copy meeting link'}</span>
              </button>
            </div>
          )}

          <button onClick={toggleAudio} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all cursor-pointer shrink-0 ${!isAudioMuted ? 'bg-[#171d2d] hover:bg-[#21293e] text-slate-300' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}>
            {!isAudioMuted ? <Mic className="w-4 h-4 md:w-5 md:h-5" /> : <MicOff className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          
          <button onClick={toggleVideo} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all cursor-pointer shrink-0 ${!isVideoOff ? 'bg-[#171d2d] hover:bg-[#21293e] text-slate-300' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}>
            {!isVideoOff ? <VideoIcon className="w-4 h-4 md:w-5 md:h-5" /> : <VideoOff className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          <button onClick={handleScreenShareClick} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all cursor-pointer shrink-0 hidden sm:flex ${isSharingScreen ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-[#171d2d] hover:bg-[#21293e] text-slate-300'}`} title="Share Screen">
            <Share className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[#171d2d] hover:bg-[#21293e] text-slate-300 transition-all relative cursor-pointer shrink-0 hidden sm:flex">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute -top-1 -right-1 bg-slate-500 text-[9px] md:text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold text-white border-2 border-[#0b101e]">
              {callAccepted && !callEnded ? '2' : '1'}
            </span>
          </button>

          <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all cursor-pointer shrink-0 ${isChatOpen ? 'bg-[#818cf8] text-white shadow-[0_0_15px_rgba(129,140,248,0.4)]' : 'bg-[#171d2d] hover:bg-[#21293e] text-slate-300'}`}>
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button onClick={() => setShowEmojis(!showEmojis)} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all cursor-pointer shrink-0 ${showEmojis ? 'bg-[#818cf8] text-white shadow-[0_0_15px_rgba(129,140,248,0.4)]' : 'bg-[#171d2d] hover:bg-[#21293e] text-slate-300'}`}>
            <Smile className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button onClick={() => setShowMoreMenu(!showMoreMenu)} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all cursor-pointer shrink-0 ${showMoreMenu ? 'bg-[#818cf8] text-white' : 'bg-[#171d2d] hover:bg-[#21293e] text-slate-300'}`}>
            <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button onClick={handleLeave} className="px-5 md:px-7 h-10 md:h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white font-bold ml-1 md:ml-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer shrink-0 text-sm md:text-base">
            Leave
          </button>
        </div>

        {/* Hidden on Mobile */}
        <div className="hidden md:flex w-48 justify-end"></div>
      </div>
    </div>
  );
}