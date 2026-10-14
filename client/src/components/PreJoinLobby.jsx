import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, ChevronDown, Lock, Unlock, Headphones } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export default function PreJoinLobby({ onJoin }) {
  const { user } = useUser();
  const [name, setName] = useState(localStorage.getItem('netmeet_name') || user?.fullName || '');
  const [saveName, setSaveName] = useState(localStorage.getItem('netmeet_saveName') === 'true');
  
  // Media states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);
  
  // Device states
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');

  const videoRef = useRef(null);

  // 1. Fetch available hardware devices (Earphones, Mics, Cameras)
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
      } catch (e) {
        console.error("Device enumeration error:", e);
      }
    };

    // Briefly request permission to ensure device labels (names) are readable
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        getDevices();
        stream.getTracks().forEach(t => t.stop());
      })
      .catch(() => getDevices()); 

    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices);
  }, []);

  // 2. Handle active stream based on selected devices
  useEffect(() => {
    let currentStream = null;
    
    const startStream = async () => {
      if (!isVideoOn && !isMicOn) {
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }
      try {
        const constraints = {
          audio: isMicOn ? (selectedAudio ? { deviceId: { exact: selectedAudio } } : true) : false,
          video: isVideoOn ? (selectedVideo ? { deviceId: { exact: selectedVideo } } : true) : false
        };
        
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (e) {
        console.error("Stream error", e);
      }
    };
    
    startStream();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isMicOn, isVideoOn, selectedAudio, selectedVideo]);

  const handleStartMeeting = () => {
    if (!name.trim()) return;

    if (saveName) {
      localStorage.setItem('netmeet_name', name);
      localStorage.setItem('netmeet_saveName', 'true');
    } else {
      localStorage.removeItem('netmeet_name');
      localStorage.setItem('netmeet_saveName', 'false');
    }

    onJoin({ 
      name, 
      isMicOn, 
      isVideoOn, 
      selectedAudio, 
      selectedVideo, 
      waitingRoomEnabled 
    });
  };

  return (
    <div className="min-h-screen bg-[#0b101e] text-slate-100 flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center justify-center my-auto">
        
        {/* LEFT SIDE: Video Preview & Device Selectors */}
        <div className="flex flex-col items-center w-full max-w-[600px] mx-auto lg:ml-auto lg:mr-0">
          
          {/* Video Window (Slightly larger, 16:9 aspect ratio) */}
          <div className="relative w-full aspect-video bg-[#131826] border border-slate-800 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl">
            {isVideoOn ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform -scale-x-100" 
              />
            ) : (
              <div className="w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <VideoOff className="w-10 h-10 text-slate-500" />
              </div>
            )}
            
            {/* Overlay Toggles */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-5">
              <button 
                onClick={() => setIsMicOn(!isMicOn)} 
                className={`p-4 rounded-full transition shadow-lg cursor-pointer flex items-center justify-center ${isMicOn ? 'bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 border border-red-400 text-white'}`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsVideoOn(!isVideoOn)} 
                className={`p-4 rounded-full transition shadow-lg cursor-pointer flex items-center justify-center ${isVideoOn ? 'bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 border border-red-400 text-white'}`}
              >
                {isVideoOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Real Device Selectors */}
          <div className="flex w-full space-x-4 mt-6">
            {/* Audio Dropdown */}
            <div className="flex-1 bg-[#151a2b] rounded-2xl p-3 border border-slate-700/60 hover:border-slate-500 transition relative group cursor-pointer">
              <div className="flex items-center space-x-3 pointer-events-none mb-1">
                <Headphones className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-medium">Mic & Earphones</span>
              </div>
              <select
                value={selectedAudio}
                onChange={(e) => setSelectedAudio(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-200 outline-none appearance-none cursor-pointer truncate pr-6"
              >
                {audioDevices.length > 0 ? audioDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-[#151a2b] text-slate-200">
                    {d.label || `Audio Device`}
                  </option>
                )) : <option>Default Audio</option>}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            
            {/* Video Dropdown */}
            <div className="flex-1 bg-[#151a2b] rounded-2xl p-3 border border-slate-700/60 hover:border-slate-500 transition relative group cursor-pointer">
              <div className="flex items-center space-x-3 pointer-events-none mb-1">
                <VideoIcon className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-medium">Camera</span>
              </div>
              <select
                value={selectedVideo}
                onChange={(e) => setSelectedVideo(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-200 outline-none appearance-none cursor-pointer truncate pr-6"
              >
                {videoDevices.length > 0 ? videoDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-[#151a2b] text-slate-200">
                    {d.label || `Camera Device`}
                  </option>
                )) : <option>Default Camera</option>}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form & Details */}
        <div className="flex flex-col w-full max-w-[420px] mx-auto lg:mr-auto lg:ml-0 pt-4">
          <h1 className="text-[36px] font-extrabold mb-3 text-center tracking-tight text-white">Join Meeting</h1>
          <p className="text-slate-400 text-sm text-center mb-8 px-2 leading-relaxed">
            Secure, end-to-end encrypted connections designed for high-performance team collaboration.
          </p>

          <div className="bg-[#131826] border border-slate-800 rounded-2xl flex flex-col mb-4 overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-slate-800/80 flex flex-col focus-within:bg-[#1a2033] transition-colors">
              <label className="text-[12px] text-slate-400 font-semibold mb-1">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name to join"
                className="bg-transparent border-none outline-none text-white text-base font-medium placeholder-slate-600"
              />
            </div>
            <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#1a2033] transition-colors" onClick={() => setSaveName(!saveName)}>
              <span className="text-sm text-slate-300 font-medium">Remember me</span>
              <button className={`w-10 h-5 rounded-full relative transition-colors ${saveName ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform ${saveName ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}></div>
              </button>
            </div>
          </div>

          {/* Functional Waiting Room Toggle */}
          <div className="flex items-center justify-end mb-8 mr-1">
             <button 
               onClick={() => setWaitingRoomEnabled(!waitingRoomEnabled)}
               className={`flex items-center space-x-2 text-sm font-semibold cursor-pointer transition-colors ${waitingRoomEnabled ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-slate-300'}`}
             >
               {waitingRoomEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
               <span>{waitingRoomEnabled ? 'Waiting room enabled' : 'Waiting room disabled'}</span>
               <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
             </button>
          </div>

          <button 
            onClick={handleStartMeeting}
            disabled={!name.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              name.trim() 
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            Join now
          </button>
        </div>
      </div>
    </div>
  );
}