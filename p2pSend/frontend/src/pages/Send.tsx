import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Copy, Check, Share2 } from 'lucide-react';
import Stepper from '../components/Stepper';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { p2pClient } from '../api/p2pClient';

interface SendProps {
  onNavigate: (page: 'landing') => void;
}

export default function Send({ onNavigate }: SendProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [receiverAddr, setReceiverAddr] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    p2pClient.connectWebSocket();

    const unsubscribe = p2pClient.onMessage((msg) => {
      if (msg.type === 'sending') {
        if (msg.status === 'progress') {
          setProgress(msg.progress || 0);
        } else if (msg.status === 'complete') {
          setTimeout(() => {
            alert('File sent successfully!');
            onNavigate('landing');
          }, 1000);
        } else if (msg.status === 'error') {
          setError(msg.message || 'Transfer failed');
          setSending(false);
        }
      }
    });

    return () => unsubscribe();
  }, [onNavigate]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setTimeout(() => setStep(2), 500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const startTransfer = async () => {
    if (!file || !receiverAddr.trim()) {
      setError('Please provide receiver address');
      return;
    }

    setSending(true);
    setStep(3);
    setError('');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          
          await p2pClient.sendFile({
            fileName: file.name,
            fileData: base64,
            receiverAddr: receiverAddr.trim()
          });
        } catch (err: any) {
          setError(err.message || 'Failed to send file');
          setSending(false);
          setStep(2);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setSending(false);
        setStep(2);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
      setSending(false);
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-6 pt-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-slate-300 hover:text-primary transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <Logo />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-2 text-slate-100">Send File</h2>
          <p className="text-center text-slate-400 mb-8">Share files securely with peer-to-peer transfer</p>

          <Stepper steps={['Pick file', 'Share link', 'Sending']} currentStep={step} />

          <div className="mt-12">
            {step === 1 && (
              <div
                className={`
                  border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                  ${isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-slate-600 hover:border-primary/50'}
                `}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-primary animate-float" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Drop your file here
                </h3>
                <p className="text-slate-400 mb-6">or</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                {file && (
                  <div className="p-6 rounded-xl bg-slate-800 border border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-100">{file.name}</h4>
                        <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-slate-300 mb-4 font-medium">Enter receiver address</p>

                  <div className="max-w-2xl mx-auto mb-6">
                    <textarea
                      value={receiverAddr}
                      onChange={(e) => setReceiverAddr(e.target.value)}
                      placeholder="Paste receiver multiaddr here (e.g., /ip4/127.0.0.1/tcp/xxxxx/p2p/...)"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:border-primary resize-none"
                      rows={3}
                    />
                  </div>

                  {error && (
                    <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="mt-8">
                    <Button onClick={startTransfer} disabled={sending || !receiverAddr.trim()}>
                      <div className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        {sending ? 'Connecting...' : 'Start Transfer'}
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center animate-fade-in">
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-700"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                      className="text-primary transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">{progress}%</div>
                      <div className="text-sm text-slate-400 mt-2">Sending...</div>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-100 mb-2">Transfer in Progress</h3>
                <p className="text-slate-400">Please keep this window open</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
