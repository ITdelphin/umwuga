"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Wallet, Phone, CreditCard } from "lucide-react"

const packages = [
  { id: "single", documents: 1, price: 100, popular: false },
  { id: "small", documents: 5, price: 400, popular: true },
  { id: "medium", documents: 10, price: 700, popular: false },
  { id: "premium", documents: -1, price: 3000, popular: false, monthly: true },
]

const paymentMethods = [
  { id: "mtn", name: "MTN Mobile Money", icon: Phone },
  { id: "airtel", name: "Airtel Money", icon: Phone },
  { id: "equity", name: "Equity Bank", icon: CreditCard },
]

interface PaymentModalProps {
  onSuccess?: () => void
  onClose?: () => void
}

export function PaymentModal({ onSuccess, onClose }: PaymentModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>("small")
  const [selectedMethod, setSelectedMethod] = useState<string>("mtn")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  const pkg = packages.find(p => p.id === selectedPackage)

  async function handlePayment() {
    if (!phone) return
    setLoading(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: selectedPackage,
          paymentMethod: selectedMethod,
          phone,
        }),
      })
      const data = await res.json()
      if (data.success) {
        onSuccess?.()
      }
    } catch (error) {
      console.error("Payment failed:", error)
    }
    setLoading(false)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Choose a Plan</CardTitle>
        <CardDescription>Unlock document downloads and premium features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-lg border p-4 cursor-pointer transition-all ${
                selectedPackage === pkg.id
                  ? "border-primary ring-1 ring-primary bg-primary/5"
                  : "hover:border-muted-foreground"
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {pkg.monthly ? "Monthly" : pkg.documents + " docs"}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {pkg.price.toLocaleString()} RWF
                  </p>
                  {pkg.monthly && (
                    <p className="text-xs text-muted-foreground">/month</p>
                  )}
                </div>
                {selectedPackage === pkg.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              {pkg.popular && (
                <Badge className="mt-2 w-full justify-center" variant="accent">
                  Popular
                </Badge>
              )}
            </div>
          ))}
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block">Payment Method</Label>
          <div className="grid gap-2 md:grid-cols-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <div
                  key={method.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? "border-primary ring-1 ring-primary bg-primary/5"
                      : "hover:border-muted-foreground"
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{method.name}</span>
                  {selectedMethod === method.id && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="+250 7XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            You will receive a payment request on this number
          </p>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="flex justify-between text-sm">
            <span>Package</span>
            <span className="font-medium">
              {pkg?.monthly ? "Monthly Premium" : `${pkg?.documents} documents`}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span>Total</span>
            <span className="font-bold text-primary">
              {pkg?.price.toLocaleString()} RWF
            </span>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handlePayment} disabled={loading || !phone}>
          {loading ? (
            <>Processing...</>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Pay {pkg?.price.toLocaleString()} RWF via {paymentMethods.find(m => m.id === selectedMethod)?.name}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
