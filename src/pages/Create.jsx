import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Rocket, Shield, Lock, AlertTriangle, Clock, Upload, Info } from 'lucide-react'
import './Create.css'

function Create() {
    const { connected, publicKey } = useWallet()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        description: '',
        image: '',
        twitter: '',
        telegram: '',
        website: '',
        vestingHours: 24,
        kycVerified: false,
    })

    const [isCreating, setIsCreating] = useState(false)
    const [step, setStep] = useState(1)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleCreate = async () => {
        if (!connected) return

        setIsCreating(true)

        // Simulate token creation
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Generate mock address
        const mockAddress = 'NEW' + Date.now().toString().slice(-40).padStart(40, '1')

        setIsCreating(false)
        navigate(`/token/${mockAddress}?new=true`)
    }

    const isFormValid = formData.name && formData.symbol && formData.description

    if (!connected) {
        return (
            <div className="create-page">
                <div className="container">
                    <div className="connect-prompt">
                        <div className="prompt-icon">🔐</div>
                        <h2>Connect Your Wallet</h2>
                        <p>Connect your Solana wallet to launch a token on TrustPump</p>
                        <WalletMultiButton />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="create-page">
            <div className="container">
                <div className="page-header">
                    <h1>Launch Your Token</h1>
                    <p>Create a verified, anti-rug token in minutes</p>
                </div>

                <div className="create-layout">
                    <div className="create-form">
                        {/* Step 1: Basic Info */}
                        <div className={`form-section ${step === 1 ? 'active' : ''}`}>
                            <div className="section-header-form">
                                <span className="step-badge">1</span>
                                <h3>Token Details</h3>
                            </div>

                            <div className="input-group">
                                <label>Token Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. TrustCoin"
                                    value={formData.name}
                                    onChange={handleChange}
                                    maxLength={32}
                                />
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Symbol *</label>
                                    <input
                                        type="text"
                                        name="symbol"
                                        placeholder="e.g. TRUST"
                                        value={formData.symbol}
                                        onChange={handleChange}
                                        maxLength={10}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Image Emoji</label>
                                    <input
                                        type="text"
                                        name="image"
                                        placeholder="e.g. 🚀"
                                        value={formData.image}
                                        onChange={handleChange}
                                        maxLength={4}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    placeholder="Describe your token..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    maxLength={500}
                                />
                                <span className="char-count">{formData.description.length}/500</span>
                            </div>
                        </div>

                        {/* Step 2: Social Links */}
                        <div className={`form-section ${step === 2 ? 'active' : ''}`}>
                            <div className="section-header-form">
                                <span className="step-badge">2</span>
                                <h3>Social Links (Optional)</h3>
                            </div>

                            <div className="input-group">
                                <label>Twitter/X</label>
                                <input
                                    type="text"
                                    name="twitter"
                                    placeholder="https://twitter.com/..."
                                    value={formData.twitter}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <label>Telegram</label>
                                <input
                                    type="text"
                                    name="telegram"
                                    placeholder="https://t.me/..."
                                    value={formData.telegram}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <label>Website</label>
                                <input
                                    type="text"
                                    name="website"
                                    placeholder="https://..."
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Step 3: Trust Settings */}
                        <div className={`form-section ${step === 3 ? 'active' : ''}`}>
                            <div className="section-header-form">
                                <span className="step-badge">3</span>
                                <h3>Trust Settings</h3>
                            </div>

                            <div className="input-group">
                                <label>Dev Token Vesting Period</label>
                                <select
                                    name="vestingHours"
                                    value={formData.vestingHours}
                                    onChange={handleChange}
                                >
                                    <option value={6}>6 hours (Bronze tier)</option>
                                    <option value={12}>12 hours (Silver tier)</option>
                                    <option value={24}>24 hours (Gold tier)</option>
                                    <option value={48}>48 hours (Diamond tier)</option>
                                    <option value={72}>72 hours (Diamond+ tier)</option>
                                </select>
                                <span className="input-hint">
                                    <Clock size={14} />
                                    Longer vesting = higher trust score
                                </span>
                            </div>

                            <div className="trust-option">
                                <div className="option-info">
                                    <Shield size={20} />
                                    <div>
                                        <h4>KYC Verification</h4>
                                        <p>Verify your identity. Revealed only if you rug.</p>
                                    </div>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        name="kycVerified"
                                        checked={formData.kycVerified}
                                        onChange={handleChange}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="form-navigation">
                            {step > 1 && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setStep(step - 1)}
                                >
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 && !isFormValid}
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleCreate}
                                    disabled={!isFormValid || isCreating}
                                >
                                    {isCreating ? (
                                        <>
                                            <div className="spinner"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket size={20} />
                                            Launch Token (~0.02 SOL)
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="create-preview">
                        <div className="preview-card">
                            <div className="preview-header">
                                <span>Preview</span>
                            </div>
                            <div className="preview-content">
                                <div className="preview-icon">
                                    {formData.image || '🪙'}
                                </div>
                                <h3>${formData.symbol || 'TOKEN'}</h3>
                                <p className="preview-name">{formData.name || 'Token Name'}</p>
                                <p className="preview-desc">
                                    {formData.description || 'Your token description will appear here...'}
                                </p>

                                <div className="preview-badges">
                                    <span className="badge badge-trust">
                                        <Lock size={12} />
                                        LP Locked
                                    </span>
                                    <span className="badge badge-trust">
                                        <Clock size={12} />
                                        {formData.vestingHours}h Vesting
                                    </span>
                                    {formData.kycVerified && (
                                        <span className="badge badge-diamond">
                                            <Shield size={12} />
                                            KYC Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <Info size={20} />
                            <div>
                                <h4>What happens when you launch?</h4>
                                <ul>
                                    <li>Token is created with 1B supply</li>
                                    <li>800M tokens go into bonding curve</li>
                                    <li>You receive 2% of all trading fees</li>
                                    <li>At $69K market cap, token graduates to Raydium</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Create
