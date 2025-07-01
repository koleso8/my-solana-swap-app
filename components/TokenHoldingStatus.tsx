"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { SOLANA_CONFIG } from "@/config/constants"
import { CheckCircle } from "lucide-react"

export function TokenHoldingStatus() {
  const { publicKey } = useWallet()
  const [holding, setHolding] = useState<{ isHolder: boolean; amount: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (publicKey && SOLANA_CONFIG.PROJECT_TOKEN_ADDRESS) {
      checkHolding()
    }
  }, [publicKey])

  const checkHolding = async () => {
    if (!publicKey || !SOLANA_CONFIG.PROJECT_TOKEN_ADDRESS) return

    setLoading(true)
    try {
      const response = await fetch("/api/wallet/holding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          tokenAddress: SOLANA_CONFIG.PROJECT_TOKEN_ADDRESS,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setHolding({ isHolder: data.isHolder, amount: data.amount })
      }
    } catch (error) {
      console.error("Failed to check holding:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!publicKey || !SOLANA_CONFIG.PROJECT_TOKEN_ADDRESS) return null

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">API Access Status</h3>
      {loading ? (
        <p>Checking...</p>
      ) : holding ? (
        <div>
          {holding.isHolder ? (
            <div className="text-green-600">
              <p className="font-medium"><CheckCircle size={20} color={'green'} /> Unlimited Access!</p>
              <p className="text-sm">You hold {holding.amount} tokens</p>
            </div>
          ) : (
            <div className="text-orange-600">
              <p className="font-medium">⚠️ Limited Access</p>
              <p className="text-sm">Hold $TOKEN for unlimited API access</p>
              <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Buy $TOKEN</button>
            </div>
          )}
        </div>
      ) : (
        <button onClick={checkHolding} className="text-blue-600 hover:underline">
          Check Status
        </button>
      )}
    </div>
  )
}
