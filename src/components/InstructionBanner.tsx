import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ChevronDown, ChevronUp, X } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface InstructionBannerProps {
  title: string;
  summary: string;
  steps: Step[];
  tips?: string[];
}

export default function InstructionBanner({ title, summary, steps, tips }: InstructionBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/60">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-900 text-sm">{title}</h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-blue-600 hover:text-blue-800"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {expanded ? "Hide" : "How to use"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-blue-400 hover:text-blue-600"
                  onClick={() => setDismissed(true)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-0.5">{summary}</p>

            {expanded && (
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-blue-900">{step.title}</span>
                        <p className="text-xs text-blue-700">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {tips && tips.length > 0 && (
                  <div className="bg-blue-100/60 rounded p-2">
                    <span className="text-xs font-semibold text-blue-800">💡 Tips:</span>
                    <ul className="text-xs text-blue-700 mt-1 list-disc pl-4 space-y-0.5">
                      {tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
