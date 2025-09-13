import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import QuizModal from "@/components/quiz-modal";

export interface UserProfile {
  risk: string;
  industries: string[];
  esg: boolean;
  investmentAmount: number;
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const saveProfileMutation = useMutation({
    mutationFn: async (profile: UserProfile) => {
      return api.saveUserProfile({
        sessionId,
        risk: profile.risk,
        industries: profile.industries,
        esg: profile.esg,
        investmentAmount: profile.investmentAmount.toString()
      });
    },
    onSuccess: () => {
      // Store session ID for later use
      sessionStorage.setItem('stockmatch_session', sessionId);
      setLocation('/swipe');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
      console.error('Profile save error:', error);
    }
  });

  const handleQuizComplete = (profile: UserProfile) => {
    saveProfileMutation.mutate(profile);
  };

  return (
    <div className="min-h-screen bg-background">
      <QuizModal 
        onComplete={handleQuizComplete}
        isLoading={saveProfileMutation.isPending}
      />
    </div>
  );
}
