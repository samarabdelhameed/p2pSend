import { Wifi } from 'lucide-react';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Wifi className="w-8 h-8 text-primary" />
        <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-success rounded-full animate-pulse" />
      </div>
      <span className="text-2xl font-bold">
        <span className="text-primary">p2p</span>
        <span className="text-slate-100">Send</span>
      </span>
    </div>
  );
}
