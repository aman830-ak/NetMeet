import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

// Pages & Components
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import VideoPlayer from './components/VideoPlayer';
import PreJoinLobby from './components/PreJoinLobby';
import NotFound from './components/NotFound';
import Privacy from './pages/Privacy';
import ThankYou from './pages/ThankYou';
import YouLeft from './pages/YouLeft';
import { ContextProvider } from './context/SocketContext';

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
    } else if (location.pathname === '/dashboard') {
      setSEO(
        "Dashboard | NetMeet",
        "Manage your secure video meetings.",
        defaultImage
      );
    } else if (location.pathname === '/left') {
      setSEO(
        "You Left the Meeting | NetMeet",
        "You have left the meeting.",
        defaultImage,
        "noindex, nofollow"
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
    // If someone clicks a direct invite link, send them straight to the room
    if (params.has('invite')) {
      navigate(`/room${location.search}`, { replace: true });
    }
  }, [location, navigate, params]);

  if (params.has('invite')) return null;
  
  // Otherwise, "Get Started" takes them to the new Dashboard lobby
  return <LandingPage onGetStarted={() => navigate('/dashboard')} />;
}

// RoomLayout intercepts the user with the PreJoinLobby before rendering the actual VideoPlayer
function RoomLayout() {
  const [hasJoined, setHasJoined] = useState(false);
  const [meetingSettings, setMeetingSettings] = useState(null);

  const handleJoin = (settings) => {
    setMeetingSettings(settings); // Holds the user's name, mic, and camera preferences
    setHasJoined(true); // Triggers the render of the actual live meeting room
  };

  return (
    <>
      <SignedIn>
        <ContextProvider>
          {!hasJoined ? (
            <PreJoinLobby onJoin={handleJoin} />
          ) : (
            <VideoPlayer />
          )}
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
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/room" element={<RoomLayout />} />
        <Route path="/left" element={<YouLeft />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="*" element={<NotFound title="404" message="Page not found" />} />
      </Routes>
    </Router>
  );
}