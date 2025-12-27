import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { Rocket, Upload, X, Info, ExternalLink } from 'lucide-react'
import './Create.css'

function Create() {
    const { connected, publicKey, signTransaction } = useWallet()
    const { connection } = useConnection()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        description: '', // Optional
        twitter: '',
        telegram: '',
        website: '',
    })

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [devBuyAmount, setDevBuyAmount] = useState(0) // SOL amount for dev buy
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState('')
    const [txSignature, setTxSignature] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image must be less than 5MB')
                return
            }
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
            setError('')
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleCreate = async () => {
        if (!connected || !publicKey) {
            setError('Please connect your wallet')
            return
        }

        if (!formData.name || !formData.symbol) {
            setError('Name and symbol are required')
            return
        }

        if (!imageFile) {
            setError('Please upload an image for your token')
            return
        }

        setIsCreating(true)
        setError('')
        setTxSignature('')

        try {
            // Step 1: Generate a random keypair for the token mint
            const mintKeypair = Keypair.generate()

            // Step 2: Upload metadata to IPFS via pump.fun
            const metadataFormData = new FormData()
            metadataFormData.append('file', imageFile)
            metadataFormData.append('name', formData.name)
            metadataFormData.append('symbol', formData.symbol.toUpperCase())
            metadataFormData.append('description', formData.description || `${formData.name} - Created on TrustPump`)
            metadataFormData.append('showName', 'true')

            if (formData.twitter) metadataFormData.append('twitter', formData.twitter)
            if (formData.telegram) metadataFormData.append('telegram', formData.telegram)
            if (formData.website) metadataFormData.append('website', formData.website)

            console.log('Uploading metadata to IPFS...')

            const metadataResponse = await fetch('https://pump.fun/api/ipfs', {
                method: 'POST',
                body: metadataFormData,
            })

            if (!metadataResponse.ok) {
                throw new Error('Failed to upload metadata to IPFS')
            }

            const metadataResult = await metadataResponse.json()
            console.log('Metadata uploaded:', metadataResult)

            // Step 3: Create the token via PumpPortal API
            // Note: For production, you need a PumpPortal API key
            // For now, we'll redirect to pump.fun with the metadata

            // Open pump.fun with pre-filled data
            const pumpUrl = `https://pump.fun/create`

            // Store the token info in localStorage for reference
            const tokenInfo = {
                name: formData.name,
                symbol: formData.symbol.toUpperCase(),
                description: formData.description,
                metadataUri: metadataResult.metadataUri,
                mintAddress: mintKeypair.publicKey.toBase58(),
                createdAt: Date.now(),
                creator: publicKey.toBase58(),
            }

            localStorage.setItem('lastCreatedToken', JSON.stringify(tokenInfo))

            // For a full integration, you would need a backend with PumpPortal API key
            // For now, show success with the IPFS metadata
            setTxSignature(metadataResult.metadataUri)

            // Optional: Open pump.fun in new tab
            window.open(pumpUrl, '_blank')

        } catch (err) {
            console.error('Token creation error:', err)
            setError(err.message || 'Failed to create token')
        } finally {
            setIsCreating(false)
        }
    }

    const isFormValid = formData.name && formData.symbol && imageFile

    if (!connected) {
        return (
            <div className="create-page">
                <div className="container">
                    <div className="connect-prompt">
                        <div className="prompt-icon">🔐</div>
                        <h2>Connect Your Wallet</h2>
                        <p>Connect your Solana wallet to launch a token</p>
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
                    <p>Create a token on pump.fun with TrustPump features</p>
                </div>

                <div className="create-layout">
                    <div className="create-form">
                        {/* Image Upload - REQUIRED */}
                        <div className="form-section">
                            <h3>Token Image *</h3>
                            <div className="image-upload-area">
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Token preview" />
                                        <button className="remove-image" onClick={removeImage}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="upload-placeholder"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={40} />
                                        <p>Click to upload image</p>
                                        <span>PNG, JPG, GIF (max 5MB)</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="form-section">
                            <h3>Token Details</h3>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. TrustCoin"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={32}
                                    />
                                </div>
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
                            </div>

                            <div className="input-group">
                                <label>Description <span className="optional">(optional)</span></label>
                                <textarea
                                    name="description"
                                    placeholder="Describe your token..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    maxLength={500}
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Social Links - Optional */}
                        <div className="form-section">
                            <h3>Social Links <span className="optional">(optional)</span></h3>

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

                        {/* Dev Buy Amount */}
                        <div className="form-section">
                            <h3>Initial Buy <span className="optional">(optional)</span></h3>
                            <div className="input-group">
                                <label>Dev Buy Amount (SOL)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="0"
                                    value={devBuyAmount}
                                    onChange={(e) => setDevBuyAmount(parseFloat(e.target.value) || 0)}
                                />
                                <span className="input-hint">Amount of SOL to buy your own token at launch</span>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {/* Success Display */}
                        {txSignature && (
                            <div className="success-message">
                                <p>✅ Metadata uploaded successfully!</p>
                                <a href={txSignature} target="_blank" rel="noopener noreferrer">
                                    View on IPFS <ExternalLink size={14} />
                                </a>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            className="btn btn-primary btn-lg submit-btn"
                            onClick={handleCreate}
                            disabled={!isFormValid || isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <div className="spinner"></div>
                                    Creating Token...
                                </>
                            ) : (
                                <>
                                    <Rocket size={20} />
                                    Create Token on Pump.fun
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="create-preview">
                        <div className="preview-card">
                            <div className="preview-header">
                                <span>Preview</span>
                            </div>
                            <div className="preview-content">
                                <div className="preview-icon">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Token" />
                                    ) : (
                                        <span className="placeholder-icon">🪙</span>
                                    )}
                                </div>
                                <h3>${formData.symbol?.toUpperCase() || 'TOKEN'}</h3>
                                <p className="preview-name">{formData.name || 'Token Name'}</p>
                                <p className="preview-desc">
                                    {formData.description || 'Your token description...'}
                                </p>
                            </div>
                        </div>

                        <div className="info-card">
                            <Info size={20} />
                            <div>
                                <h4>How it works</h4>
                                <ul>
                                    <li>Upload your image & details</li>
                                    <li>We store metadata on IPFS</li>
                                    <li>Token launches on pump.fun</li>
                                    <li>You earn creator fees on trades</li>
                                </ul>
                            </div>
                        </div>

                        <div className="info-card warning">
                            <Info size={20} />
                            <div>
                                <h4>Requirements</h4>
                                <ul>
                                    <li>~0.02 SOL for creation fee</li>
                                    <li>Name, symbol & image required</li>
                                    <li>Description is optional</li>
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
