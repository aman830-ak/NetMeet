import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { UserButton, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import VideoPlayer from './components/VideoPlayer';
import ChatBox from './components/ChatBox';
import { ContextProvider } from './context/SocketContext';
import NotFound from './components/NotFound';
import Privacy from './pages/Privacy';
import ThankYou from './pages/ThankYou';

function SEOManager() {
  const location = useLocation();

  useEffect(() => {
    const updateMetaTag = (attrName, attrValue, content) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }

    const setSEO = (title, description, imageUrl, robotsContent = "index, follow") => {
      const currentUrl = window.location.href;
      document.title = title;
      
      updateMetaTag('name', 'description', description);
      metaRobots.content = robotsContent;
      
      updateMetaTag('property', 'og:type', 'website');
      updateMetaTag('property', 'og:url', currentUrl);
      updateMetaTag('property', 'og:title', title);
      updateMetaTag('property', 'og:description', description);
      updateMetaTag('property', 'og:image', imageUrl);
      
      updateMetaTag('name', 'twitter:card', 'summary_large_image');
      updateMetaTag('name', 'twitter:title', title);
      updateMetaTag('name', 'twitter:description', description);
      updateMetaTag('name', 'twitter:image', imageUrl);
    };

    const baseUrl = window.location.origin;
    const defaultImage = `${baseUrl}/default-share.png`;
    const roomImage = `${baseUrl}/room-share.png`;
    const notFoundImage = `${baseUrl}/404-share.png`;

    if (location.pathname === '/thank-you') {
      setSEO(
        "Thank You | NetMeet",
        "Your submission was successful. Thank you for connecting with NetMeet.",
        defaultImage,
        "noindex, nofollow"
      );
    } else if (location.pathname === '/privacy') {
      setSEO(
        "Privacy Policy | NetMeet",
        "Read how NetMeet protects your privacy with secure WebRTC peer-to-peer architecture.",
        defaultImage
      );
    } else if (location.pathname === '/room') {
      setSEO(
        "Live Room | NetMeet P2P", 
        "Join me in this secure, zero-latency peer-to-peer NetMeet video room.", 
        roomImage
      );
    } else if (location.pathname === '/') {
      setSEO(
        "NetMeet | Secure Open-Source Video Calls", 
        "NetMeet is a free, open-source, peer-to-peer video conferencing platform built for total privacy and zero-latency communication.", 
        defaultImage
      );
    } else {
      setSEO(
        "Page Not Found | NetMeet", 
        "The meeting room you are looking for does not exist, is invalid, or has expired.", 
        notFoundImage
      );
    }
  }, [location]);

  return null;
}

function HomeOrRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  
  useEffect(() => {
    if (params.has('invite')) {
      navigate(`/room${location.search}`, { replace: true });
    }
  }, [location, navigate, params]);

  if (params.has('invite')) return null;

  return <LandingPage onGetStarted={() => navigate('/room')} />;
}

function RoomLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <SignedIn>
        <ContextProvider>
          <div style={{
            ...styles.roomContainer,
            height: isMobile ? 'auto' : '100vh',
            minHeight: '100vh'
          }}>
            <header style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🌐</span>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>NetMeet Live Room</h2>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                <button onClick={() => navigate('/')} style={styles.leaveRoomBtn}>
                  Exit Room
                </button>
                <UserButton />
              </div>
            </header>

            <div style={{
              display: isMobile ? 'flex' : 'grid',
              flexDirection: isMobile ? 'column' : 'row',
              gridTemplateColumns: isMobile ? 'none' : '7fr 3fr',
              gap: '20px',
              flex: 1,
              minHeight: 0
            }}>
              <div style={{ height: isMobile ? '450px' : '100%', flex: isMobile ? 'none' : 1 }}>
                <VideoPlayer isMobile={isMobile} />
              </div>
              <div style={{ height: isMobile ? '450px' : '100%', minHeight: '350px' }}>
                <ChatBox />
              </div>
            </div>
          </div>
        </ContextProvider>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <SEOManager />
      <Routes>
        <Route path="/" element={<HomeOrRedirect />} />
        <Route path="/room" element={<RoomLayout />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="*" element={<NotFound title="404 - Room Not Found" message="The meeting URL you entered is invalid, missing, or has expired." />} />
      </Routes>
    </Router>
  );
}

const styles = {
  roomContainer: { padding: '16px', fontFamily: '"Inter", sans-serif', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', backgroundColor: '#070b14', color: '#e2e8f0' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '12px 24px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' },
  leaveRoomBtn: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }
};