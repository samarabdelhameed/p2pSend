import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Check, Wifi, Copy } from 'lucide-react';
import Stepper from '../components/Stepper';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { p2pClient } from '../api/p2pClient';

interface ReceiveProps {
  onNavigate: (page: 'landing') => void;
}

export default function Receive({ onNavigate }: ReceiveProps) {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [receiverAddr, setReceiverAddr] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Start receiver and connect WebSocket
    const init = async () => {
      try {
        p2pClient.connectWebSocket();
        const info = await p2pClient.startReceiver();
        setReceiverAddr(info.addresses[0] || '');
      } catch (err: any) {
        setError(err.message);
      }
    };

    init();

    // Listen for incoming files
    const unsubscribe = p2pClient.onMessage((msg) => {
      if (msg.type === 'receiving') {
        if (msg.status === 'metadata') {
          setFileName(msg.fileName || '');
          setFileSize(`${(msg.fileSize! / 1024 / 1024).toFixed(2)} MB`);
          setStep(2);
        } else if (msg.status === 'progress') {
          setProgress(msg.progress || 0);
        } else if (msg.status === 'complete') {
          setStep(3);
        } else if (msg.status === 'error') {
          setError(msg.message || 'Transfer failed');
        }
      }
    });

    return () => {
      unsubscribe();
      p2pClient.stopReceiver();
    };
  }, []);

  const handleDownload = () => {
    alert('File saved in received/ folder');
    onNavigate('landing');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(receiverAddr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <h2 className="text-4xl font-bold text-center mb-2 text-slate-100">Receive File</h2>
          <p className="text-center text-slate-400 mb-8">Waiting for incoming peer-to-peer transfer</p>

          <Stepper steps={['Waiting', 'Receiving', 'Complete']} currentStep={step} />

          <div className="mt-12">
            {step === 1 && (
              <div className="text-center animate-fade-in">
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                      <Wifi className="w-16 h-16 text-primary" />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ripple" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ripple"
                    style={{ animationDelay: '0.7s' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ripple"
                    style={{ animationDelay: '1.4s' }}
                  />
                </div>

                <h3 className="text-2xl font-bold text-slate-100 mb-2">Waiting for Connection</h3>
                <p className="text-slate-400 mb-6">Share this address with the sender</p>

                {receiverAddr && (
                  <div className="max-w-2xl mx-auto mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={receiverAddr}
                        readOnly
                        className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleCopy}
                        className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 transition text-white font-medium flex items-center gap-2"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>Ready to receive</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="p-6 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-100">{fileName}</h4>
                      <p className="text-sm text-slate-400">{fileSize}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-primary font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-success transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-6">
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
                        className="text-success transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Download className="w-16 h-16 text-success animate-pulse" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-100 mb-2">Receiving File</h3>
                  <p className="text-slate-400">Transfer in progress...</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center animate-fade-in">
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-success/20 to-success/40 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-success flex items-center justify-center">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-slate-100 mb-2">Transfer Complete!</h3>
                <p className="text-slate-400 mb-8">Your file has been received successfully</p>

                <div className="p-6 rounded-xl bg-slate-800 border border-slate-700 mb-8 max-w-md mx-auto">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <Check className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-slate-100">{fileName}</h4>
                      <p className="text-sm text-slate-400">{fileSize} · Hash verified</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={handleDownload}>
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Download File
                    </div>
                  </Button>
                  <Button variant="secondary" onClick={() => onNavigate('landing')}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
