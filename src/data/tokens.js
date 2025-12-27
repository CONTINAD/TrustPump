// Mock token data for demonstration
export const mockTokens = [
    {
        address: 'TRUST1111111111111111111111111111111111111',
        name: 'TrustCoin',
        symbol: 'TRUST',
        description: 'The official token of TrustPump launchpad',
        image: '🛡️',
        creator: 'DiamondDev.sol',
        devTier: 'diamond',
        trustScore: 98,
        marketCap: 125000,
        price: 0.000125,
        priceChange24h: 45.2,
        volume24h: 89000,
        holders: 456,
        devVested: true,
        vestingHours: 48,
        lpLocked: true,
        kycVerified: true,
        bundleSafe: true,
        createdAt: Date.now() - 3600000 * 2,
        graduated: false,
        bondingProgress: 72,
    },
    {
        address: 'MOON2222222222222222222222222222222222222',
        name: 'MoonShot',
        symbol: 'MOON',
        description: 'To the moon and beyond 🚀',
        image: '🌙',
        creator: 'GoldDev.sol',
        devTier: 'gold',
        trustScore: 85,
        marketCap: 89000,
        price: 0.000089,
        priceChange24h: 28.5,
        volume24h: 45000,
        holders: 234,
        devVested: true,
        vestingHours: 24,
        lpLocked: true,
        kycVerified: true,
        bundleSafe: true,
        createdAt: Date.now() - 3600000 * 5,
        graduated: false,
        bondingProgress: 58,
    },
    {
        address: 'DOGE3333333333333333333333333333333333333',
        name: 'SuperDoge',
        symbol: 'SDOGE',
        description: 'Much wow, very trust',
        image: '🐕',
        creator: 'SilverDev.sol',
        devTier: 'silver',
        trustScore: 72,
        marketCap: 45000,
        price: 0.000045,
        priceChange24h: -12.3,
        volume24h: 23000,
        holders: 156,
        devVested: true,
        vestingHours: 12,
        lpLocked: true,
        kycVerified: false,
        bundleSafe: true,
        createdAt: Date.now() - 3600000 * 8,
        graduated: false,
        bondingProgress: 35,
    },
    {
        address: 'PEPE4444444444444444444444444444444444444',
        name: 'TrustPepe',
        symbol: 'TPEPE',
        description: 'The safest Pepe on Solana',
        image: '🐸',
        creator: 'BronzeDev.sol',
        devTier: 'bronze',
        trustScore: 55,
        marketCap: 28000,
        price: 0.000028,
        priceChange24h: 8.7,
        volume24h: 12000,
        holders: 89,
        devVested: true,
        vestingHours: 6,
        lpLocked: true,
        kycVerified: false,
        bundleSafe: false,
        createdAt: Date.now() - 3600000 * 1,
        graduated: false,
        bondingProgress: 22,
    },
    {
        address: 'SAFE5555555555555555555555555555555555555',
        name: 'SafeMoon2',
        symbol: 'SAFE2',
        description: 'Safety first, moon second',
        image: '🔒',
        creator: 'DiamondDev2.sol',
        devTier: 'diamond',
        trustScore: 95,
        marketCap: 156000,
        price: 0.000156,
        priceChange24h: 67.8,
        volume24h: 134000,
        holders: 678,
        devVested: true,
        vestingHours: 72,
        lpLocked: true,
        kycVerified: true,
        bundleSafe: true,
        createdAt: Date.now() - 3600000 * 12,
        graduated: true,
        bondingProgress: 100,
    },
    {
        address: 'CAT66666666666666666666666666666666666666',
        name: 'TrustCat',
        symbol: 'TCAT',
        description: 'Meow to the moon',
        image: '🐱',
        creator: 'GoldDev2.sol',
        devTier: 'gold',
        trustScore: 82,
        marketCap: 67000,
        price: 0.000067,
        priceChange24h: 15.4,
        volume24h: 34000,
        holders: 198,
        devVested: true,
        vestingHours: 24,
        lpLocked: true,
        kycVerified: true,
        bundleSafe: true,
        createdAt: Date.now() - 3600000 * 4,
        graduated: false,
        bondingProgress: 48,
    },
]

// Generate bonding curve data
export function generateBondingCurve(progress) {
    const points = []
    const totalPoints = 50

    for (let i = 0; i <= totalPoints; i++) {
        const x = i / totalPoints
        // Exponential bonding curve
        const y = Math.pow(x, 1.5) * 100
        points.push({ x: i, y })
    }

    return points
}

// Format numbers
export function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toFixed(2)
}

export function formatPrice(price) {
    if (price < 0.0001) {
        return price.toExponential(2)
    }
    return price.toFixed(6)
}

export function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}

export function getTierColor(tier) {
    switch (tier) {
        case 'diamond': return 'badge-diamond'
        case 'gold': return 'badge-gold'
        case 'silver': return 'badge-silver'
        case 'bronze': return 'badge-bronze'
        default: return 'badge-trust'
    }
}

export function getTierIcon(tier) {
    switch (tier) {
        case 'diamond': return '💎'
        case 'gold': return '🥇'
        case 'silver': return '🥈'
        case 'bronze': return '🥉'
        default: return '👤'
    }
}
