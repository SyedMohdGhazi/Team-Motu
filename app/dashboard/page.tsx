import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, Heart, ShoppingBag, CalendarDays, ArrowRight } from "lucide-react";

const quickLinks = [
  { icon: Scissors, title: "Book Grooming", description: "At-home or clinic visits", href: "/grooming", color: "text-blue-500" },
  { icon: Heart, title: "Animal Shelters", description: "Foster homes & daycare", href: "/shelters", color: "text-rose-500" },
  { icon: ShoppingBag, title: "Medical Store", description: "Medicines & supplies", href: "/medical-store", color: "text-emerald-500" },
  { icon: CalendarDays, title: "My Bookings", description: "View appointments", href: "/dashboard/bookings", color: "text-violet-500" },
];

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Hello there 👋</h1>
          <p className="text-muted-foreground mt-1">What do you need today?</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map(({ icon: Icon, title, description, href, color }) => (
            <Link key={title} href={href} className="group">
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <Icon className={`h-8 w-8 ${color}`} />
                  <CardTitle className="text-base mt-2">{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/vendor/dashboard">Vendor Dashboard</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
