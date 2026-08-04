import React, { useState, useEffect } from 'react';
import { UserButton, SignedIn } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import VideoPlayer from './components/VideoPlayer';
import ChatBox from './components/ChatBox';
import { ContextProvider } from './context/SocketContext';

export default function App() {
  const [inMeeting, setInMeeting] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('invite');
  });

  // NEW: Track window size for Mobile Responsiveness
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      {!inMeeting ? (
        <LandingPage onGetStarted={() => setInMeeting(true)} />
      ) : (
        <ContextProvider>
          <div style={styles.roomContainer}>
            
            {/* Responsive Header */}
            <header style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🌐</span>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>NetMeet Live Room</h2>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                <button onClick={() => window.location.href = '/'} style={styles.leaveRoomBtn}>
                  Exit Room
                </button>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </header>

            {/* FIX: Dynamic Layout Grid. Stacks vertically on mobile! */}
            <div style={{
              display: isMobile ? 'flex' : 'grid',
              flexDirection: isMobile ? 'column' : 'row',
              gridTemplateColumns: isMobile ? 'none' : '7fr 3fr',
              gap: '20px',
              flex: 1,
              minHeight: 0
            }}>
              
              {/* Video Section */}
              <div style={{ overflowY: 'auto', flex: isMobile ? 'none' : 1 }}>
                <VideoPlayer isMobile={isMobile} />
              </div>
              
              {/* Chat Section (Gets a fixed height on mobile so it doesn't disappear) */}
              <div style={{ height: isMobile ? '500px' : '100%', minHeight: '400px' }}>
                <ChatBox />
              </div>

            </div>
          </div>
        </ContextProvider>
      )}
    </div>
  );
}

const styles = {
  roomContainer: { padding: '20px', fontFamily: '"Inter", sans-serif', maxWidth: '1400px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', backgroundColor: '#070b14', color: '#e2e8f0' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '15px 30px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' },
  leaveRoomBtn: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }
};