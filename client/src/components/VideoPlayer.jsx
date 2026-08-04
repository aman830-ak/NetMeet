import React, { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';

// We receive the isMobile prop from App.jsx
const VideoPlayer = ({ isMobile }) => {
  const context = useContext(SocketContext);
  
  const params = new URLSearchParams(window.location.search);
  const inviteId = params.get('invite');
  
  const [idToCall, setIdToCall] = useState(inviteId || '');
  const [copied, setCopied] = useState(false);
  
  if (!context) return <div style={{ padding: '20px', color: '#fff' }}>Loading camera...</div>;

  const { 
    myVideo, userVideo, stream, remoteStream, user, me, isConnected,
    call, callAccepted, callEnded, callUser, answerCall, leaveCall,
    toggleAudio, toggleVideo, shareScreen, isAudioMuted, isVideoOff,
    cameraError 
  } = context;

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
      
      {call.isReceivedCall && !callAccepted && (
        <div style={styles.callNotification}>
          <h4 style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.2rem' }}>📞 {call.name} is inviting...</h4>
          <button onClick={answerCall} style={styles.answerBtn}>Join</button>
        </div>
      )}

      {/* Camera Grid */}
      <div style={styles.gridContainer}>
        {stream ? (
          <div style={styles.videoWrapper}>
            <div style={styles.labelContainer}>
              <h3 style={styles.nameLabel}>
                {user?.firstName || 'Guest'} 
                <span style={{ marginLeft: '8px', fontSize: '11px', color: isConnected ? '#4ade80' : '#f87171' }}>
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
          <div style={styles.videoWrapper}>
             <div style={styles.labelContainer}>
              <h3 style={styles.nameLabel}>Guest User</h3>
            </div>
            <div style={styles.videoOffPlaceholder}>🎥 Camera Locked</div>
          </div>
        ) : null}

        {callAccepted && !callEnded ? (
          <div style={styles.videoWrapper}>
            <h3 style={styles.remoteNameLabel}>{call.name || 'Remote User'}</h3>
            <video playsInline ref={userVideo} autoPlay style={styles.video} />
          </div>
        ) : (
          <div style={styles.videoWrapper}>
            <h3 style={styles.remoteNameLabel}>Remote User</h3>
            <div style={styles.emptyVideo}>Waiting...</div>
          </div>
        )}
      </div>

      {/* Control Bar - Automatically wraps on mobile */}
      <div style={{ ...styles.bottomBar, flexDirection: isMobile ? 'column' : 'row' }}>
        
        <div style={{ ...styles.controlsBar, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
          <button onClick={toggleAudio} style={{...styles.controlBtn, backgroundColor: isAudioMuted ? '#ef4444' : '#334155'}}>
            {isAudioMuted ? '🔇' : '🎤 Mic'}
          </button>
          <button onClick={toggleVideo} style={{...styles.controlBtn, backgroundColor: isVideoOff ? '#ef4444' : '#334155'}}>
            {isVideoOff ? '🚫' : '📷 Video'}
          </button>
          
          {/* Hide screen sharing on mobile since phones can't easily share screen anyway */}
          {!isMobile && (
            <button onClick={shareScreen} style={styles.controlBtn}>💻 Share</button>
          )}
        </div>

        <div style={{ ...styles.callControls, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
          {callAccepted && !callEnded ? (
            <button onClick={leaveCall} style={{...styles.hangUpBtn, width: isMobile ? '100%' : 'auto'}}>☎️ Hang Up</button>
          ) : inviteId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => callUser(idToCall)} style={styles.callBtn}>👋 Join Meeting</button>
            </div>
          ) : (
            <>
              <input 
                type="text" 
                placeholder="Paste ID..." 
                value={idToCall} 
                onChange={(e) => setIdToCall(e.target.value)} 
                style={{ ...styles.input, flex: isMobile ? 1 : 'none' }}
              />
              <button onClick={() => callUser(idToCall)} style={styles.callBtn}>Call</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', position: 'relative' },
  gridContainer: { display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'flex-start', width: '100%' },
  videoWrapper: { flex: '1 1 300px', maxWidth: '600px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', position: 'relative', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', border: '2px solid #334155', minHeight: '250px' },
  video: { width: '100%', height: '100%', display: 'block', transform: 'scaleX(-1)', objectFit: 'cover' },
  emptyVideo: { width: '100%', height: '100%', minHeight: '250px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1rem' },
  videoOffPlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '1.2rem', zIndex: 1 },
  labelContainer: { position: 'absolute', top: '15px', left: '15px', right: '15px', zIndex: 10, display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' },
  nameLabel: { margin: 0, color: '#fff', backgroundColor: 'rgba(15, 23, 42, 0.75)', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', backdropFilter: 'blur(4px)', fontWeight: '500', display: 'flex', alignItems: 'center' },
  remoteNameLabel: { position: 'absolute', top: '15px', left: '15px', margin: 0, color: '#fff', backgroundColor: 'rgba(15, 23, 42, 0.75)', padding: '6px 10px', borderRadius: '8px', zIndex: 10, fontSize: '12px', backdropFilter: 'blur(4px)', fontWeight: '500' },
  copyBtn: { backgroundColor: 'rgba(59, 130, 246, 0.9)', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backdropFilter: 'blur(4px)', transition: '0.2s' },
  
  bottomBar: { display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', width: '100%' },
  controlsBar: { display: 'flex', gap: '10px', backgroundColor: '#1e293b', padding: '12px 15px', borderRadius: '30px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', border: '1px solid #334155', flexWrap: 'wrap' },
  controlBtn: { border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', backgroundColor: '#334155' },
  
  callControls: { display: 'flex', gap: '10px', backgroundColor: '#1e293b', padding: '12px 15px', borderRadius: '30px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', boxSizing: 'border-box' },
  input: { padding: '10px 15px', borderRadius: '20px', border: 'none', outline: 'none', backgroundColor: '#0f172a', color: '#fff', width: '140px', fontSize: '14px' },
  callBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  hangUpBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  
  callNotification: { position: 'absolute', top: '-10px', zIndex: 50, backgroundColor: '#3b82f6', color: '#fff', padding: '12px 25px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)' },
  answerBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }
};

export default VideoPlayer;