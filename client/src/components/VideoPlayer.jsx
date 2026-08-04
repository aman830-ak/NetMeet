import React, { useContext, useState, useEffect, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';

const VideoPlayer = ({ isMobile }) => {
  const context = useContext(SocketContext);
  
  const params = new URLSearchParams(window.location.search);
  const inviteId = params.get('invite');
  
  const [idToCall, setIdToCall] = useState(inviteId || '');
  const [copied, setCopied] = useState(false);
  
  // NEW: Ref to hold our ringtone audio
  const ringtoneAudio = useRef(null);
  
  if (!context) return <div style={{ padding: '20px', color: '#fff' }}>Loading camera...</div>;

  const { 
    myVideo, userVideo, stream, remoteStream, user, me, isConnected,
    call, callAccepted, callEnded, isCalling, callUser, answerCall, leaveCall,
    toggleAudio, toggleVideo, shareScreen, isAudioMuted, isVideoOff,
    cameraError 
  } = context;

  // NEW: Initialize the audio file once when the component loads
  useEffect(() => {
    ringtoneAudio.current = new Audio('/ringtone.mp3');
    ringtoneAudio.current.loop = true; // Make it loop until they answer!
  }, []);

  // NEW: Play or stop the audio based on call state
  useEffect(() => {
    if (call.isReceivedCall && !callAccepted && !callEnded) {
      // Play sound! (We catch errors in case the browser blocks autoplay)
      ringtoneAudio.current?.play().catch(err => console.log("Browser blocked autoplay:", err));
    } else {
      // Stop sound!
      if (ringtoneAudio.current) {
        ringtoneAudio.current.pause();
        ringtoneAudio.current.currentTime = 0; // Reset to the beginning
      }
    }
  }, [call.isReceivedCall, callAccepted, callEnded]);

  useEffect(() => {
    if (myVideo.current && stream) myVideo.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (userVideo.current && remoteStream) userVideo.current.srcObject = remoteStream;
  }, [remoteStream, callAccepted]);

  const copyInviteLink = () => {
    if (!me) {
      alert("Still connecting to the server. Please wait.");
      return;
    }
    const inviteLink = `${window.location.origin}/?invite=${me}`;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => alert("Failed to copy link."));
  };

  return (
    <div style={styles.container}>
      
      {/* INCOMING CALL BANNER */}
      {call.isReceivedCall && !callAccepted && (
        <div style={styles.callNotification(isMobile)}>
          <h4 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.1rem' }}>📞 {call.name} is calling...</h4>
          <button onClick={answerCall} style={styles.answerBtn}>Answer</button>
        </div>
      )}

      {/* OUTGOING CALL BANNER */}
      {isCalling && !callAccepted && (
        <div style={styles.callingBanner(isMobile)}>
          ⏳ Calling participant... waiting for answer.
        </div>
      )}

      {/* Camera Grid */}
      <div style={styles.gridContainer(isMobile)}>
        {/* LOCAL CAMERA */}
        {stream ? (
          <div style={styles.videoWrapper(isMobile)}>
            <div style={styles.labelContainer}>
              <h3 style={styles.nameLabel}>
                {user?.firstName || 'You'} 
                <span style={{ marginLeft: '6px', fontSize: '10px', color: isConnected ? '#4ade80' : '#f87171' }}>
                  {isConnected ? '🟢' : '🔴'}
                </span>
              </h3>
              <button onClick={copyInviteLink} style={styles.copyBtn}>
                {copied ? '✅ Copied!' : `🔗 Invite`}
              </button>
            </div>
            <video playsInline muted ref={myVideo} autoPlay style={{...styles.video, opacity: isVideoOff ? 0 : 1}} />
            {isVideoOff && <div style={styles.videoOffPlaceholder}>🎥 Camera Disabled</div>}
          </div>
        ) : cameraError ? (
          <div style={styles.videoWrapper(isMobile)}>
             <div style={styles.labelContainer}>
              <h3 style={styles.nameLabel}>You</h3>
            </div>
            <div style={styles.videoOffPlaceholder}>🎥 Camera Blocked</div>
          </div>
        ) : null}

        {/* REMOTE CAMERA */}
        {callAccepted && !callEnded ? (
          <div style={styles.videoWrapper(isMobile)}>
            <h3 style={styles.remoteNameLabel}>{call.name || 'Remote User'}</h3>
            <video playsInline ref={userVideo} autoPlay style={styles.video} />
          </div>
        ) : (
          <div style={styles.videoWrapper(isMobile)}>
            <h3 style={styles.remoteNameLabel}>Remote User</h3>
            <div style={styles.emptyVideo}>Waiting for connection...</div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div style={styles.bottomControlsWrap(isMobile)}>
        
        {/* Audio/Video Controls */}
        <div style={styles.controlsBar(isMobile)}>
          <button onClick={toggleAudio} style={styles.controlBtn(isAudioMuted)}>
            {isAudioMuted ? '🔇' : '🎤 Mic'}
          </button>
          <button onClick={toggleVideo} style={styles.controlBtn(isVideoOff)}>
            {isVideoOff ? '🚫' : '📷 Video'}
          </button>
          
          {!isMobile && (
            <button onClick={shareScreen} style={styles.controlBtn(false)}>💻 Share</button>
          )}
        </div>

        {/* Call Connect/Disconnect Controls */}
        <div style={styles.callControls(isMobile)}>
          {callAccepted && !callEnded ? (
            <button onClick={leaveCall} style={styles.hangUpBtn(isMobile)}>☎️ Hang Up</button>
          ) : inviteId ? (
            <button onClick={() => callUser(idToCall)} style={styles.callBtn(isMobile)}>👋 Join Meeting</button>
          ) : (
            <div style={{ display: 'flex', gap: '10px', width: '100%', flex: 1 }}>
              <input 
                type="text" 
                placeholder="Paste ID here..." 
                value={idToCall} 
                onChange={(e) => setIdToCall(e.target.value)} 
                style={styles.input}
              />
              <button onClick={() => callUser(idToCall)} style={styles.callBtn(false)}>Call</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// 🎨 RESPONSIVE STYLES
const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', position: 'relative' },
  gridContainer: (isMobile) => ({ display: 'flex', gap: '20px', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', width: '100%', maxWidth: '1200px' }),
  videoWrapper: (isMobile) => ({ flex: isMobile ? 'none' : '1', width: isMobile ? '100%' : '50%', minHeight: isMobile ? '30vh' : '45vh', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', position: 'relative', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', border: '2px solid #334155' }),
  video: { width: '100%', height: '100%', display: 'block', transform: 'scaleX(-1)', objectFit: 'cover' },
  emptyVideo: { width: '100%', height: '100%', minHeight: '250px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.95rem' },
  videoOffPlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '1.2rem', zIndex: 1 },
  labelContainer: { position: 'absolute', top: '15px', left: '15px', right: '15px', zIndex: 10, display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' },
  nameLabel: { margin: 0, color: '#fff', backgroundColor: 'rgba(15, 23, 42, 0.75)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', backdropFilter: 'blur(4px)', fontWeight: '600', display: 'flex', alignItems: 'center' },
  remoteNameLabel: { position: 'absolute', top: '15px', left: '15px', margin: 0, color: '#fff', backgroundColor: 'rgba(15, 23, 42, 0.75)', padding: '6px 12px', borderRadius: '8px', zIndex: 10, fontSize: '0.8rem', backdropFilter: 'blur(4px)', fontWeight: '600' },
  copyBtn: { backgroundColor: 'rgba(59, 130, 246, 0.9)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', backdropFilter: 'blur(4px)', transition: '0.2s' },
  bottomControlsWrap: (isMobile) => ({ display: 'flex', gap: '15px', flexDirection: isMobile ? 'column' : 'row', width: '100%', maxWidth: '1200px' }),
  controlsBar: (isMobile) => ({ display: 'flex', gap: '10px', backgroundColor: '#1e293b', padding: '12px', borderRadius: isMobile ? '16px' : '30px', border: '1px solid #334155', justifyContent: 'center', flex: isMobile ? 'none' : '1' }),
  controlBtn: (isActive) => ({ border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '24px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', backgroundColor: isActive ? '#ef4444' : '#334155', flex: 1, justifyContent: 'center' }),
  callControls: (isMobile) => ({ display: 'flex', gap: '10px', backgroundColor: '#1e293b', padding: '12px', borderRadius: isMobile ? '16px' : '30px', border: '1px solid #334155', flex: isMobile ? 'none' : '2' }),
  input: { flex: 1, minWidth: '100px', padding: '10px 15px', borderRadius: '20px', border: 'none', outline: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem' },
  callBtn: (isMobile) => ({ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', width: isMobile ? '100%' : 'auto', flexShrink: 0 }),
  hangUpBtn: (isMobile) => ({ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', width: isMobile ? '100%' : 'auto', flex: 1 }),
  callNotification: (isMobile) => ({ position: 'absolute', top: isMobile ? '10px' : '-20px', left: isMobile ? '10px' : 'auto', right: isMobile ? '10px' : 'auto', zIndex: 50, backgroundColor: '#3b82f6', color: '#fff', padding: '12px 25px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)' }),
  answerBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
  callingBanner: (isMobile) => ({ position: 'absolute', top: isMobile ? '10px' : '-20px', left: isMobile ? '10px' : 'auto', right: isMobile ? '10px' : 'auto', zIndex: 50, backgroundColor: '#fef3c7', color: '#92400e', padding: '12px 25px', borderRadius: '30px', fontWeight: '600', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', textAlign: 'center' })
};

export default VideoPlayer;