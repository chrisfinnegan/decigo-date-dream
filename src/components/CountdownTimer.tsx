import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  deadline: string;
  className?: string;
}

export const CountdownTimer = ({ deadline, className = "" }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const distance = deadlineTime - now;

      if (distance < 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      <Clock className="w-4 h-4" />
      <span>{timeLeft}</span>
    </div>
  );
};
