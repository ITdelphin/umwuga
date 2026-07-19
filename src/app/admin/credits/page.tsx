"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DollarSign,
  TrendingUp,
  Clock,
  XCircle,
  CheckCircle2,
  Search,
  Loader2,
  Eye,
  RotateCcw,
  Package,
  Plus,
  Save,
  Receipt,
  CreditCard,
} from "lucide-react"

interface StatsData {
  totalRevenue: number
  pendingPayments: number
  successfulPayments: number
  failedPayments: number
}

interface TransactionRow {
  id: string
  user_id: string
  type: string
  amount: number
  description: string | null
  payment_method: string | null
  status: string
  created_at: string
  profiles?: { full_name: string | null; email: string | null }
}

interface DocTypePrice {
  key: string
  value: string
}

interface CreditPackage {
  amount: number
  price: number
  bonus: number
}

type Tab = "transactions" | "pricing" | "packages"

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "completed": return "default"
    case "pending": return "secondary"
    case "failed": return "destructive"
    case "refunded": return "outline"
    default: return "outline"
  }
}

export default function AdminCreditsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("transactions")
  const [stats, setStats] = useState<StatsData>({
    totalRevenue: 0, pendingPayments: 0, successfulPayments: 0, failedPayments: 0,
  })
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [methodFilter, setMethodFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [refunding, setRefunding] = useState<string | null>(null)

  const [prices, setPrices] = useState<DocTypePrice[]>([])
  const [pricesLoading, setPricesLoading] = useState(true)
  const [savingPrices, setSavingPrices] = useState(false)

  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)

  useEffect(() => { fetchTransactions(); fetchStats(); fetchPrices(); fetchPackages() }, [])

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats({
        totalRevenue: data.totalRevenue || 0,
        pendingPayments: data.pendingPayments || 0,
        successfulPayments: data.successfulPayments || 0,
        failedPayments: data.failedPayments || 0,
      })
    } catch (err) { console.error(err) }
  }

  async function fetchTransactions() {
    setLoading(true)
    try {
      const admin = (await import("@/lib/supabase/client")).createClient()
      const { data } = await admin.from("transactions")
        .select("*, profiles!inner(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(100)
      setTransactions(data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function fetchPrices() {
    setPricesLoading(true)
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      const docs = (data.settings || []).filter((s: DocTypePrice) => s.key.startsWith("price_"))
      setPrices(docs)
    } catch (err) { console.error(err) }
    setPricesLoading(false)
  }

  async function fetchPackages() {
    setPackagesLoading(true)
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      const raw = (data.settings || []).find((s: DocTypePrice) => s.key === "credit_packages")
      if (raw) {
        try { setPackages(JSON.parse(raw.value)) } catch { setPackages([]) }
      } else { setPackages([]) }
    } catch (err) { console.error(err) }
    setPackagesLoading(false)
  }

  const filteredTransactions = transactions.filter(tx => {
    if (search) {
      const q = search.toLowerCase()
      const nameMatch = tx.profiles?.full_name?.toLowerCase().includes(q)
      const emailMatch = tx.profiles?.email?.toLowerCase().includes(q)
      const idMatch = tx.id.toLowerCase().includes(q)
      if (!nameMatch && !emailMatch && !idMatch) return false
    }
    if (dateStart && new Date(tx.created_at) < new Date(dateStart)) return false
    if (dateEnd && new Date(tx.created_at) > new Date(dateEnd + "T23:59:59")) return false
    if (methodFilter && tx.payment_method !== methodFilter) return false
    if (statusFilter && tx.status !== statusFilter) return false
    return true
  })

  const paymentMethods = [...new Set(transactions.map(tx => tx.payment_method).filter((m): m is string => !!m))]

  async function handleRefund(tx: TransactionRow) {
    if (!confirm(`Refund ${tx.amount.toLocaleString()} RWF from ${tx.profiles?.full_name || "Unknown"}?`)) return
    setRefunding(tx.id)
    try {
      const res = await fetch(`/api/admin/transactions/${tx.id}/refund`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) { alert(data.error); return }
      fetchTransactions(); fetchStats()
    } catch (err) { console.error(err); alert("Refund failed") }
    setRefunding(null)
  }

  async function handleSavePrices() {
    setSavingPrices(true)
    try {
      for (const p of prices) {
        await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: p.key, value: p.value }),
        })
      }
      alert("Prices saved")
    } catch (err) { console.error(err) }
    setSavingPrices(false)
  }

  async function handleSavePackages() {
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "credit_packages", value: JSON.stringify(packages) }),
      })
      alert("Packages saved")
    } catch (err) { console.error(err) }
  }

  function updatePrice(key: string, value: string) {
    setPrices(prev => prev.map(p => p.key === key ? { ...p, value } : p))
  }

  function updatePackage(index: number, field: keyof CreditPackage, value: number) {
    setPackages(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  function addPackage() {
    setPackages(prev => [...prev, { amount: 0, price: 0, bonus: 0 }])
  }

  function removePackage(index: number) {
    setPackages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Credits & Payments</h1>
        <p className="text-muted-foreground">Manage payments, pricing, and credit packages</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} RWF</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedPayments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "transactions" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "pricing" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Pricing
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "packages" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Credit Packages
        </button>
      </div>

      {activeTab === "transactions" && (
        <Card>
          <CardHeader>
            <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
            <CardDescription>Search and filter payment records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search user or transaction ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-40" placeholder="Start date" />
              <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-40" placeholder="End date" />
              <Select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="w-36">
                <option value="">All Methods</option>
                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36">
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(tx => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 pr-4 whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="py-3 pr-4">
                          <div className="font-medium truncate max-w-[180px]">{tx.profiles?.full_name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[180px]">{tx.profiles?.email}</div>
                        </td>
                        <td className="py-3 pr-4 capitalize">{tx.type}</td>
                        <td className="py-3 pr-4 text-right font-medium">{tx.amount.toLocaleString()} RWF</td>
                        <td className="py-3 pr-4">{tx.payment_method || "-"}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={statusBadgeVariant(tx.status)}>{tx.status}</Badge>
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedTx(tx); setReceiptOpen(true) }}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            {tx.status === "completed" && (
                              <Button variant="ghost" size="sm" onClick={() => handleRefund(tx)} disabled={refunding === tx.id}>
                                {refunding === tx.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "pricing" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Document Pricing</CardTitle>
              <CardDescription>Set prices per document type</CardDescription>
            </div>
            <Button onClick={handleSavePrices} disabled={savingPrices}>
              {savingPrices ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </CardHeader>
          <CardContent>
            {pricesLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
            ) : prices.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No pricing settings found. Add price_ prefixed keys in system settings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prices.map(p => (
                  <div key={p.key} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">{p.key.replace("price_", "").replace(/_/g, " ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={p.value}
                        onChange={e => updatePrice(p.key, e.target.value)}
                        className="w-32 text-right"
                      />
                      <span className="text-sm text-muted-foreground w-10">RWF</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "packages" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Credit Packages</CardTitle>
              <CardDescription>Manage credit purchase packages</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addPackage}>
                <Plus className="mr-2 h-4 w-4" /> Add Package
              </Button>
              <Button onClick={handleSavePackages}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {packagesLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
            ) : packages.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No packages configured yet. Add one below.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {packages.map((pkg, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Credits</label>
                        <Input type="number" value={pkg.amount} onChange={e => updatePackage(i, "amount", Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Price (RWF)</label>
                        <Input type="number" value={pkg.price} onChange={e => updatePackage(i, "price", Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Bonus Credits</label>
                        <Input type="number" value={pkg.bonus} onChange={e => updatePackage(i, "bonus", Number(e.target.value))} />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => removePackage(i)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Receipt</DialogTitle>
            <DialogDescription>Detailed view of the transaction</DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs break-all">{selectedTx.id}</span>
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(selectedTx.created_at).toLocaleString()}</span>
                <span className="text-muted-foreground">User</span>
                <span>{selectedTx.profiles?.full_name || "Unknown"} ({selectedTx.profiles?.email})</span>
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{selectedTx.type}</span>
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{selectedTx.amount.toLocaleString()} RWF</span>
                <span className="text-muted-foreground">Payment Method</span>
                <span>{selectedTx.payment_method || "-"}</span>
                <span className="text-muted-foreground">Status</span>
                <span><Badge variant={statusBadgeVariant(selectedTx.status)}>{selectedTx.status}</Badge></span>
              </div>
              {selectedTx.description && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1">{selectedTx.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
