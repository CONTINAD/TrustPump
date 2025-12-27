import { useState, useMemo } from 'react'
import { Search, Filter, TrendingUp, Clock, Shield } from 'lucide-react'
import { mockTokens } from '../data/tokens'
import TokenCard from '../components/TokenCard'
import './Explore.css'

function Explore() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [sort, setSort] = useState('trending')

    const filteredTokens = useMemo(() => {
        let tokens = [...mockTokens]

        // Search
        if (search) {
            const s = search.toLowerCase()
            tokens = tokens.filter(t =>
                t.name.toLowerCase().includes(s) ||
                t.symbol.toLowerCase().includes(s)
            )
        }

        // Filter
        if (filter === 'verified') {
            tokens = tokens.filter(t => t.kycVerified)
        } else if (filter === 'diamond') {
            tokens = tokens.filter(t => t.devTier === 'diamond')
        } else if (filter === 'graduated') {
            tokens = tokens.filter(t => t.graduated)
        }

        // Sort
        if (sort === 'trending') {
            tokens.sort((a, b) => b.volume24h - a.volume24h)
        } else if (sort === 'newest') {
            tokens.sort((a, b) => b.createdAt - a.createdAt)
        } else if (sort === 'marketcap') {
            tokens.sort((a, b) => b.marketCap - a.marketCap)
        } else if (sort === 'trustscore') {
            tokens.sort((a, b) => b.trustScore - a.trustScore)
        }

        return tokens
    }, [search, filter, sort])

    return (
        <div className="explore-page">
            <div className="container">
                <div className="page-header">
                    <h1>Explore Tokens</h1>
                    <p>Discover verified tokens with anti-rug protection</p>
                </div>

                <div className="explore-controls">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search tokens..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
                            onClick={() => setFilter('verified')}
                        >
                            <Shield size={16} />
                            KYC Verified
                        </button>
                        <button
                            className={`filter-btn ${filter === 'diamond' ? 'active' : ''}`}
                            onClick={() => setFilter('diamond')}
                        >
                            💎 Diamond Devs
                        </button>
                        <button
                            className={`filter-btn ${filter === 'graduated' ? 'active' : ''}`}
                            onClick={() => setFilter('graduated')}
                        >
                            🎓 Graduated
                        </button>
                    </div>

                    <div className="sort-dropdown">
                        <Filter size={16} />
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="trending">Trending</option>
                            <option value="newest">Newest</option>
                            <option value="marketcap">Market Cap</option>
                            <option value="trustscore">Trust Score</option>
                        </select>
                    </div>
                </div>

                <div className="results-count">
                    {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} found
                </div>

                <div className="tokens-grid">
                    {filteredTokens.map(token => (
                        <TokenCard key={token.address} token={token} />
                    ))}
                </div>

                {filteredTokens.length === 0 && (
                    <div className="no-results">
                        <p>No tokens found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Explore
