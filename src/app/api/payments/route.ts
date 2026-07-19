import { NextResponse } from "next/server"

const DOCUMENT_PRICE = 100 // RWF
const PACKAGES = {
  single: { documents: 1, price: 100 },
  small: { documents: 5, price: 400 },
  medium: { documents: 10, price: 700 },
  premium: { documents: -1, price: 3000, monthly: true },
}

export async function POST(request: Request) {
  try {
    const { package: pkg, paymentMethod } = await request.json()

    if (!pkg || !PACKAGES[pkg as keyof typeof PACKAGES]) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 })
    }

    const selected = PACKAGES[pkg as keyof typeof PACKAGES]

    // TODO: Integrate with MTN Mobile Money / Airtel Money / Equity APIs

    return NextResponse.json({
      success: true,
      message: `Payment of ${selected.price} RWF initiated via ${paymentMethod}`,
      package: selected,
    })
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    prices: PACKAGES,
    singleDocumentPrice: DOCUMENT_PRICE,
    supportedMethods: ["mtn_mobile_money", "airtel_money", "equity"],
  })
}
