import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePumpPortalWebSocket, formatTimeAgo, formatSol, shortenAddress } from '../hooks/usePumpPortal'
import { TrendingUp, Flame, Clock, Users, ExternalLink } from 'lucide-react'
import './LiveTokenFeed.css'

function LiveTokenFeed() {
    const { isConnected, newTokens } = usePumpPortalWebSocket()
    const [displayTokens, setDisplayTokens] = useState([])

    // Update display tokens when new ones arrive
    useEffect(() => {
        if (newTokens.length > 0) {
            setDisplayTokens(prev => {
                // Merge new tokens with existing ones, avoiding duplicates
                const existing = new Set(prev.map(t => t.mint))
                const unique = newTokens.filter(t => !existing.has(t.mint))
                return [...unique, ...prev].slice(0, 50)
            })
        }
    }, [newTokens])

    // Fetch recent tokens on mount
    useEffect(() => {
        fetchRecentTokens()
    }, [])

    const fetchRecentTokens = async () => {
        try {
            // Fetch from pump.fun API for initial tokens
            const response = await fetch('https://frontend-api.pump.fun/coins?offset=0&limit=20&sort=created_timestamp&order=DESC&includeNsfw=false')
            if (response.ok) {
                const data = await response.json()
                const tokens = data.map(coin => ({
                    id: coin.mint,
                    mint: coin.mint,
                    name: coin.name || 'Unknown',
                    symbol: coin.symbol || '???',
                    image: coin.image_uri,
                    creator: coin.creator,
                    marketCapSol: coin.market_cap / 1e9, // Convert lamports
                    timestamp: new Date(coin.created_timestamp).getTime(),
                    isNew: false,
                }))
                setDisplayTokens(tokens)
            }
        } catch (err) {
            console.error('Failed to fetch tokens:', err)
        }
    }

    return (
        <div className="live-feed">
            <div className="feed-header">
                <div className="feed-title">
                    <Flame size={24} className="fire-icon" />
                    <h2>Live Token Feed</h2>
                </div>
                <div className="feed-status">
                    {isConnected ? (
                        <div className="live-indicator">
                            <span className="live-dot"></span>
                            <span>Live</span>
                        </div>
                    ) : (
                        <span className="text-muted">Connecting...</span>
                    )}
                </div>
            </div>

            <div className="token-grid">
                {displayTokens.length === 0 ? (
                    // Skeleton loading
                    [...Array(8)].map((_, i) => (
                        <div key={i} className="token-card-skeleton">
                            <div className="skeleton skeleton-avatar"></div>
                            <div className="skeleton-content">
                                <div className="skeleton skeleton-title"></div>
                                <div className="skeleton skeleton-text"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    displayTokens.map((token, index) => (
                        <Link
                            to={`https://pump.fun/${token.mint}`}
                            target="_blank"
                            key={token.mint}
                            className={`live-token-card ${token.isNew && index < 3 ? 'token-new' : ''} hover-lift`}
                        >
                            <div className="token-image">
                                {token.image ? (
                                    <img src={token.image} alt={token.name} onError={(e) => e.target.style.display = 'none'} />
                                ) : (
                                    <div className="token-placeholder">
                                        {token.symbol?.[0] || '?'}
                                    </div>
                                )}
                            </div>

                            <div className="token-info">
                                <div className="token-header">
                                    <span className="token-symbol">${token.symbol}</span>
                                    {token.isNew && index < 3 && (
                                        <span className="badge badge-hot">🔥 NEW</span>
                                    )}
                                </div>
                                <p className="token-name">{token.name}</p>

                                <div className="token-stats">
                                    <div className="stat">
                                        <TrendingUp size={12} />
                                        <span>{formatSol(token.marketCapSol)} SOL</span>
                                    </div>
                                    <div className="stat">
                                        <Clock size={12} />
                                        <span>{formatTimeAgo(token.timestamp)}</span>
                                    </div>
                                </div>
                            </div>

                            <ExternalLink size={14} className="external-icon" />
                        </Link>
                    ))
                )}
            </div>

            <div className="feed-footer">
                <Link to="/explore" className="btn btn-secondary">
                    View All Tokens
                </Link>
            </div>
        </div>
    )
}

export default LiveTokenFeed
