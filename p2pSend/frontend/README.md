# p2pSend - Peer-to-Peer File Transfer

A beautiful, modern web application for secure peer-to-peer file transfers with zero servers involved.

## Features

- **Lightning Fast**: Direct P2P connections for maximum speed
- **Hash Verified**: Cryptographic verification ensures file integrity
- **End-to-End Encrypted**: Files never touch our servers
- **Beautiful UI**: Modern design with smooth animations
- **3-Step Process**: Simple flows for both sending and receiving

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Vite
- Lucide Icons
- Custom animations

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Color Scheme

- Primary: #0EA5E9 (Sky Blue)
- Dark: #111827 (Dark Slate)
- Success: #10B981 (Emerald)

## Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── AnimatedBackground.tsx
│   ├── Logo.tsx
│   ├── Stepper.tsx
│   └── Button.tsx
├── pages/          # Main application pages
│   ├── Landing.tsx
│   ├── Send.tsx
│   └── Receive.tsx
└── App.tsx         # Main app with routing
```

## Pages

1. **Landing**: Hero section with animated background and CTA buttons
2. **Send Flow**: 3-step process (Pick file → Share link → Sending)
3. **Receive Flow**: 3-step process (Waiting → Receiving → Complete)
