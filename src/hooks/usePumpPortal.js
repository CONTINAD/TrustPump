import { useState, useEffect, useCallback, useRef } from 'react'

const PUMPPORTAL_WS = 'wss://pumpportal.fun/api/data'

export function usePumpPortalWebSocket() {
    const [isConnected, setIsConnected] = useState(false)
    const [newTokens, setNewTokens] = useState([])
    const [trades, setTrades] = useState({})
    const wsRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return

        try {
            wsRef.current = new WebSocket(PUMPPORTAL_WS)

            wsRef.current.onopen = () => {
                console.log('PumpPortal WebSocket connected')
                setIsConnected(true)

                // Subscribe to new token creations
                wsRef.current.send(JSON.stringify({ method: "subscribeNewToken" }))
            }

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    if (data.txType === 'create') {
                        // New token created
                        const token = {
                            id: data.mint,
                            mint: data.mint,
                            name: data.name || 'Unknown',
                            symbol: data.symbol || '???',
                            uri: data.uri,
                            creator: data.traderPublicKey,
                            marketCapSol: data.marketCapSol || 0,
                            timestamp: Date.now(),
                            isNew: true,
                        }
                        setNewTokens(prev => [token, ...prev.slice(0, 49)])
                    } else if (data.txType === 'buy' || data.txType === 'sell') {
                        // Trade happened
                        const trade = {
                            type: data.txType,
                            mint: data.mint,
                            solAmount: data.solAmount,
                            tokenAmount: data.tokenAmount,
                            trader: data.traderPublicKey,
                            timestamp: Date.now(),
                            signature: data.signature,
                            newMarketCap: data.marketCapSol,
                        }
                        setTrades(prev => ({
                            ...prev,
                            [data.mint]: [...(prev[data.mint] || []).slice(0, 19), trade]
                        }))
                    }
                } catch (err) {
                    console.error('Failed to parse WS message:', err)
                }
            }

            wsRef.current.onclose = () => {
                console.log('PumpPortal WebSocket disconnected')
                setIsConnected(false)

                // Reconnect after delay
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect()
                }, 3000)
            }

            wsRef.current.onerror = (error) => {
                console.error('PumpPortal WebSocket error:', error)
            }
        } catch (err) {
            console.error('Failed to connect to PumpPortal:', err)
        }
    }, [])

    const subscribeToToken = useCallback((mintAddress) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                method: "subscribeTokenTrade",
                keys: [mintAddress]
            }))
        }
    }, [])

    const unsubscribeFromToken = useCallback((mintAddress) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                method: "unsubscribeTokenTrade",
                keys: [mintAddress]
            }))
        }
    }, [])

    useEffect(() => {
        connect()

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [connect])

    return {
        isConnected,
        newTokens,
        trades,
        subscribeToToken,
        unsubscribeFromToken,
    }
}

// Format helpers
export function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}

export function formatSol(amount) {
    if (!amount) return '0'
    if (amount < 0.01) return amount.toFixed(4)
    if (amount < 1) return amount.toFixed(3)
    if (amount < 100) return amount.toFixed(2)
    return amount.toFixed(1)
}

export function shortenAddress(address, chars = 4) {
    if (!address) return ''
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
}
