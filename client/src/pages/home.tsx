import { Link } from "wouter";
import { TrendingUp, Zap, User, ShieldCheck, ArrowRight } from "lucide-react";
import { BullMascot, BearMascot } from "@/components/mascot";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Subtle Mascot in Header Area - Duolingo Style */}
      <div className="absolute top-6 right-6">
        <BullMascot size="md" />
      </div>
      
      <div className="text-center max-w-md mx-auto space-y-8 fade-in">
        {/* App Logo/Branding */}
        <div className="space-y-2">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
            <TrendingUp className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            StockMatch
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover your perfect portfolio in 30 seconds
          </p>
        </div>
        
        {/* Value Proposition */}
        <div className="space-y-4">
          <p className="text-foreground/80 leading-relaxed">
            Swipe right on companies you love, left on those you don't. We'll create a personalized portfolio just for you.
          </p>
          
          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Fast</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Personal</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Curated</p>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <Link href="/quiz">
          <button
            data-testid="button-get-started"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-8 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </button>
        </Link>
        
        <p className="text-xs text-muted-foreground">
          No signup required • Takes 30 seconds
        </p>
      </div>
    </div>
  );
}
