import React, { useContext, useState, useEffect, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';
import EmojiPicker from 'emoji-picker-react';

const ChatBox = () => {
  const { socket, me, user } = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // NEW: State to track which image is being viewed in full screen
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (data) => setMessages((prev) => [...prev, data]);
    socket.on('receiveMessage', handleReceiveMessage);
    return () => socket.off('receiveMessage', handleReceiveMessage);
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() === "") return;

    const messageData = {
      senderId: me,
      senderName: user?.firstName || 'Guest',
      text: currentMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('sendMessage', messageData);
    setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiObject) => {
    setCurrentMessage((prev) => prev + emojiObject.emoji);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const messageData = {
        senderId: me,
        senderName: user?.firstName || 'Guest',
        text: "", 
        file: reader.result,
        fileName: file.name,
        fileType: file.type,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      socket.emit('sendMessage', messageData);
      setMessages((prev) => [...prev, messageData]);
    };
    e.target.value = ""; 
  };

  return (
    <>
      <div style={styles.chatContainer}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={styles.onlineDot}></span> Room Chat
          </h3>
        </div>

        <div style={styles.messagesArea}>
          {messages.length === 0 ? (
            <div style={styles.emptyChat}>
              <span style={{ fontSize: '2rem', marginBottom: '10px' }}>👋</span>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.senderId === me;
              return (
                <div key={index} style={{ ...styles.messageWrapper, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                  {!isMe && <span style={styles.senderName}>{msg.senderName}</span>}
                  
                  <div style={{ ...styles.messageBubble, 
                    backgroundColor: isMe ? '#0d9488' : '#1e293b', 
                    borderRadius: isMe ? '12px 12px 0px 12px' : '12px 12px 12px 0px' 
                  }}>
                    
                    {/* RENDER PHOTOS WITH CLICK-TO-ZOOM */}
                    {msg.fileType && msg.fileType.startsWith('image/') && (
                      <img 
                        src={msg.file} 
                        alt="shared" 
                        style={styles.imageMessage} 
                        onClick={() => setFullscreenImage(msg.file)} // Opens image in fullscreen
                      />
                    )}

                    {/* RENDER OTHER FILES */}
                    {msg.fileType && !msg.fileType.startsWith('image/') && (
                      <a href={msg.file} download={msg.fileName} style={styles.fileMessage}>
                        📄 {msg.fileName}
                      </a>
                    )}

                    {msg.text && <p style={styles.messageText}>{msg.text}</p>}
                    <span style={styles.timestamp}>{msg.time}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputAreaWrapper}>
          {showEmojiPicker && (
            <div style={styles.emojiPickerContainer}>
              <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
            </div>
          )}

          <form onSubmit={sendMessage} style={styles.inputArea}>
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={styles.iconBtn}>😀</button>
            <button type="button" onClick={() => fileInputRef.current.click()} style={styles.iconBtn}>📎</button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              style={styles.input}
              onFocus={() => setShowEmojiPicker(false)} 
            />
            <button type="submit" style={{...styles.sendBtn, opacity: currentMessage.trim() ? 1 : 0.5}} disabled={!currentMessage.trim()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* FULLSCREEN IMAGE OVERLAY (Lightbox) */}
      {fullscreenImage && (
        <div style={styles.fullscreenOverlay} onClick={() => setFullscreenImage(null)}>
          <div style={styles.closeBtnOverlay}>✖</div>
          <img src={fullscreenImage} alt="fullscreen zoom" style={styles.fullscreenImage} />
        </div>
      )}
    </>
  );
};

const styles = {
  chatContainer: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#070b14', borderRadius: '16px', border: '1px solid #1e293b', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' },
  header: { backgroundColor: '#0f172a', padding: '16px 20px', borderBottom: '1px solid #1e293b', zIndex: 2 },
  onlineDot: { width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #10b981' },
  
  messagesArea: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', backgroundColor: '#05080f' },
  emptyChat: { margin: 'auto', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' },
  
  messageWrapper: { display: 'flex', flexDirection: 'column', maxWidth: '85%' },
  senderName: { fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', marginLeft: '4px' },
  messageBubble: { padding: '10px 14px', position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' },
  messageText: { margin: 0, color: '#fff', fontSize: '0.95rem', lineHeight: '1.4', wordWrap: 'break-word' },
  
  // Added "cursor: 'zoom-in'" to let users know it's clickable!
  imageMessage: { maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '5px', objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.2)', cursor: 'zoom-in' },
  fileMessage: { color: '#fff', textDecoration: 'underline', fontWeight: 'bold', wordBreak: 'break-all', display: 'inline-block', padding: '5px 0' },
  timestamp: { display: 'block', textAlign: 'right', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '5px' },
  
  inputAreaWrapper: { position: 'relative', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' },
  emojiPickerContainer: { position: 'absolute', bottom: '70px', left: '10px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  inputArea: { display: 'flex', gap: '8px', padding: '15px', alignItems: 'center' },
  iconBtn: { background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', padding: '5px', color: '#94a3b8', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '10px 15px', color: '#fff', fontSize: '0.95rem', outline: 'none' },
  sendBtn: { backgroundColor: '#0d9488', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' },

  // NEW STYLES FOR FULLSCREEN LIGHTBOX
  fullscreenOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out', backdropFilter: 'blur(5px)' },
  fullscreenImage: { maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
  closeBtnOverlay: { position: 'absolute', top: '30px', right: '40px', color: '#fff', fontSize: '1.5rem', background: 'rgba(255,255,255,0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s', border: '1px solid rgba(255,255,255,0.2)' }
};

export default ChatBox;