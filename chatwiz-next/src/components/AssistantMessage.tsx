import { Card } from "@/components/ui/card";

interface AssistantMessageProps {
  message: string;
}

export const AssistantMessage = ({ message }: AssistantMessageProps) => {
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-300">
      <Card className="max-w-[80%] p-4 bg-muted">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </Card>
    </div>
  );
};

