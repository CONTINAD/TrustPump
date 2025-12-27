import { Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Rocket, Compass, Shield, Lock, AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react'
import LiveTokenFeed from '../components/LiveTokenFeed'
import './Home.css'

function Home() {
    const { connected } = useWallet()

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge animate-float">
                            <span>⚡</span>
                            <span>Built on Solana</span>
                        </div>
                        <h1 className="hero-title">
                            The <span className="gradient-text">Anti-Rug</span> Launchpad
                        </h1>
                        <p className="hero-subtitle">
                            98% of meme coins are scams. We're fixing that.<br />
                            <strong>Verified devs. Locked liquidity. Real protection.</strong>
                        </p>

                        <div className="hero-cta">
                            {connected ? (
                                <>
                                    <Link to="/create" className="btn btn-primary btn-lg glow-md">
                                        <Rocket size={20} />
                                        Launch a Token
                                    </Link>
                                    <Link to="/explore" className="btn btn-outline btn-lg">
                                        <Compass size={20} />
                                        Explore Tokens
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <WalletMultiButton />
                                    <Link to="/explore" className="btn btn-outline btn-lg">
                                        <Compass size={20} />
                                        Explore Tokens
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="hero-trust">
                            <Shield size={16} />
                            <span>No VC. No presale. Fair launch for everyone.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Why <span className="gradient-text">TrustPump</span>?</h2>
                        <p>Every protection we wish existed on other platforms.</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card hover-lift glass">
                            <div className="feature-icon">
                                <Users size={32} />
                            </div>
                            <h3>Verified Developers</h3>
                            <p>Every dev gets a trust tier. Bronze to Diamond. KYC-verified devs have their identity revealed if they rug.</p>
                        </div>
                        <div className="feature-card hover-lift glass">
                            <div className="feature-icon">
                                <Lock size={32} />
                            </div>
                            <h3>Forced Vesting</h3>
                            <p>Devs must lock their tokens. You see exactly when they can sell. No more midnight rugs.</p>
                        </div>
                        <div className="feature-card hover-lift glass">
                            <div className="feature-icon">
                                <AlertTriangle size={32} />
                            </div>
                            <h3>Bundle Detection</h3>
                            <p>AI flags suspicious wallet clusters. See if a dev is faking volume with multiple wallets.</p>
                        </div>
                        <div className="feature-card hover-lift glass">
                            <div className="feature-icon">
                                <TrendingUp size={32} />
                            </div>
                            <h3>2% Creator Fees</h3>
                            <p>Good devs get paid. 4x more than competitors. Build your reputation and earn forever.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Token Feed - Real-time from pump.fun */}
            <section className="featured-section">
                <div className="container">
                    <LiveTokenFeed />
                </div>
            </section>

            {/* How It Works */}
            <section className="how-section">
                <div className="container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                    </div>

                    <div className="steps-grid">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Connect Wallet</h3>
                            <p>Connect your Phantom, Solflare, or any Solana wallet.</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Create Token</h3>
                            <p>Name, symbol, image. Set your vesting period. Pay ~0.02 SOL.</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Start Trading</h3>
                            <p>Bonding curve goes live. Reach $69K MC to graduate.</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step">
                            <div className="step-number">4</div>
                            <h3>Earn Forever</h3>
                            <p>Collect 2% of all trading fees. Build reputation. Launch again.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
