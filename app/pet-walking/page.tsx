import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PetWalkingPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="flex flex-col items-center text-center gap-6 py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-400 text-4xl shadow-lg">
            🦮
          </div>
          <div>
            <h1 className="text-2xl font-bold">Daily Walkies</h1>
            <p className="text-lg font-medium text-amber-500 mt-1">On-Demand Pet Walks & Exercise</p>
            <p className="text-muted-foreground mt-3 max-w-md">
              Certified pet walkers in Dehradun — scheduled daily walks, solo or group sessions, coming soon.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-400 text-white hover:opacity-90">
              <Link href="/pet-walking/register">Register as a Walker</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Explore other services</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground max-w-xs">
            Are you a professional pet walker in Dehradun? Join Team Motu early and be among the first listed when we go live.
          </p>
        </div>
      </main>
    </>
  );
}
