import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, MessageCircle, Mail, AlertCircle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    q: "How do I book a grooming appointment?",
    a: "Go to Grooming Spas, tap on any vendor to open their page, then press 'Book an appointment'. You can save your pet's details once and reuse them every time.",
  },
  {
    q: "Can I save my pet's profile?",
    a: "Yes! From your Dashboard or the home screen, tap 'My Pets' to add your pet's name, breed, age and other details. These auto-fill in every booking form.",
  },
  {
    q: "How do I cancel or reschedule a booking?",
    a: "Open 'My Bookings' from the top-right menu and contact the vendor directly. Cancellation policies vary by vendor.",
  },
  {
    q: "I'm a vendor — how do I list my services?",
    a: "Sign in with your vendor account and go to Vendor Dashboard. You can add, edit and manage your services and business profile from there.",
  },
];

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-sm text-muted-foreground mt-1">We&apos;re here to help you and your furry friends.</p>
        </div>

        {/* Contact options */}
        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          <a
            href="https://wa.me/917798222639"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="hover:shadow-md transition-all h-full border hover:border-green-500/40 bg-gradient-to-br from-green-500/5 to-green-400/0">
              <CardHeader className="pb-2">
                <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <CardTitle className="text-base mt-2">WhatsApp Us</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">Chat with our support team directly on WhatsApp for fast replies.</p>
              </CardContent>
            </Card>
          </a>

          <a href="mailto:sm7919@srmist.edu.in" className="group">
            <Card className="hover:shadow-md transition-all h-full border hover:border-primary/40 bg-gradient-to-br from-primary/5 to-primary/0">
              <CardHeader className="pb-2">
                <Mail className="h-8 w-8 text-primary" />
                <CardTitle className="text-base mt-2">Email Support</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">Send us a message at sm7919@srmist.edu.in and we&apos;ll get back to you.</p>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* FAQs */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border bg-card p-4">
                <p className="font-semibold text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {faq.q}
                </p>
                <p className="text-sm text-muted-foreground mt-2 ml-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
