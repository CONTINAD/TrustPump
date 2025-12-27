import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
    ArrowLeft, ExternalLink, Shield, Lock, AlertTriangle,
    TrendingUp, TrendingDown, Users, Clock, Copy, Check,
    Twitter, Send, Globe
} from 'lucide-react'
import { mockTokens, formatNumber, formatPrice, formatTimeAgo, getTierColor, getTierIcon } from '../data/tokens'
import './Token.css'

function Token() {
    const { address } = useParams()
    const [searchParams] = useSearchParams()
    const isNew = searchParams.get('new') === 'true'
    const { connected, publicKey } = useWallet()

    const [isBuying, setIsBuying] = useState(true)
    const [amount, setAmount] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [copied, setCopied] = useState(false)
    const [transactions, setTransactions] = useState([])

    // Find token or create mock for new tokens
    const token = useMemo(() => {
        const found = mockTokens.find(t => t.address === address)
        if (found) return found

        // Return a mock for new tokens
        return {
            address,
            name: 'New Token',
            symbol: 'NEW',
            description: 'A freshly launched token on TrustPump',
            image: '🆕',
            creator: publicKey?.toBase58().slice(0, 8) + '...' || 'Anonymous',
            devTier: 'bronze',
            trustScore: 50,
            marketCap: 0,
            price: 0.000001,
            priceChange24h: 0,
            volume24h: 0,
            holders: 1,
            devVested: true,
            vestingHours: 24,
            lpLocked: true,
            kycVerified: false,
            bundleSafe: true,
            createdAt: Date.now(),
            graduated: false,
            bondingProgress: 0,
        }
    }, [address, publicKey])

    // Generate mock transactions
    useEffect(() => {
        const mockTxs = [
            { type: 'buy', amount: 0.5, tokens: 50000, wallet: 'Abc...xyz', time: Date.now() - 60000 },
            { type: 'sell', amount: 0.2, tokens: 18000, wallet: 'Def...uvw', time: Date.now() - 180000 },
            { type: 'buy', amount: 1.2, tokens: 105000, wallet: 'Ghi...rst', time: Date.now() - 300000 },
            { type: 'buy', amount: 0.8, tokens: 72000, wallet: 'Jkl...opq', time: Date.now() - 420000 },
            { type: 'sell', amount: 0.3, tokens: 25000, wallet: 'Mno...lmn', time: Date.now() - 600000 },
        ]
        setTransactions(mockTxs)
    }, [])

    const handleCopy = () => {
        navigator.clipboard.writeText(token.address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleTrade = async () => {
        if (!connected || !amount) return

        setIsProcessing(true)

        // Simulate transaction
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Add to transactions
        const newTx = {
            type: isBuying ? 'buy' : 'sell',
            amount: parseFloat(amount),
            tokens: parseFloat(amount) * 100000,
            wallet: publicKey?.toBase58().slice(0, 3) + '...' + publicKey?.toBase58().slice(-3),
            time: Date.now(),
        }
        setTransactions(prev => [newTx, ...prev])

        setAmount('')
        setIsProcessing(false)
    }

    // Calculate estimated output
    const estimatedOutput = useMemo(() => {
        if (!amount) return 0
        const amountNum = parseFloat(amount)
        if (isBuying) {
            return amountNum * 100000 // Mock: 100k tokens per SOL
        } else {
            return amountNum * token.price
        }
    }, [amount, isBuying, token.price])

    return (
        <div className="token-page">
            <div className="container">
                <Link to="/explore" className="back-link">
                    <ArrowLeft size={20} />
                    Back to Explore
                </Link>

                {isNew && (
                    <div className="new-token-banner">
                        🎉 Congratulations! Your token has been launched!
                    </div>
                )}

                <div className="token-layout">
                    {/* Left Column - Token Info */}
                    <div className="token-info-column">
                        <div className="token-header-card card">
                            <div className="token-main-header">
                                <div className="token-icon-large">{token.image}</div>
                                <div>
                                    <h1>${token.symbol}</h1>
                                    <p className="token-fullname">{token.name}</p>
                                </div>
                            </div>

                            <div className="token-address" onClick={handleCopy}>
                                <span>{token.address.slice(0, 8)}...{token.address.slice(-8)}</span>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </div>

                            <div className="token-quick-stats">
                                <div className="quick-stat">
                                    <span className="label">Price</span>
                                    <span className="value">${formatPrice(token.price)}</span>
                                </div>
                                <div className="quick-stat">
                                    <span className="label">Market Cap</span>
                                    <span className="value">${formatNumber(token.marketCap)}</span>
                                </div>
                                <div className="quick-stat">
                                    <span className="label">24h Change</span>
                                    <span className={`value ${token.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                                        {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <p className="token-description">{token.description}</p>

                            <div className="social-links">
                                <a href="#" className="social-btn"><Twitter size={18} /></a>
                                <a href="#" className="social-btn"><Send size={18} /></a>
                                <a href="#" className="social-btn"><Globe size={18} /></a>
                            </div>
                        </div>

                        {/* Trust Metrics */}
                        <div className="trust-metrics card">
                            <h3>Trust Metrics</h3>

                            <div className="trust-score-display">
                                <div className="score-circle">
                                    <span className="score-value">{token.trustScore}</span>
                                    <span className="score-label">Trust Score</span>
                                </div>
                                <div className={`dev-tier-badge ${getTierColor(token.devTier)}`}>
                                    <span>{getTierIcon(token.devTier)}</span>
                                    <span>{token.devTier.charAt(0).toUpperCase() + token.devTier.slice(1)} Developer</span>
                                </div>
                            </div>

                            <div className="trust-checks">
                                <div className={`trust-check ${token.lpLocked ? 'passed' : 'failed'}`}>
                                    <Lock size={18} />
                                    <span>Liquidity Locked</span>
                                    {token.lpLocked ? <Check size={16} /> : <AlertTriangle size={16} />}
                                </div>
                                <div className={`trust-check ${token.devVested ? 'passed' : 'failed'}`}>
                                    <Clock size={18} />
                                    <span>Dev Tokens Vested ({token.vestingHours}h)</span>
                                    {token.devVested ? <Check size={16} /> : <AlertTriangle size={16} />}
                                </div>
                                <div className={`trust-check ${token.kycVerified ? 'passed' : 'warning'}`}>
                                    <Shield size={18} />
                                    <span>KYC Verified</span>
                                    {token.kycVerified ? <Check size={16} /> : <span className="optional">Optional</span>}
                                </div>
                                <div className={`trust-check ${token.bundleSafe ? 'passed' : 'failed'}`}>
                                    <AlertTriangle size={18} />
                                    <span>Bundle Safe</span>
                                    {token.bundleSafe ? <Check size={16} /> : <AlertTriangle size={16} />}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="token-stats-card card">
                            <h3>Statistics</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <Users size={18} />
                                    <div>
                                        <span className="stat-value">{token.holders}</span>
                                        <span className="stat-label">Holders</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <TrendingUp size={18} />
                                    <div>
                                        <span className="stat-value">${formatNumber(token.volume24h)}</span>
                                        <span className="stat-label">24h Volume</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <Clock size={18} />
                                    <div>
                                        <span className="stat-value">{formatTimeAgo(token.createdAt)}</span>
                                        <span className="stat-label">Created</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Trading */}
                    <div className="trading-column">
                        {/* Bonding Curve Chart */}
                        <div className="chart-card card">
                            <div className="chart-header">
                                <h3>Bonding Curve</h3>
                                <div className="graduation-status">
                                    {token.graduated ? (
                                        <span className="graduated">🎓 Graduated to Raydium</span>
                                    ) : (
                                        <span className="progress">{token.bondingProgress}% to graduation</span>
                                    )}
                                </div>
                            </div>

                            <div className="bonding-chart">
                                <svg viewBox="0 0 300 150" className="curve-svg">
                                    {/* Background curve */}
                                    <path
                                        d="M0,140 Q75,120 150,80 T300,10"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="2"
                                    />
                                    {/* Filled curve */}
                                    <path
                                        d={`M0,140 Q${75 * token.bondingProgress / 100},${120 - (40 * token.bondingProgress / 100)} ${150 * token.bondingProgress / 100},${80 - (30 * token.bondingProgress / 100)}`}
                                        fill="none"
                                        stroke="url(#curveGradient)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    {/* Current position dot */}
                                    <circle
                                        cx={150 * token.bondingProgress / 100}
                                        cy={80 - (30 * token.bondingProgress / 100)}
                                        r="6"
                                        fill="#10b981"
                                    />
                                    <defs>
                                        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#34d399" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            <div className="graduation-bar">
                                <div className="bar-fill" style={{ width: `${token.bondingProgress}%` }}></div>
                            </div>
                            <div className="graduation-labels">
                                <span>$0</span>
                                <span className="target">$69K (Graduation)</span>
                            </div>
                        </div>

                        {/* Trade Interface */}
                        <div className="trade-card card">
                            <div className="trade-tabs">
                                <button
                                    className={`trade-tab ${isBuying ? 'active buy' : ''}`}
                                    onClick={() => setIsBuying(true)}
                                >
                                    Buy
                                </button>
                                <button
                                    className={`trade-tab ${!isBuying ? 'active sell' : ''}`}
                                    onClick={() => setIsBuying(false)}
                                >
                                    Sell
                                </button>
                            </div>

                            {connected ? (
                                <div className="trade-form">
                                    <div className="trade-input">
                                        <input
                                            type="number"
                                            placeholder="0.0"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                        <span className="currency">{isBuying ? 'SOL' : token.symbol}</span>
                                    </div>

                                    <div className="quick-amounts">
                                        <button onClick={() => setAmount('0.1')}>0.1</button>
                                        <button onClick={() => setAmount('0.5')}>0.5</button>
                                        <button onClick={() => setAmount('1')}>1</button>
                                        <button onClick={() => setAmount('5')}>5</button>
                                    </div>

                                    <div className="trade-estimate">
                                        <span>You'll receive</span>
                                        <span className="estimate-value">
                                            ~{formatNumber(estimatedOutput)} {isBuying ? token.symbol : 'SOL'}
                                        </span>
                                    </div>

                                    <button
                                        className={`btn btn-lg ${isBuying ? 'btn-primary' : 'btn-danger'}`}
                                        onClick={handleTrade}
                                        disabled={!amount || isProcessing}
                                        style={{ width: '100%' }}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="spinner"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            isBuying ? 'Buy Tokens' : 'Sell Tokens'
                                        )}
                                    </button>

                                    <p className="trade-fee">
                                        2% fee goes to developer • LP is locked
                                    </p>
                                </div>
                            ) : (
                                <div className="connect-to-trade">
                                    <p>Connect wallet to trade</p>
                                    <WalletMultiButton />
                                </div>
                            )}
                        </div>

                        {/* Recent Transactions */}
                        <div className="transactions-card card">
                            <h3>Recent Trades</h3>
                            <div className="tx-list">
                                {transactions.map((tx, i) => (
                                    <div key={i} className={`tx-item ${tx.type}`}>
                                        <div className="tx-type">
                                            {tx.type === 'buy' ? (
                                                <TrendingUp size={16} />
                                            ) : (
                                                <TrendingDown size={16} />
                                            )}
                                            <span>{tx.type.toUpperCase()}</span>
                                        </div>
                                        <div className="tx-amount">{tx.amount} SOL</div>
                                        <div className="tx-tokens">{formatNumber(tx.tokens)} {token.symbol}</div>
                                        <div className="tx-wallet">{tx.wallet}</div>
                                        <div className="tx-time">{formatTimeAgo(tx.time)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Token
