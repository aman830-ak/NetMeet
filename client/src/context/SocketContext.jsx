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
    
    // When the local socket dies (e.g., local user loses internet)
    socket.on('disconnect', () => {
      setIsConnected(false);
      leaveCall(); // Instantly clean up the local UI
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
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });

    socket.on('callAccepted', (signal) => {
      setIsCalling(false); 
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
    });

    socket.on('callEnded', () => {
      setCallEnded(true);
      setCallAccepted(false);
      setCall({}); 
      setIsCalling(false); 
      setRemoteStream(null);
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

    // 🔥 FIX: WebRTC Tripwires for Answerer
    peer.on('close', () => leaveCall());
    peer.on('error', () => leaveCall());

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = (idToCall) => {
    if (!idToCall) {
      alert("Please enter a valid ID to call!");
      return;
    }

    setCall({ to: idToCall });
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

    // 🔥 FIX: WebRTC Tripwires for Caller
    peer.on('close', () => leaveCall());
    peer.on('error', () => leaveCall());

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
    
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
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
      toggleAudio, toggleVideo, shareScreen, isAudioMuted, isVideoOff 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };