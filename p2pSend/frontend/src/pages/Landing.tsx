import { Send, Download, Shield, Zap, Lock } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';

interface LandingProps {
  onNavigate: (page: 'send' | 'receive') => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-6 pt-8">
        <div className="flex items-center justify-between">
          <Logo />
          <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-slate-100 text-sm font-medium">
            How it works
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center">
        <div className="text-center max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center animate-pulse-slow">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <Send className="w-16 h-16 text-white animate-float" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full bg-success/20 animate-ripple" />
              <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full bg-success/20 animate-ripple" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          <h1 className="text-6xl font-extrabold mb-6 leading-tight">
            Send files{' '}
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-success">
              peer-to-peer
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            No servers, no limits, fully encrypted & hash-verified. Transfer files directly between devices with zero compromise on speed or security.
          </p>

          <div className="flex gap-6 justify-center mb-16">
            <Button onClick={() => onNavigate('send')}>
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send File
              </div>
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('receive')}>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Receive
              </div>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Lightning Fast</h3>
              <p className="text-slate-400 text-sm">Direct peer-to-peer connection for maximum transfer speed</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Hash Verified</h3>
              <p className="text-slate-400 text-sm">Cryptographic verification ensures file integrity</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">End-to-End Encrypted</h3>
              <p className="text-slate-400 text-sm">Your files never touch our servers</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-6 py-8 text-center text-slate-500 text-sm">
        Built with libp2p · Open Source · Private & Secure
      </footer>
    </div>
  );
}
