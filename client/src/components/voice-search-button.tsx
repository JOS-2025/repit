import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceSearchButtonProps {
  onVoiceResult: (transcript: string) => void;
  language?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function VoiceSearchButton({ 
  onVoiceResult, 
  language = "en-US", 
  className,
  size = "default" 
}: VoiceSearchButtonProps) {
  const { toast } = useToast();

  const {
    isListening,
    isSupported,
    transcript,
    error,
    toggleListening,
  } = useVoiceSearch({
    onResult: (result) => {
      if (result.trim()) {
        onVoiceResult(result);
        toast({
          title: "Voice Search",
          description: `Searching for: "${result}"`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Voice Search Error",
        description: error,
        variant: "destructive",
      });
    },
    language,
  });

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={size}
            disabled
            className={cn("gap-2", className)}
            data-testid="button-voice-search-disabled"
          >
            <MicOff className="w-4 h-4" />
            {size !== "sm" && "Voice Search"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Voice search not supported in this browser</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isListening ? "default" : "outline"}
            size={size}
            onClick={toggleListening}
            className={cn(
              "gap-2 transition-all duration-200",
              isListening && "bg-red-500 hover:bg-red-600 text-white animate-pulse",
              className
            )}
            data-testid="button-voice-search"
          >
            {isListening ? (
              <>
                <Volume2 className="w-4 h-4" />
                {size !== "sm" && "Listening..."}
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                {size !== "sm" && "Voice Search"}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isListening 
              ? "Click to stop listening" 
              : "Click to start voice search"
            }
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Live transcript display */}
      {isListening && transcript && (
        <div className="absolute top-full mt-2 left-0 right-0 z-10">
          <Badge 
            variant="secondary" 
            className="w-full justify-center py-2 px-3 text-sm bg-blue-50 text-blue-800 border-blue-200"
          >
            "{transcript}"
          </Badge>
        </div>
      )}

      {/* Error display */}
      {error && !isListening && (
        <div className="absolute top-full mt-2 left-0 right-0 z-10">
          <Badge 
            variant="destructive" 
            className="w-full justify-center py-2 px-3 text-sm"
          >
            {error}
          </Badge>
        </div>
      )}
    </div>
  );
}