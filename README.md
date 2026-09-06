# 🌐 NetMeet 

![NetMeet Banner](./banner.png)

**NetMeet** is a real-time, peer-to-peer video conferencing and collaboration platform designed for ultra-low latency browser communication. Built with React and WebRTC, it entirely bypasses heavy media routing servers to provide direct, secure, and fast video, audio, and screen-sharing experiences.

### 🚀 Live Demo
* **Frontend:** [Insert your Vercel Link Here]
* **Backend API:** [Insert your Render Link Here]

---

## ✨ Key Features

* **Peer-to-Peer Video & Audio:** True zero-latency media streaming powered by WebRTC.
* **Instant Screen Sharing:** Seamlessly transition between webcams and desktop screen broadcasting.
* **Synchronized Chat:** Real-time text messaging alongside video feeds via Socket.io.
* **Native-Feeling Mobile UX:** Advanced CSS Flexbox/Grid layouts that instantly transition into a Picture-in-Picture (PiP) mode when connecting on mobile devices.
* **Secure Meeting Lobbies:** Protected entry leveraging **Clerk Authentication**.
* **One-Click Invites:** Automatically generate unique, secure URL parameters to instantly connect peers.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js
* WebRTC (`simple-peer` wrapper)
* Socket.io-client
* Clerk (Authentication)
* Vercel (Deployment)

**Backend:**
* Node.js
* Express.js
* Socket.io (Signaling Server)
* Render (Deployment)

---

## 🧠 Technical Highlights & Architecture

NetMeet is designed to handle the unpredictable nature of live media streaming and mobile network connections. Key engineering achievements include:

1. **Stateful Signaling Server:** Engineered a custom Node.js/Socket.io backend to broker WebRTC SDP offers/answers, pairing client IDs in server memory to manage room states.
2. **Resilient Network Handling:** Implemented custom WebRTC tripwires (`peer.on('close')`) and aggressive server-side socket heartbeats (5-second intervals) to instantly detect and gracefully tear down connections during abrupt mobile tab closures or Wi-Fi drops.
3. **Dynamic Stream Binding:** Solved complex React DOM detachment bugs by utilizing **Callback Refs** and strict `useEffect` dependency arrays, ensuring live video tracks remain perfectly bound to the UI even during massive layout shifts (e.g., swapping to Mobile PiP mode).
4. **Symmetric NAT Traversal:** Configured public STUN servers (Google/Twilio) to successfully punch through restrictive mobile carrier firewalls, enabling seamless Mobile-to-Desktop pairing.

---

## 💻 Local Development Setup

To run this project locally, you will need two terminal windows (one for the server, one for the client).

### Prerequisites
* Node.js (v16+)
* A Clerk account (for authentication keys)

### 1. Backend (Signaling Server)

```bash
cd server
npm install
npm start
```
*The server will run on `http://localhost:4000`*

### 2. Frontend (Client)

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory and add your keys:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:4000
```

Start the React development server:

```bash
npm run dev
```
*The client will run on `http://localhost:5173`*

---

## 👨‍💻 Author

**Aman Kumar** 
* **Role:** Full Stack Developer
*If you found this project interesting, feel free to drop a ⭐ on the repository!*
