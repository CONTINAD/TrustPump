import { Link } from 'react-router-dom'
import { Lock, Shield, AlertTriangle } from 'lucide-react'
import { formatNumber, formatPrice, formatTimeAgo, getTierColor, getTierIcon } from '../data/tokens'
import './TokenCard.css'

function TokenCard({ token }) {
    return (
        <Link to={`/token/${token.address}`} className="token-card">
            <div className="token-card-header">
                <div className={`dev-tier ${getTierColor(token.devTier)}`}>
                    <span>{getTierIcon(token.devTier)}</span>
                    <span>{token.devTier.charAt(0).toUpperCase() + token.devTier.slice(1)} Dev</span>
                </div>
                <div className="trust-score">
                    <span className="trust-label">Trust</span>
                    <span className={`trust-value ${token.trustScore >= 80 ? 'high' : token.trustScore >= 50 ? 'medium' : 'low'}`}>
                        {token.trustScore}
                    </span>
                </div>
            </div>

            <div className="token-main">
                <div className="token-icon">{token.image}</div>
                <div className="token-info">
                    <h3 className="token-name">${token.symbol}</h3>
                    <p className="token-fullname">{token.name}</p>
                </div>
            </div>

            <div className="token-stats">
                <div className="token-stat">
                    <span className="stat-label">Market Cap</span>
                    <span className="stat-value">${formatNumber(token.marketCap)}</span>
                </div>
                <div className="token-stat">
                    <span className="stat-label">24h</span>
                    <span className={`stat-value ${token.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                        {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
                    </span>
                </div>
                <div className="token-stat">
                    <span className="stat-label">Holders</span>
                    <span className="stat-value">{token.holders}</span>
                </div>
            </div>

            <div className="bonding-curve">
                <div className="bonding-header">
                    <span>Bonding Curve</span>
                    <span>{token.bondingProgress}%</span>
                </div>
                <div className="bonding-bar">
                    <div
                        className="bonding-fill"
                        style={{ width: `${token.bondingProgress}%` }}
                    ></div>
                </div>
            </div>

            <div className="token-badges">
                {token.lpLocked && (
                    <span className="safety-badge">
                        <Lock size={12} />
                        LP Locked
                    </span>
                )}
                {token.kycVerified && (
                    <span className="safety-badge">
                        <Shield size={12} />
                        KYC Dev
                    </span>
                )}
                {token.bundleSafe && (
                    <span className="safety-badge safe">
                        <AlertTriangle size={12} />
                        Bundle Safe
                    </span>
                )}
            </div>

            <div className="token-footer">
                <span className="created-at">{formatTimeAgo(token.createdAt)}</span>
                {token.graduated && <span className="graduated-badge">🎓 Graduated</span>}
            </div>
        </Link>
    )
}

export default TokenCard
