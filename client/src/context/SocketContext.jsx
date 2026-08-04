// client/src/context/SocketContext.jsx
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
  
  // State for tracking outgoing calls (Bug 3 Fix)
  const [isCalling, setIsCalling] = useState(false);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const streamRef = useRef(null); 

  useEffect(() => {
    let isMounted = true; 

    if (socket.id) {
      setIsConnected(true);
      setMe(socket.id);
    }

    socket.on('connect', () => {
      setIsConnected(true);
      setMe(socket.id);
    });

    socket.on('me', (id) => setMe(id));
    socket.on('disconnect', () => setIsConnected(false));

    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "user" }, // explicitly requests the front-facing mobile camera
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
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });

    // FIX: Gentle state cleanup instead of aggressive page reload
    socket.on('callEnded', () => {
      setCallEnded(true);
      setCallAccepted(false);
      setCall({}); // Reset the specific incoming/outgoing call object
      setIsCalling(false); // Reset calling state
      setRemoteStream(null);
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null; // Force nullification of the ref
      }
    });

    return () => {
      isMounted = false; 
      socket.off('connect');
      socket.off('me');
      socket.off('disconnect');
      socket.off('callUser');
      socket.off('callEnded');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ 
      initiator: false, 
      trickle: false, 
      stream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] }
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      setRemoteStream(currentStream);
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = (idToCall) => {
    if (!idToCall) {
      alert("Please enter a valid ID to call!");
      return;
    }

    // Set calling state so the UI shows "Calling..."
    setIsCalling(true);

    const peer = new Peer({ 
      initiator: true, 
      trickle: false, 
      stream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] }
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: idToCall, signalData: data, from: me, name: user?.firstName || 'User' });
    });

    peer.on('stream', (currentStream) => {
      setRemoteStream(currentStream);
    });

    socket.on('callAccepted', (signal) => {
      setIsCalling(false); // Clear calling indicator
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setIsCalling(false); 
    setCallEnded(true);
    
    // Notify partner that we are leaving
    const recipient = call.from || call.to;
    if (recipient) {
      socket.emit("endCall", { to: recipient });
    }

    setRemoteStream(null);
    setCallAccepted(false);
    if (connectionRef.current) connectionRef.current.destroy();
    window.location.href = '/'; 
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const cameraTrack = stream.getVideoTracks()[0];

      // 1. Update local video preview for yourself
      stream.removeTrack(cameraTrack);
      stream.addTrack(screenTrack);
      if (myVideo.current) myVideo.current.srcObject = stream;

      // 2. Replace the track on the live WebRTC connection
      if (connectionRef.current) {
        connectionRef.current.replaceTrack(cameraTrack, screenTrack, stream);
      }

      // Handle when user stops sharing via the browser's "Stop sharing" bar
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
      toggleAudio, toggleVideo, shareScreen, isAudioMuted, isVideoOff 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };