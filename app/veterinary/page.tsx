import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Stethoscope } from "lucide-react";

export default function VeterinaryPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="flex flex-col items-center text-center gap-6 py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-sky-400 text-4xl shadow-lg">
            🏥
          </div>
          <div>
            <h1 className="text-2xl font-bold">Veterinary Clinics & Hospitals</h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              Home visits and in-clinic appointments with certified vets in Dehradun — coming soon.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button asChild>
              <Link href="/vendor/dashboard">
                <Stethoscope className="h-4 w-4 mr-2" />
                Register your clinic
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Explore other services</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground max-w-xs">
            Are you a vet or clinic owner in Dehradun? Join Team Motu early and be the first listed when we go live.
          </p>
        </div>
      </main>
    </>
  );
}
