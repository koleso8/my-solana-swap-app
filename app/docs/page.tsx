"use client";

import React, { useState } from 'react';
import { Copy, CheckCircle, AlertCircle, Code, ExternalLink, Zap, Shield, TrendingUp, X, Construction, NotebookPen } from 'lucide-react';
import { Project_Domain, Project_Name } from '@/config/constants';

export default function APIDocumentation() {
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const CodeBlock = ({ children, language = 'javascript', id }) => (
    <div className="relative">
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto dark:bg-gray-800 dark:text-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 uppercase dark:text-gray-500">{language}</span>
          <button
            onClick={() => copyToClipboard(children, id)}
            className="text-gray-400 hover:text-white transition-colors dark:text-gray-500 dark:hover:text-gray-300 absolute right-3 top-3"
          >
            {copiedCode === id ? <CheckCircle size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <pre className="text-sm">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-10 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10 pt-7 dark:bg-gray-900/80 dark:border-gray-800/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 dark:text-transparent">
                {Project_Name}
              </h1>
              <p className="text-gray-600 mt-2 dark:text-gray-400">
                A simple and reliable way to perform token swaps on various Solana AMM platforms
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-green-900/50 dark:text-green-300">
                v1.0.0
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto pt-4">
          {/* Quick Start */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Zap className="mr-2 text-blue-600 dark:text-blue-400" />
              Quick Start
            </h2>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200/50 dark:bg-gray-800/70 dark:border-gray-700/50">
              <p className="text-gray-600 mb-6 dark:text-gray-400">
                Start using our API for token swaps on Solana in minutes.
                All requests require a wallet address in the header.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50/50 p-4 rounded-lg dark:bg-blue-900/20">
                  <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">Base URL</h3>
                  <code className="bg-white px-3 py-2 rounded text-sm block dark:bg-gray-700 dark:text-gray-200">
                    {Project_Domain}/api
                  </code>
                </div>
                <div className="bg-green-50/50 p-4 rounded-lg dark:bg-green-900/20">
                  <h3 className="font-semibold mb-2 text-green-800 dark:text-green-300">Authentication</h3>
                  <code className="bg-white px-3 py-2 rounded text-sm block dark:bg-gray-700 dark:text-gray-200">
                    x-wallet-address: YOUR_WALLET
                  </code>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-lg dark:bg-purple-900/20">
                  <h3 className="font-semibold mb-2 text-purple-800 dark:text-purple-300">Rate Limit</h3>
                  <code className="bg-white px-3 py-2 rounded text-sm block dark:bg-gray-700 dark:text-gray-200">
                    30 requests/minute
                  </code>
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Shield className="mr-2 text-orange-600 dark:text-orange-400" />
              Restrictions
            </h2>
            <div className="bg-orange-50/70 backdrop-blur-sm border border-orange-200 p-4 rounded-xl dark:bg-orange-900/20 dark:border-orange-800/50">
              <div className="flex items-center">
                <AlertCircle className="text-orange-600 mr-3 dark:text-orange-400" size={24} />
                <div>
                  <p className="font-semibold text-orange-800 dark:text-orange-300">Request limits</p>
                  <p className="text-orange-700 dark:text-orange-500">30 requests per minute per IP address. If the limit is exceeded, the status 429 is returned.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Raydium Integration */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <TrendingUp className="mr-2 text-purple-600 dark:text-purple-400" />
              Raydium Integration
            </h2>

            {/* Get Quote */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200/50 mb-8 dark:bg-gray-800/70 dark:border-gray-700/50">
              <div className="flex items-center mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3 dark:bg-blue-900/50 dark:text-blue-300">
                  GET
                </span>
                <h3 className="text-xl font-semibold dark:text-gray-200">/quote/raydium</h3>
              </div>

              <p className="text-gray-600 mb-4 dark:text-gray-400">
                Get a quote for a swap without executing a transaction.
              </p>

              <h4 className="font-semibold mb-3 dark:text-gray-200">Parameters</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border border-gray-200 rounded-lg dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-3 font-semibold border-b dark:text-gray-300">Parameter</th>
                      <th className="text-left p-3 font-semibold border-b dark:text-gray-300">Type</th>
                      <th className="text-left p-3 font-semibold border-b dark:text-gray-300">Required</th>
                      <th className="text-left p-3 font-semibold border-b dark:text-gray-300">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    <tr>
                      <td className="p-3 font-mono text-purple-600 dark:text-purple-400">fromMint</td>
                      <td className="p-3 dark:text-gray-400">string</td>
                      <td className="p-3 dark:text-gray-400"><CheckCircle size={20} color={'green'} /></td>
                      <td className="p-3 dark:text-gray-400">Incoming token address</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-purple-600 dark:text-purple-400">toMint</td>
                      <td className="p-3 dark:text-gray-400">string</td>
                      <td className="p-3 dark:text-gray-400"><CheckCircle size={20} color={'green'} /></td>
                      <td className="p-3 dark:text-gray-400">Outgoing token address</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-purple-600 dark:text-purple-400">amount</td>
                      <td className="p-3 dark:text-gray-400">number</td>
                      <td className="p-3 dark:text-gray-400"><CheckCircle size={20} color={'green'} /></td>
                      <td className="p-3 dark:text-gray-400">Number of incoming tokens</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold mb-2 dark:text-gray-200">Example request</h4>
              <CodeBlock id="quote-request" language="bash">
                {`curl -X GET "${Project_Domain}/api/quote/raydium?fromMint=So11111111111111111111111111111111111111112&toMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000"`}
              </CodeBlock>

              <h4 className="font-semibold mb-2 mt-4 dark:text-gray-200">Sample answer</h4>
              <CodeBlock id="quote-response" language="json">
                {`{
  "success": true,
  "data": {
    "inputAmount": "1000000",
    "outputAmount": "1000145",
    "priceImpact": 0.12,
    "minimumReceived": "995144",
    "fees": {
      "networkFee": 5000,
      "platformFee": 0
    },
    "route": [
      "So11111111111111111111111111111111111111112",
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    ]
  },
  "meta": {
    "provider": "${Project_Name}",
    "version": "1.0.0",
    "timestamp": "2025-06-28T10:30:00.000Z",
    "amm": "Raydium"
  }
}`}
              </CodeBlock>
            </div>

            {/* Execute Swap */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200/50 mb-8 dark:bg-gray-800/70 dark:border-gray-700/50">
              <div className="flex items-center mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-3 dark:bg-green-900/50 dark:text-green-300">
                  POST
                </span>
                <h3 className="text-xl font-semibold dark:text-gray-200">/swap/raydium</h3>
              </div>

              <p className="text-gray-600 mb-4 dark:text-gray-400">
                Prepare a transaction for a token swap on Raydium.
              </p>

              <h4 className="font-semibold mb-2 dark:text-gray-200">Headers</h4>
              <CodeBlock id="swap-headers">
                {`Content-Type: application/json
x-wallet-address: YOUR_WALLET_ADDRESS`}
              </CodeBlock>

              <h4 className="font-semibold mb-3 mt-4 dark:text-gray-200">Request body parameters</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border border-gray-200 rounded-lg dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-3 font-semibold border-b dark:text-gray-300">Parameter</th>
                      <th className="text-left p-3 font-semibold border-b dark:text-gray-300">Type</th>
                      <th className="text-left p-3 font-semibold border-b dark:text-gray-300">Required</th>
                      <th className="text-left p-3 font-semibold border-b dark:text-gray-300">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    <tr>
                      <td className="p-3 font-mono text-green-600 dark:text-green-400">fromMint</td>
                      <td className="p-3 dark:text-gray-400">string</td>
                      <td className="p-3 dark:text-gray-400"><CheckCircle size={20} color={'green'} /></td>
                      <td className="p-3 dark:text-gray-400">Incoming token address</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-green-600 dark:text-green-400">toMint</td>
                      <td className="p-3 dark:text-gray-400">string</td>
                      <td className="p-3 dark:text-gray-400"><CheckCircle size={20} color={'green'} /></td>
                      <td className="p-3 dark:text-gray-400">Outgoing token address</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-green-600 dark:text-green-400">amount</td>
                      <td className="p-3 dark:text-gray-400">number</td>
                      <td className="p-3 dark:text-gray-400"><CheckCircle size={20} color={'green'} /></td>
                      <td className="p-3 dark:text-gray-400">Number of incoming tokens</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-green-600 dark:text-green-400">slippage</td>
                      <td className="p-3 dark:text-gray-400">number</td>
                      <td className="p-3 dark:text-gray-400"><X size={20} color={'red'} /></td>
                      <td className="p-3 dark:text-gray-400">Slippage in percent (default: 0.5)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold mb-2 dark:text-gray-200">Example request</h4>
              <CodeBlock id="swap-request" language="bash">
                {`curl -X POST "${Project_Domain}/api/swap/raydium" \\
  -H "Content-Type: application/json" \\
  -H "x-wallet-address: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" \\
  -d '{
    "fromMint": "So11111111111111111111111111111111111111112",
    "toMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 1000000,
    "slippage": 0.5
  }'`}
              </CodeBlock>

              <h4 className="font-semibold mb-2 mt-4 dark:text-gray-200">Sample answer</h4>
              <CodeBlock id="swap-response" language="json">
                {`{
  "success": true,
  "data": {
    "serializedTransaction": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDAr...",
    "estimatedOutput": "1000145",
    "priceImpact": 0.12,
    "fees": {
      "networkFee": 5000,
      "platformFee": 0
    },
    "route": {
      "from": "So11111111111111111111111111111111111111112",
      "to": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "amount": "1000000",
      "amm": "Raydium"
    }
  },
  "meta": {
    "provider": "${Project_Name}",
    "version": "1.0.0",
    "timestamp": "2025-06-28T10:30:00.000Z",
    "amm": "Raydium"
  }
}`}
              </CodeBlock>
            </div>
          </section>

          {/* Error Handling */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Error Handling</h2>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200/50 dark:bg-gray-800/70 dark:border-gray-700/50">
              <p className="text-gray-600 mb-4 dark:text-gray-400">
                All errors are returned in the following format:
              </p>

              <CodeBlock id="error-format" language="json">
                {`{
  "success": false,
  "error": "Human readable error message",
  "errorCode": "ERROR_CODE"
}`}
              </CodeBlock>

              <h4 className="font-semibold mb-3 mt-6 dark:text-gray-200">Error codes</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50/50 p-4 rounded-lg dark:bg-red-900/20">
                  <h5 className="font-semibold text-red-800 mb-2 dark:text-red-300">Client errors</h5>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
                    <li><code>RATE_LIMIT</code> - Request limit exceeded</li>
                    <li><code>MISSING_WALLET</code> - Wallet address not specified</li>
                    <li><code>INVALID_PARAMS</code> - Incorrect parameters</li>
                  </ul>
                </div>
                <div className="bg-orange-50/50 p-4 rounded-lg dark:bg-orange-900/20">
                  <h5 className="font-semibold text-orange-800 mb-2 dark:text-orange-300">Server errors</h5>
                  <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-400">
                    <li><code>QUOTE_ERROR</code> - Error getting quote</li>
                    <li><code>SWAP_ERROR</code> - Error preparing swap</li>
                    <li><code>INTERNAL_ERROR</code> - Internal Server Error</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Token Addresses */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Popular tokens</h2>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200/50 dark:bg-gray-800/70 dark:border-gray-700/50">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg dark:bg-yellow-900/20">
                  <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-300">Native SOL</h3>
                  <code className="bg-white/70 px-2 py-1 rounded text-xs block break-all dark:bg-gray-700 dark:text-gray-200">
                    So11111111111111111111111111111111111111112
                  </code>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg dark:bg-blue-900/20">
                  <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">USDC</h3>
                  <code className="bg-white/70 px-2 py-1 rounded text-xs block break-all dark:bg-gray-700 dark:text-gray-200">
                    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
                  </code>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg dark:bg-green-900/20">
                  <h3 className="font-semibold mb-2 text-green-800 dark:text-green-300">USDT</h3>
                  <code className="bg-white/70 px-2 py-1 rounded text-xs block break-all dark:bg-gray-700 dark:text-gray-200">
                    Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
                  </code>
                </div>
              </div>
            </div>
          </section>

          {/* Client Integration */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Client integration</h2>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200/50 dark:bg-gray-800/70 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">JavaScript/TypeScript</h3>

              <CodeBlock id="client-integration" language="javascript">
                {`class ${Project_Name}SwapAPI {
  constructor(baseUrl, walletAddress) {
    this.baseUrl = baseUrl;
    this.walletAddress = walletAddress;
  }

  async getQuote(fromMint, toMint, amount) {
    const params = new URLSearchParams({
      fromMint,
      toMint,
      amount: amount.toString()
    });

    const response = await fetch(\`\${this.baseUrl}/quote/raydium?\${params}\`);
    return await response.json();
  }

  async prepareSwap(fromMint, toMint, amount, slippage = 0.5) {
    const response = await fetch(\`\${this.baseUrl}/swap/raydium\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': this.walletAddress
      },
      body: JSON.stringify({
        fromMint,
        toMint,
        amount,
        slippage
      })
    });

    return await response.json();
  }
}

// Usage
const api = new ${Project_Name}SwapAPI('${Project_Domain}/api', 'YOUR_WALLET');
const quote = await api.getQuote(SOL_MINT, USDC_MINT, 1000000);
const swap = await api.prepareSwap(SOL_MINT, USDC_MINT, 1000000, 0.5);`}
              </CodeBlock>
            </div>
          </section>

          {/* Roadmap */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Road map</h2>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200/50 dark:bg-gray-800/70 dark:border-gray-700/50">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">AMM integration</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-400 flex gap-3">Raydium -  <CheckCircle size={20} color={'green'} /> Ready </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-400 flex gap-3">Jupiter Aggregator - <Construction size={20} color={'orange'} /> In development</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-400 flex gap-3">Meteora - <NotebookPen size={20} color={'darkgray'} /> Planned</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-400 flex gap-3">Pump.fun - <NotebookPen size={20} color={'darkgray'} /> Planned</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-400 flex gap-3">Orca - <NotebookPen size={20} color={'darkgray'} /> Planned</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">Additional features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-400">Transaction history</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-400">Staking integration</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-400">Portfolio tracking</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-400">Webhook notifications</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Support</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm border border-gray-200/50 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700/50">
              <p className="text-gray-600 mb-4 dark:text-gray-400">
                Need help with API integration? We're here to support your development.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Contact support
                </a>
                <a
                  href="#"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Code size={16} className="mr-2" />
                  GitHub
                </a>
                <a
                  href="#"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Documentation
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}