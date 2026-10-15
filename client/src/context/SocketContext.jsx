import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';
import Peer from 'simple-peer';

const SocketContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// 🔥 FIX: 'polling' MUST come before 'websocket' to fix the Render drop-off error
const socket = io(BACKEND_URL, {
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

const ContextProvider = ({ children }) => {
  const { user } = useUser();
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const [me, setMe] = useState(socket.id || '');
  const [isConnected, setIsConnected] = useState(socket.connected || false);
  
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const [isCalling, setIsCalling] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  
  const [messages, setMessages] = useState([]);
  
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);
  const streamRef = useRef(null); 
  
  const candidateQueue = useRef([]); 
  const persistentRoomId = user?.id || me;

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' }, 
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const addSystemMessage = (text, senderName) => {
    setMessages(prev => [
      ...prev,
      { isSystem: true, text, sender: senderName || 'Guest', time: getFormattedTime() }
    ]);
  };

  useEffect(() => {
    let isMounted = true; 

    if (socket.id) {
      setIsConnected(true);
      setMe(socket.id);
    }

    socket.on('connect', () => {
      setIsConnected(true);
      setMe(socket.id);
      if (user?.id || socket.id) {
        socket.emit("joinRoom", { roomId: user?.id || socket.id });
      }
    });

    socket.on('me', (id) => {
      setMe(id);
      socket.emit("joinRoom", { roomId: user?.id || id });
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
      leaveCall(); 
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        if (!isMounted) return;
        streamRef.current = currentStream; 
        setStream(currentStream);
        setCameraError(false);
      })
      .catch((err) => {
        console.error("Camera permission error:", err);
        setCameraError(true); 
      });

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      if (connectionRef.current) {
        try {
          connectionRef.current.signal(signal);
        } catch (err) {
          console.error("Error signaling:", err);
        }
      } else if (signal && signal.type === 'offer') {
        setCall({ isReceivedCall: true, from, name: callerName, signal });
      } else {
        candidateQueue.current.push(signal);
      }
    });

    socket.on('callAccepted', (signal) => {
      setIsCalling(false); 
      setCallAccepted(true);
      addSystemMessage("Joined Free meeting", call.name || "Guest");
      if (connectionRef.current) {
        try {
          connectionRef.current.signal(signal);
        } catch (err) {
          console.error("Error signaling callAccepted:", err);
        }
      }
    });

    socket.on('callEnded', () => {
      addSystemMessage("Left Free meeting", call.name || "Guest");
      setCallEnded(true);
      setCallAccepted(false);
      setCall({}); 
      setIsCalling(false); 
      setRemoteStream(null);
      candidateQueue.current = []; 
      
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null; 
      }
    });

    return () => {
      isMounted = false; 
      socket.off('connect');
      socket.off('me');
      socket.off('disconnect');
      socket.off('callUser');
      socket.off('callAccepted');
      socket.off('callEnded');
    };
  }, [user]);

  const answerCall = () => {
    setCallAccepted(true);
    setCallEnded(false);
    addSystemMessage("Joined Free meeting", call.name || "Guest");

    const peer = new Peer({ 
      initiator: false, 
      trickle: true, 
      stream: streamRef.current || stream || undefined,
      config: { iceServers }
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (incomingStream) => {
      setRemoteStream(incomingStream);
    });

    peer.on('data', (data) => {
      try {
        const messageStr = data instanceof Uint8Array ? new TextDecoder("utf-8").decode(data) : data.toString();
        const parsedData = JSON.parse(messageStr);
        setMessages((prev) => [...prev, { ...parsedData, time: getFormattedTime() }]);
      } catch (err) {
        console.error("P2P decode error:", err);
      }
    });

    peer.on('close', () => leaveCall());
    if (call.signal) peer.signal(call.signal);

    candidateQueue.current.forEach(cand => peer.signal(cand));
    candidateQueue.current = [];

    connectionRef.current = peer;
  };

  const callUser = (idToCall) => {
    if (!idToCall) return alert("Enter valid ID!");

    setCall({ to: idToCall });
    setIsCalling(true);
    setCallEnded(false);

    const peer = new Peer({ 
      initiator: true, 
      trickle: true, 
      stream: streamRef.current || stream || undefined,
      config: { iceServers }
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', { 
        userToCall: idToCall, 
        signalData: data, 
        from: me, 
        name: user?.firstName || 'Aman' 
      });
    });

    peer.on('stream', (incomingStream) => {
      setRemoteStream(incomingStream);
    });

    peer.on('data', (data) => {
      try {
        const messageStr = data instanceof Uint8Array ? new TextDecoder("utf-8").decode(data) : data.toString();
        const parsedData = JSON.parse(messageStr);
        setMessages((prev) => [...prev, { ...parsedData, time: getFormattedTime() }]);
      } catch (err) {
        console.error("P2P decode error:", err);
      }
    });

    peer.on('close', () => leaveCall());
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    const recipient = call.from || call.to;
    if (recipient) {
      socket.emit("endCall", { to: recipient });
    }
    setCallEnded(true);
    setCallAccepted(false);
    setRemoteStream(null);
    setCall({});
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
  };

  const sendMessage = (text) => {
    const msgObj = { text, sender: user?.firstName || 'Aman', time: getFormattedTime() };
    setMessages((prev) => [...prev, { ...msgObj, sender: 'You' }]);
    if (connectionRef.current) {
      connectionRef.current.send(JSON.stringify(msgObj));
    }
  };

  const toggleAudio = () => {
    const activeStream = streamRef.current || stream;
    if (activeStream) {
      const track = activeStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsAudioMuted(!track.enabled);
        return !track.enabled; // Return new state
      }
    }
    return isAudioMuted;
  };

  const toggleVideo = () => {
    const activeStream = streamRef.current || stream;
    if (activeStream) {
      const track = activeStream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
        return !track.enabled; // Return new state
      }
    }
    return isVideoOff;
  };

  const shareScreen = async (onStopCallback) => {
    const activeStream = streamRef.current || stream;
    if (!activeStream) return null;
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const cameraTrack = activeStream.getVideoTracks()[0];

      if (connectionRef.current) {
        connectionRef.current.replaceTrack(cameraTrack, screenTrack, activeStream);
      }

      if (myVideo.current) {
        myVideo.current.srcObject = null; 
        myVideo.current.srcObject = screenStream;
      }

      screenTrack.onended = () => {
        if (connectionRef.current) {
          connectionRef.current.replaceTrack(screenTrack, cameraTrack, activeStream);
        }
        if (myVideo.current) {
          myVideo.current.srcObject = null;
          myVideo.current.srcObject = activeStream;
        }
        if (onStopCallback) onStopCallback(); 
      };

      return screenTrack;
    } catch (err) {
      console.log("Screen share cancelled", err);
      return null; 
    }
  };

  return (
    <SocketContext.Provider value={{ 
      stream, remoteStream, myVideo, userVideo, me, user, socket, isConnected, cameraError,
      call, callAccepted, callEnded, isCalling, callUser, answerCall, leaveCall,
      toggleAudio, toggleVideo, shareScreen, isAudioMuted, isVideoOff,
      messages, sendMessage, persistentRoomId
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };