import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';
import Peer from 'simple-peer';

const SocketContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling']
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
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const streamRef = useRef(null); 
  
  const candidateQueue = useRef([]); 

  // 🔥 Persistent Room ID based on Clerk user ID or volatile socket ID fallback
  const persistentRoomId = user?.id || me;

  useEffect(() => {
    let isMounted = true; 

    if (socket.id) {
      setIsConnected(true);
      setMe(socket.id);
    }

    socket.on('connect', () => {
      setIsConnected(true);
      setMe(socket.id);
      // Automatically join persistent room upon connection/reconnection
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

    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "user" },
      audio: true 
    })
      .then((currentStream) => {
        if (!isMounted) {
          currentStream.getTracks().forEach(track => track.stop());
          return;
        }
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
          console.error("Error applying trickle candidate in callUser:", err);
        }
      } else if (signal.type === 'offer') {
        setCall({ isReceivedCall: true, from, name: callerName, signal });
      } else {
        candidateQueue.current.push(signal);
      }
    });

    socket.on('callAccepted', (signal) => {
      setIsCalling(false); 
      setCallAccepted(true);
      if (connectionRef.current) {
        try {
          connectionRef.current.signal(signal);
        } catch (err) {
          console.error("Error applying trickle candidate in callAccepted:", err);
        }
      }
    });

    socket.on('callEnded', () => {
      setCallEnded(true);
      setCallAccepted(false);
      setCall({}); 
      setIsCalling(false); 
      setRemoteStream(null);
      setMessages([]); 
      candidateQueue.current = []; 
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null; 
      }
      setTimeout(() => {
        alert("The other participant has left the call.");
      }, 100);
    });

    return () => {
      isMounted = false; 
      socket.off('connect');
      socket.off('me');
      socket.off('disconnect');
      socket.off('callUser');
      socket.off('callAccepted');
      socket.off('callEnded');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ 
      initiator: false, 
      trickle: true, 
      stream: stream || undefined,
      config: { 
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }, 
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ] 
      }
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      setRemoteStream(currentStream);
    });

    peer.on('data', (data) => {
      try {
        const messageStr = data instanceof Uint8Array ? new TextDecoder("utf-8").decode(data) : data.toString();
        const parsedData = JSON.parse(messageStr);
        setMessages((prev) => [...prev, parsedData]);
      } catch (err) {
        console.error("Error decoding P2P message:", err);
      }
    });

    peer.on('close', () => {
      console.log("Peer connection closed");
      leaveCall();
    });

    peer.on('error', (err) => {
      console.error("WebRTC Peer Answer Error:", err);
    });

    if (call.signal) {
      peer.signal(call.signal);
    }

    candidateQueue.current.forEach((cand) => {
      try {
        peer.signal(cand);
      } catch (err) {
        console.error("Error flushing candidate:", err);
      }
    });
    candidateQueue.current = [];

    connectionRef.current = peer;
  };

  const callUser = (idToCall) => {
    if (!idToCall) {
      alert("Please enter a valid ID to call!");
      return;
    }

    setCall({ to: idToCall });
    setIsCalling(true);
    candidateQueue.current = []; 

    const peer = new Peer({ 
      initiator: true, 
      trickle: true, 
      stream: stream || undefined,
      config: { 
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }, 
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ] 
      }
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: idToCall, signalData: data, from: me, name: user?.firstName || 'User' });
    });

    peer.on('stream', (currentStream) => {
      setRemoteStream(currentStream);
    });

    peer.on('data', (data) => {
      try {
        const messageStr = data instanceof Uint8Array ? new TextDecoder("utf-8").decode(data) : data.toString();
        const parsedData = JSON.parse(messageStr);
        setMessages((prev) => [...prev, parsedData]);
      } catch (err) {
        console.error("Error decoding P2P message:", err);
      }
    });

    peer.on('close', () => {
      console.log("Peer connection closed");
      leaveCall();
    });

    peer.on('error', (err) => {
      console.error("WebRTC Peer Call Error:", err);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setIsCalling(false); 
    setCallEnded(true);
    const recipient = call.from || call.to;
    if (recipient) {
      socket.emit("endCall", { to: recipient });
    }
    setRemoteStream(null);
    setCallAccepted(false);
    setCall({});
    setMessages([]); 
    candidateQueue.current = []; 
    
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
  };

  const sendMessage = (text) => {
    const msgObj = { text, sender: user?.firstName || 'Guest' };
    
    setMessages((prev) => [...prev, { ...msgObj, sender: 'You' }]);
    
    if (connectionRef.current) {
      connectionRef.current.send(JSON.stringify(msgObj));
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const cameraTrack = stream.getVideoTracks()[0];

      stream.removeTrack(cameraTrack);
      stream.addTrack(screenTrack);
      if (myVideo.current) myVideo.current.srcObject = stream;

      if (connectionRef.current) {
        connectionRef.current.replaceTrack(cameraTrack, screenTrack, stream);
      }

      screenTrack.onended = () => {
        stream.removeTrack(screenTrack);
        stream.addTrack(cameraTrack);
        if (myVideo.current) myVideo.current.srcObject = stream;

        if (connectionRef.current) {
          connectionRef.current.replaceTrack(screenTrack, cameraTrack, stream);
        }
      };
    } catch (error) {
      console.log("Screen sharing cancelled or failed:", error);
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