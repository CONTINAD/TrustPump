import { Link, useLocation } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { Shield, Rocket, Compass } from 'lucide-react'
import './Navbar.css'

function Navbar() {
    const location = useLocation()
    const { connected } = useWallet()

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo">
                    <span className="logo-icon">🛡️</span>
                    <span className="logo-text">TrustPump</span>
                </Link>

                <div className="nav-links">
                    <Link
                        to="/explore"
                        className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}
                    >
                        <Compass size={18} />
                        Explore
                    </Link>
                    <Link
                        to="/create"
                        className={`nav-link ${location.pathname === '/create' ? 'active' : ''}`}
                    >
                        <Rocket size={18} />
                        Create
                    </Link>
                </div>

                <div className="nav-actions">
                    {connected && (
                        <Link to="/create" className="btn btn-primary btn-sm">
                            <Rocket size={16} />
                            Launch Token
                        </Link>
                    )}
                    <WalletMultiButton />
                </div>
            </div>
        </nav>
    )
}

export default Navbar
