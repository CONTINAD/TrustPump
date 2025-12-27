import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Keypair, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'
import { Rocket, Upload, X, Info, ExternalLink, Check, Loader } from 'lucide-react'
import './Create.css'

function Create() {
    const { connected, publicKey, signTransaction, sendTransaction } = useWallet()
    const { connection } = useConnection()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        description: '',
        twitter: '',
        telegram: '',
        website: '',
    })

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [devBuyAmount, setDevBuyAmount] = useState(0)
    const [isCreating, setIsCreating] = useState(false)
    const [status, setStatus] = useState('')
    const [error, setError] = useState('')
    const [txSignature, setTxSignature] = useState('')
    const [mintAddress, setMintAddress] = useState('')

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
            if (file.size > 5 * 1024 * 1024) {
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
        setStatus('Generating mint keypair...')
        setTxSignature('')
        setMintAddress('')

        try {
            // Step 1: Generate a random keypair for the token mint
            const mintKeypair = Keypair.generate()
            const mintPubkey = mintKeypair.publicKey.toBase58()
            setMintAddress(mintPubkey)
            console.log('Mint address:', mintPubkey)

            // Step 2: Upload metadata and create transaction via PumpPortal bundled API
            // This handles IPFS upload server-side, avoiding CORS issues
            setStatus('Uploading metadata to IPFS...')

            const bundledFormData = new FormData()
            bundledFormData.append('file', imageFile)
            bundledFormData.append('name', formData.name)
            bundledFormData.append('symbol', formData.symbol.toUpperCase())
            bundledFormData.append('description', formData.description || formData.name)
            bundledFormData.append('showName', 'true')

            if (formData.twitter) bundledFormData.append('twitter', formData.twitter)
            if (formData.telegram) bundledFormData.append('telegram', formData.telegram)
            if (formData.website) bundledFormData.append('website', formData.website)

            // Add transaction parameters
            bundledFormData.append('publicKey', publicKey.toBase58())
            bundledFormData.append('action', 'create')
            bundledFormData.append('mint', mintPubkey)
            bundledFormData.append('denominatedInSol', 'true')
            bundledFormData.append('amount', String(devBuyAmount || 0))
            bundledFormData.append('slippage', '10')
            bundledFormData.append('priorityFee', '0.0005')
            bundledFormData.append('pool', 'pump')

            setStatus('Creating token transaction...')

            const createResponse = await fetch('https://pumpportal.fun/api/trade', {
                method: 'POST',
                body: bundledFormData,
            })

            if (!createResponse.ok) {
                const errText = await createResponse.text()
                throw new Error(`Failed to create transaction: ${errText}`)
            }

            // Step 4: Get the transaction bytes and deserialize
            setStatus('Preparing transaction for signing...')

            const txBuffer = await createResponse.arrayBuffer()
            const tx = VersionedTransaction.deserialize(new Uint8Array(txBuffer))

            // Step 5: Sign with mint keypair first
            tx.sign([mintKeypair])

            // Step 6: Have the wallet sign the transaction
            setStatus('Please approve the transaction in your wallet...')

            const signedTx = await signTransaction(tx)

            // Step 7: Send the transaction
            setStatus('Sending transaction to Solana...')

            const signature = await connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
            })

            console.log('Transaction sent:', signature)

            // Step 8: Confirm the transaction
            setStatus('Confirming transaction...')

            const confirmation = await connection.confirmTransaction(signature, 'confirmed')

            if (confirmation.value.err) {
                throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err))
            }

            setTxSignature(signature)
            setStatus('Token created successfully!')

            // Store token info for later
            const tokenInfo = {
                name: formData.name,
                symbol: formData.symbol.toUpperCase(),
                description: formData.description,
                image: imagePreview,
                metadataUri: metadataResult.metadataUri,
                mintAddress: mintPubkey,
                txSignature: signature,
                createdAt: Date.now(),
                creator: publicKey.toBase58(),
            }

            localStorage.setItem('lastCreatedToken', JSON.stringify(tokenInfo))

            // Navigate to the token page after a short delay
            setTimeout(() => {
                navigate(`/token/${mintPubkey}?new=true`)
            }, 2000)

        } catch (err) {
            console.error('Token creation error:', err)
            setError(err.message || 'Failed to create token')
            setStatus('')
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
                    <p>Create a real token on pump.fun directly from TrustPump</p>
                </div>

                <div className="create-layout">
                    <div className="create-form">
                        {/* Image Upload */}
                        <div className="form-section">
                            <h3>Token Image *</h3>
                            <div className="image-upload-area">
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Token preview" />
                                        <button className="remove-image" onClick={removeImage} disabled={isCreating}>
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
                                    disabled={isCreating}
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
                                        disabled={isCreating}
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
                                        disabled={isCreating}
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
                                    disabled={isCreating}
                                />
                            </div>
                        </div>

                        {/* Social Links */}
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
                                    disabled={isCreating}
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
                                    disabled={isCreating}
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
                                    disabled={isCreating}
                                />
                            </div>
                        </div>

                        {/* Dev Buy */}
                        <div className="form-section">
                            <h3>Initial Dev Buy <span className="optional">(optional)</span></h3>
                            <div className="input-group">
                                <label>Amount (SOL)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="50"
                                    placeholder="0"
                                    value={devBuyAmount}
                                    onChange={(e) => setDevBuyAmount(parseFloat(e.target.value) || 0)}
                                    disabled={isCreating}
                                />
                                <span className="input-hint">Buy your own token at launch (0 = no dev buy)</span>
                            </div>
                        </div>

                        {/* Status Display */}
                        {status && (
                            <div className="status-message">
                                <Loader size={16} className="spinner-icon" />
                                {status}
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {/* Success Display */}
                        {txSignature && (
                            <div className="success-message">
                                <Check size={20} />
                                <div>
                                    <p><strong>Token Created Successfully!</strong></p>
                                    <p>Mint: {mintAddress.slice(0, 8)}...{mintAddress.slice(-8)}</p>
                                    <a
                                        href={`https://solscan.io/tx/${txSignature}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Transaction <ExternalLink size={14} />
                                    </a>
                                    <a
                                        href={`https://pump.fun/${mintAddress}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ marginLeft: '16px' }}
                                    >
                                        View on Pump.fun <ExternalLink size={14} />
                                    </a>
                                </div>
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
                                    <Loader size={20} className="spinner-icon" />
                                    {status || 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Rocket size={20} />
                                    Create Token on Pump.fun
                                </>
                            )}
                        </button>

                        <p className="fee-note">
                            Cost: ~0.02 SOL (network fee) {devBuyAmount > 0 && `+ ${devBuyAmount} SOL (dev buy)`}
                        </p>
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
                                    {formData.description || 'Your token will appear on pump.fun'}
                                </p>
                            </div>
                        </div>

                        <div className="info-card">
                            <Info size={20} />
                            <div>
                                <h4>What happens</h4>
                                <ul>
                                    <li>Image + metadata stored on IPFS</li>
                                    <li>Token created on pump.fun</li>
                                    <li>Bonding curve starts at $0</li>
                                    <li>Anyone can buy/sell</li>
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
