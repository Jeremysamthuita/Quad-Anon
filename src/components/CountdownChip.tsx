import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownChipProps {
  expiresAt: string;
  mode: string;
  compact?: boolean;
}

export const CountdownChip: React.FC<CountdownChipProps> = ({ expiresAt, mode, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        return;
      }

      const totalMinutes = Math.floor(diff / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const days = Math.floor(hours / 24);

      if (totalMinutes < 60) {
        setIsUrgent(true);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else if (hours < 24) {
        setIsUrgent(false);
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setIsUrgent(false);
        setTimeLeft(`${days}d ${hours % 24}h`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const getBorderColor = () => {
    if (isExpired) return 'border-[#FF5C7A] text-[#FF5C7A] bg-[#FF5C7A]/10';
    if (isUrgent) return 'border-[#FF6FD8] text-[#FF6FD8] bg-[#FF6FD8]/10';
    return 'border-[rgba(255,255,255,0.15)] text-[#5EEAD4] bg-[#5EEAD4]/5';
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded border transition-colors ${getBorderColor()}`}
      title={`Ephemeral: ${mode} lifespan (Purges at ${new Date(expiresAt).toLocaleTimeString()})`}
    >
      <Clock className="w-3 h-3 shrink-0" />
      <span>{timeLeft || 'Calculating...'}</span>
      {!compact && <span className="opacity-60 text-[10px]">[{mode}]</span>}
    </span>
  );
};
