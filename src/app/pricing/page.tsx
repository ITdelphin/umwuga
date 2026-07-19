"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { PaymentModal } from "@/components/payments/payment-modal"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "0",
    items: [
      { text: "AI Chat & Career Coaching", included: true },
      { text: "Professional Profile", included: true },
      { text: "Document Preview", included: true },
      { text: "1 Free CV Generation", included: true },
      { text: "Download Documents", included: false },
      { text: "ATS Resume Checker", included: false },
      { text: "Premium Templates", included: false },
      { text: "Document Version History", included: false },
    ],
  },
  {
    name: "Pay Per Document",
    price: "100",
    unit: "RWF / document",
    popular: true,
    items: [
      { text: "AI Chat & Career Coaching", included: true },
      { text: "Professional Profile", included: true },
      { text: "PDF & DOCX Download", included: true },
      { text: "Premium Templates", included: true },
      { text: "ATS Resume Checker", included: false },
      { text: "Document Version History", included: false },
      { text: "Priority Support", included: false },
      { text: "Unlimited Documents", included: false },
    ],
  },
  {
    name: "Monthly Premium",
    price: "3,000",
    unit: "RWF / month",
    items: [
      { text: "AI Chat & Career Coaching", included: true },
      { text: "Professional Profile", included: true },
      { text: "PDF & DOCX Download", included: true },
      { text: "Premium Templates", included: true },
      { text: "ATS Resume Checker", included: true },
      { text: "Document Version History", included: true },
      { text: "Priority Support", included: true },
      { text: "Unlimited Documents", included: true },
    ],
  },
]

export default function PricingPage() {
  const [showPayment, setShowPayment] = useState(false)

  return (
    <>
      <Navbar />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold">Simple, Transparent Pricing</h1>
            <p className="mt-4 text-muted-foreground">Start for free, pay only when you need more</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg relative" : ""}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="accent">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.unit && <span className="text-muted-foreground ml-1">{plan.unit}</span>}
                  </div>
                  <CardDescription>All the basics included</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.items.map((item) => (
                      <li key={item.text} className="flex items-center gap-2 text-sm">
                        {item.included ? (
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={item.included ? "" : "text-muted-foreground"}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => setShowPayment(true)}
                    asChild={plan.name === "Free"}
                  >
                    {plan.name === "Free" ? (
                      <Link href="/register">Get Started Free</Link>
                    ) : (
                      <span>Get Started</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {showPayment && (
            <div className="mt-12">
              <PaymentModal onClose={() => setShowPayment(false)} />
            </div>
          )}
        </div>
      </main>
    </>
  )
}
