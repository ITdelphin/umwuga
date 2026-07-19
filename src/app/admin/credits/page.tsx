"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Search, CreditCard, DollarSign, Loader2, Plus } from "lucide-react"

interface CreditRow {
  id: string
  user_id: string
  balance: number
  profiles?: { full_name: string | null; email: string | null }
}

interface TransactionRow {
  id: string
  user_id: string
  type: string
  amount: number
  description: string | null
  payment_method: string | null
  created_at: string
  profiles?: { full_name: string | null; email: string | null }
}

export default function AdminCreditsPage() {
  const supabase = createClient()
  const [credits, setCredits] = useState<CreditRow[]>([])
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const admin = createClient()
      const [creditsRes, txRes] = await Promise.all([
        admin.from("credits").select("*, profiles!inner(full_name, email)").order("balance", { ascending: false }),
        admin.from("transactions").select("*, profiles!inner(full_name, email)").order("created_at", { ascending: false }).limit(50),
      ])
      setCredits(creditsRes.data || [])
      setTransactions(txRes.data || [])
    } catch (err) { console.error("Failed to fetch credits:", err) }
    setLoading(false)
  }

  const filteredCredits = credits.filter(c =>
    c.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalCredits = credits.reduce((sum, c) => sum + c.balance, 0)
  const totalRevenue = transactions.filter(t => t.type === "purchase").reduce((sum, t) => sum + t.amount, 0)

  async function adjustCredits(userId: string, amount: number) {
    const { data: existing } = await supabase.from("credits").select("id, balance").eq("user_id", userId).maybeSingle()
    if (existing) {
      await supabase.from("credits").update({ balance: existing.balance + amount }).eq("id", existing.id)
    } else {
      await supabase.from("credits").insert({ user_id: userId, balance: amount })
    }
    await supabase.from("transactions").insert({
      user_id: userId,
      type: amount > 0 ? "bonus" : "usage",
      amount: Math.abs(amount),
      description: amount > 0 ? "Admin bonus" : "Admin adjustment",
    })
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Credits & Payments</h1>
        <p className="text-muted-foreground">Manage user credits and view transaction history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Credits Issued</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} RWF</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users with Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Credit Balances</CardTitle>
            <CardDescription>User credit accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search user..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-destructive" /></div>
            ) : filteredCredits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No credit accounts found</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredCredits.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.profiles?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.profiles?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge variant="default">{c.balance} credits</Badge>
                      <Button variant="outline" size="sm" onClick={() => {
                        const amount = prompt("Adjust credits (use + or -):", "+10")
                        if (amount) adjustCredits(c.user_id, parseInt(amount))
                      }}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 50 payment and usage events</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-destructive" /></div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{tx.profiles?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{tx.description || tx.type} · {new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge variant={tx.type === "purchase" ? "default" : tx.type === "bonus" ? "secondary" : "outline"}>
                        {tx.type}
                      </Badge>
                      <span className="text-sm font-bold">{tx.amount.toLocaleString()} RWF</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
