import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const messages = [
  "Reading your calendar…",
  "Identifying holidays and breaks…",
  "Classifying non-instructional days…",
  "Building your summary…",
];

const LoadingState = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
      setProgress((p) => Math.min(p + 20, 90));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
      <div className="w-full max-w-sm space-y-4 text-center">
        <p className="text-lg font-medium text-foreground">{messages[msgIdx]}</p>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

export default LoadingState;
