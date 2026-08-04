import React, { useState, useEffect } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/clerk-react';

const LandingPage = ({ onGetStarted }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.container}>
      {/* 1. NAVBAR */}
      <nav style={styles.nav(isMobile)}>
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle(isMobile)}>N</div>
          <h2 style={styles.logoText(isMobile)}>NetMeet</h2>
        </div>
        
        {!isMobile && (
          <div style={styles.navLinks}>
            <a href="#simulator" style={styles.navLink}>Live Simulator</a>
            <a href="#technology" style={styles.navLink}>Core Technology</a>
            <a href="#faq" style={styles.navLink}>FAQ</a>
          </div>
        )}

        <div style={styles.authButtons}>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={styles.secondaryBtn}>Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={styles.primaryBtn}>Get Invite Code</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <button onClick={onGetStarted} style={styles.primaryBtn}>Enter Room →</button>
          </SignedIn>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section style={styles.heroSection(isMobile)}>
        <div style={styles.badge}>
          <span style={styles.dot}></span> NETMEET WEBRTC
        </div>
        <h1 style={styles.heroTitle(isMobile)}>
          Meet <span style={styles.italicAccent}>Different</span>
        </h1>
        <p style={styles.heroSubtitle(isMobile)}>
          Transform remote meetings with NetMeet's robust peer-to-peer engagement platform, 
          featuring ultra-low latency video, synchronized chat, and seamless screen sharing. 
          All from any browser. No app downloads required.
        </p>
        
        <SignedOut>
          <SignUpButton mode="modal">
            <button style={styles.heroCta(isMobile)}>Request Invitation Code →</button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <button onClick={onGetStarted} style={styles.heroCta(isMobile)}>Launch Meeting Room →</button>
        </SignedIn>

        {/* 4 Quick Info Cards */}
        <div style={styles.quickStatsRow(isMobile)}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📱</div>
            <h4 style={styles.statTitle}>Click to Connect</h4>
            <p style={styles.statDesc}>Zero installations. Immediate access via URL link.</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚡</div>
            <h4 style={styles.statTitle}>WebRTC Powered</h4>
            <p style={styles.statDesc}>Direct peer-to-peer video streams for zero latency.</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💬</div>
            <h4 style={styles.statTitle}>Active Interaction</h4>
            <p style={styles.statDesc}>Real-time synchronized chat with emoji integrations.</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <h4 style={styles.statTitle}>In-Depth Sharing</h4>
            <p style={styles.statDesc}>Instant full-desktop or specific tab screen broadcasting.</p>
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES */}
      <section style={styles.sharedSection(isMobile)}>
        <div style={styles.sectionBadge}>✨ BUILT FOR COLLABORATION</div>
        <h2 style={styles.sectionTitle(isMobile)}>Everything You Need to Connect</h2>
        <p style={styles.sectionSubtitle(isMobile)}>
          NetMeet strips away the bloat of traditional meeting software, giving you exactly what you need for fast, high-quality collaboration directly in your browser.
        </p>

        <div style={styles.dynamicGrid(isMobile)}>
          {[
            { tag: 'Seamless Access', icon: '🔗', title: 'One-Click Invite Links', desc: 'No apps to download or accounts required for guests. Generate a secure link and jump into a meeting instantly from any device.', color: '#0ea5e9' },
            { tag: 'Interactive', icon: '💬', title: 'Rich Media Chat', desc: 'Keep the conversation flowing alongside your video. Share files, zoom in on high-res photos, and react with a full WhatsApp-style emoji picker.', color: '#10b981' },
            { tag: 'Collaboration', icon: '💻', title: 'Instant Screen Sharing', desc: 'Present your ideas with zero friction. Broadcast your entire desktop or a specific browser tab with high frame rates and ultra-low latency.', color: '#8b5cf6' }
          ].map((card, i) => (
            <div key={i} style={styles.useCaseCard}>
              <div style={{ ...styles.cardImage, backgroundColor: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
                <span style={{ position: 'absolute', top: '20px', left: '20px', ...styles.cardImageTag }}>{card.tag}</span>
                {card.icon}
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardHeading}>{card.title}</h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LIVE SIMULATOR */}
      <section id="simulator" style={styles.sharedSection(isMobile, true)}>
        <div style={styles.simHeaderWrap(isMobile)}>
          <div>
            <h2 style={{ ...styles.sectionTitle(isMobile), textAlign: 'left', margin: 0 }}>Live Product Simulator</h2>
            <p style={{ ...styles.sectionSubtitle(isMobile), textAlign: 'left', margin: '10px 0 0' }}>
              Watch the host video feed while we simulate the attendees' personal chat view in real-time.
            </p>
          </div>
          <div style={styles.simControls(isMobile)}>
            <button style={styles.simBtnActive(isMobile)}>WebRTC Sync</button>
            <button style={styles.simBtn(isMobile)}>⏸ Pause</button>
          </div>
        </div>

        <div style={styles.simulatorGrid(isMobile)}>
          {/* Left: Stage Screen */}
          <div style={styles.stageScreen}>
            <div style={styles.simLabel}>● STAGE SCREEN</div>
            <div style={styles.stageVideoHeader}>
              <div style={styles.avatar}>ER</div>
              <div>
                <h4 style={{ margin: 0, color: '#0f172a' }}>Dr. Elena Rostova</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Director of Engineering</p>
              </div>
            </div>
            <div style={styles.stageVideoBox}>
              <p style={{ color: '#fff', opacity: 0.8, marginBottom: '10px' }}>CAMERA FEED 1</p>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', margin: 0 }}>System Architecture Overview</h3>
              <ul style={{ color: '#cbd5e1', marginTop: '20px', lineHeight: '1.6', padding: 0, listStyle: 'none', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '8px' }}>• Peer-to-peer mesh networking protocols.</li>
                <li style={{ marginBottom: '8px' }}>• Socket.io for instantaneous chat state bridging.</li>
                <li>• Reducing server bandwidth dependency by 40%.</li>
              </ul>
            </div>
          </div>

          {/* Right: Personal Device */}
          <div style={styles.personalScreen}>
            <div style={styles.simLabel}>📱 PERSONAL DEVICE</div>
            <div style={styles.phoneMockup}>
              <div style={styles.phoneHeader}>
                <strong>NetMeet.Live</strong>
                <span style={{ color: '#10b981', fontSize: '0.8rem' }}>● Synced</span>
              </div>
              <div style={styles.phoneBody}>
                <div style={styles.chatMessage}>
                  <strong>Host:</strong> Welcome to the room! Let's get started.
                </div>
                <div style={styles.chatMessage}>
                  <strong>Elena:</strong> Can everyone see my screen?
                </div>
                <div style={styles.chatMessageMe}>
                  <strong>You:</strong> Yes, looks perfectly clear! 🚀
                </div>
              </div>
              <div style={styles.phoneInput}>Type a message...</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section style={styles.sharedSection(isMobile)}>
        <div style={styles.sectionBadge}>✨ ACTIVE ENGAGEMENT</div>
        <h2 style={styles.sectionTitle(isMobile)}>How NetMeet Sparks Active Participation</h2>
        <p style={styles.sectionSubtitle(isMobile)}>
          See how developers, remote teams, and global organizers leverage NetMeet to elevate attendee engagement.
        </p>

        <div style={styles.dynamicGrid(isMobile)}>
          {[
            { text: "NetMeet empowered our remote exhibition, making the connection seamless and efficient. We look forward to building more on this platform!", tags: ['#TechExpo', '#GlobalClarity'] },
            { text: "In our cross-cultural exchange, NetMeet performed beyond expectations! Attendees effortlessly connected their video without venue constraints.", tags: ['#ZeroBoundaries', '#WebRTC'] },
            { text: "Our summit used NetMeet as its primary hub. It provided rock-solid real-time broadcasts and streamlined interactive Q&As.", tags: ['#StableLive', '#SmartNotes'] },
            { text: "For our recent workshop, NetMeet turned complex technical presentations into highly engaging interactive sessions.", tags: ['#ActiveLearning', '#DigitalOutreach'] }
          ].map((t, i) => (
            <div key={i} style={styles.testimonialCard}>
              <div style={styles.stars}>⭐⭐⭐⭐⭐</div>
              <p style={styles.testimonialText}>"{t.text}"</p>
              <div style={styles.tagRow}>
                {t.tags.map(tag => <span key={tag} style={styles.tag}>{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CORE TECHNOLOGY */}
      <section id="technology" style={styles.sharedSection(isMobile, true)}>
        <div style={styles.sectionBadge}>✨ CORE TECHNOLOGY BENEFITS</div>
        <h2 style={styles.sectionTitle(isMobile)}>Engineered for Premium, Dual-Sync Experiences</h2>
        <p style={styles.sectionSubtitle(isMobile)}>
          Hosting global meetings usually requires bulky software and expensive routing servers. NetMeet completely replaces them via direct P2P technology.
        </p>

        <div style={styles.dynamicGrid(isMobile)}>
          <div style={styles.techCard}>
            <div style={styles.techIcon}>📱</div>
            <h4 style={styles.techTitle}>Zero-Friction Connections</h4>
            <p style={styles.techDesc}>Instantly active in native Safari/Chrome browsers on iOS, Android, or desktop. No app stores.</p>
          </div>
          <div style={styles.techCard}>
            <div style={styles.techIcon}>⚡</div>
            <h4 style={styles.techTitle}>Real-Time Layout Syncing</h4>
            <p style={styles.techDesc}>Video grids and chat windows update in lockstep via high-speed WebSocket connections.</p>
          </div>
          <div style={styles.techCard}>
            <div style={styles.techIcon}>💬</div>
            <h4 style={styles.techTitle}>Active Interaction</h4>
            <p style={styles.techDesc}>Real-time Q&A, instant feedback emojis, and direct peer-to-peer data channels.</p>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" style={styles.sharedSection(isMobile)}>
        <div style={styles.sectionBadge}>✨ FREQUENTLY ASKED QUESTIONS</div>
        <h2 style={styles.sectionTitle(isMobile)}>Got Questions? We've Got Answers.</h2>
        <div style={styles.dynamicGrid(isMobile)}>
          {[
            { q: "Is NetMeet really free?", a: "Yes! NetMeet is completely free to use. There are no hidden fees or premium tiers." },
            { q: "Do I need to download anything?", a: "Not at all. NetMeet runs directly in your web browser (Chrome, Safari, Edge, etc.) on both desktop and mobile." },
            { q: "Are my meetings secure?", a: "Absolutely. We use WebRTC technology, which creates a direct peer-to-peer connection. Your video and audio data never touches our servers." },
            { q: "Can I use it on my phone?", a: "Yes! NetMeet is fully responsive and works beautifully on iOS and Android browsers." }
          ].map((faq, i) => (
            <div key={i} style={styles.faqCard}>
              <h4 style={styles.faqQuestion}>{faq.q}</h4>
              <p style={styles.faqAnswer}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. BOTTOM CTA */}
      <section style={{ ...styles.sharedSection(isMobile), paddingBottom: isMobile ? '40px' : '80px' }}>
        <div style={styles.ctaBox(isMobile)}>
          <div>
            <h3 style={styles.ctaTitle(isMobile)}>Are you hosting a remote meeting soon?</h3>
            <p style={styles.ctaDesc}>We offer best-in-class software to ensure your attendees get the best experience possible.</p>
          </div>
          <div style={{ width: isMobile ? '100%' : 'auto' }}>
            <SignedOut>
              <SignUpButton mode="modal">
                <button style={styles.heroCta(isMobile)}>REQUEST INVITATION CODE</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <button onClick={onGetStarted} style={styles.heroCta(isMobile)}>ENTER ROOM NOW</button>
            </SignedIn>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>© 2026 NetMeet Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

// 🎨 RESPONSIVE STYLES
const styles = {
  container: { backgroundColor: '#ffffff', color: '#0f172a', fontFamily: '"Inter", sans-serif', overflowX: 'hidden', maxWidth: '100vw' },
  
  nav: (isMobile) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '15px 20px' : '15px 50px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }),
  logoContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoCircle: (isMobile) => ({ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', backgroundColor: '#0d9488', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: isMobile ? '16px' : '18px' }),
  logoText: (isMobile) => ({ margin: 0, color: '#0d9488', fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: '800' }),
  navLinks: { display: 'flex', gap: '30px' },
  navLink: { color: '#334155', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' },
  authButtons: { display: 'flex', gap: '10px' },
  secondaryBtn: { background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  primaryBtn: { backgroundColor: '#0d9488', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },

  heroSection: (isMobile) => ({ textAlign: 'center', padding: isMobile ? '50px 20px 40px' : '80px 20px 60px', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }),
  badge: { border: '1px solid #ccfbf1', backgroundColor: '#f0fdfa', color: '#0d9488', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' },
  dot: { width: '8px', height: '8px', backgroundColor: '#0d9488', borderRadius: '50%' },
  heroTitle: (isMobile) => ({ fontSize: isMobile ? '2.8rem' : '4.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 20px', letterSpacing: '-1px', lineHeight: '1.1' }),
  italicAccent: { fontStyle: 'italic', color: '#0d9488' },
  heroSubtitle: (isMobile) => ({ fontSize: isMobile ? '1rem' : '1.15rem', color: '#475569', lineHeight: '1.6', maxWidth: '750px', margin: '0 auto 30px', padding: '0 10px' }),
  heroCta: (isMobile) => ({ backgroundColor: '#0d9488', color: '#fff', border: 'none', padding: '15px 35px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto', boxShadow: '0 4px 15px rgba(13, 148, 136, 0.3)' }),
  
  quickStatsRow: (isMobile) => ({ display: 'flex', gap: '15px', marginTop: isMobile ? '40px' : '60px', width: '100%', justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }),
  statCard: { flex: '1 1 200px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  statIcon: { fontSize: '1.5rem', marginBottom: '12px', color: '#0d9488', backgroundColor: '#f0fdfa', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' },
  statTitle: { margin: '0 0 5px', fontSize: '1rem', color: '#0f172a' },
  statDesc: { margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' },

  sharedSection: (isMobile, bgDark = false) => ({ padding: isMobile ? '50px 20px' : '80px 40px', textAlign: 'center', backgroundColor: bgDark ? '#f8fafc' : '#ffffff', boxSizing: 'border-box' }),
  sectionBadge: { color: '#0d9488', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '15px' },
  sectionTitle: (isMobile) => ({ fontSize: isMobile ? '2rem' : '2.5rem', color: '#0f172a', margin: '0 0 15px', fontWeight: '800', lineHeight: '1.2' }),
  sectionSubtitle: (isMobile) => ({ fontSize: isMobile ? '1rem' : '1.1rem', color: '#475569', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }),
  
  dynamicGrid: (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto', textAlign: 'left' }),
  
  useCaseCard: { backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', textAlign: 'left' },
  cardImage: { height: '180px', position: 'relative', padding: '20px' },
  cardImageTag: { backgroundColor: 'rgba(255,255,255,0.9)', color: '#0f172a', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' },
  cardContent: { padding: '25px' },
  cardHeading: { fontSize: '1.25rem', color: '#0f172a', margin: '0 0 10px' },

  simHeaderWrap: (isMobile) => ({ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', marginBottom: '30px', gap: '15px', maxWidth: '1100px', margin: '0 auto 30px' }),
  simControls: (isMobile) => ({ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }),
  simBtnActive: (isMobile) => ({ backgroundColor: '#0d9488', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', flex: isMobile ? 1 : 'none' }),
  simBtn: (isMobile) => ({ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', flex: isMobile ? 1 : 'none' }),
  simulatorGrid: (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', backgroundColor: '#f8fafc', padding: isMobile ? '15px' : '40px', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '1100px', margin: '0 auto', textAlign: 'left', boxSizing: 'border-box' }),
  simLabel: { color: '#0d9488', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px' },
  
  stageScreen: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', boxSizing: 'border-box' },
  stageVideoHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', flexShrink: 0 },
  stageVideoBox: { backgroundColor: '#451a03', borderRadius: '12px', padding: '20px', minHeight: '200px' },
  
  personalScreen: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  phoneMockup: { border: '6px solid #0f172a', borderRadius: '24px', flex: 1, minHeight: '300px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  phoneHeader: { padding: '12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' },
  phoneBody: { flex: 1, backgroundColor: '#f8fafc', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  chatMessage: { backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid #e2e8f0', alignSelf: 'flex-start', maxWidth: '85%' },
  chatMessageMe: { backgroundColor: '#ccfbf1', padding: '10px 12px', borderRadius: '12px', fontSize: '0.8rem', color: '#115e59', alignSelf: 'flex-end', maxWidth: '85%' },
  phoneInput: { padding: '12px', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#94a3b8' },

  testimonialCard: { backgroundColor: '#ffffff', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  stars: { color: '#fbbf24', fontSize: '1.2rem', marginBottom: '10px' },
  testimonialText: { fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', marginBottom: '15px' },
  tagRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tag: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' },
  
  techCard: { backgroundColor: '#ffffff', padding: '30px 25px', borderRadius: '16px', border: '1px solid #e2e8f0' },
  techIcon: { fontSize: '2rem', color: '#0d9488', marginBottom: '15px' },
  techTitle: { fontSize: '1.1rem', color: '#0f172a', margin: '0 0 10px' },
  techDesc: { color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 },

  faqCard: { padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' },
  faqQuestion: { color: '#0f172a', fontSize: '1rem', margin: '0 0 8px', fontWeight: 'bold' },
  faqAnswer: { color: '#475569', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' },

  ctaBox: (isMobile) => ({ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: isMobile ? '30px 20px' : '40px 60px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto', flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left', gap: '20px', boxSizing: 'border-box' }),
  ctaTitle: (isMobile) => ({ margin: '0 0 10px', fontSize: isMobile ? '1.2rem' : '1.5rem', color: '#0f172a' }),
  ctaDesc: { margin: 0, color: '#475569', fontSize: '0.95rem' },
  
  footer: { textAlign: 'center', padding: '20px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.85rem' }
};

export default LandingPage;