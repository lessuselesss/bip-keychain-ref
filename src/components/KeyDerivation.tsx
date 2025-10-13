import { useState, useEffect } from 'react'
import * as bip39 from 'bip39'
import { BIP32Factory } from 'bip32'
import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Key, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

bitcoin.initEccLib(ecc)

interface KeyDerivationProps {
  mnemonic: string
}

interface DerivedKey {
  path: string
  privateKey: string
  privateKeyWIF: string
  publicKey: string
  address: string
  extendedPrivateKey: string
  extendedPublicKey: string
  fingerprint: string
  depth: number
}

const BIP_STANDARDS = {
  'bip44': {
    name: 'BIP44 (Legacy P2PKH)',
    description: 'Legacy addresses starting with 1',
    basePath: "m/44'/0'/0'",
    addressType: 'p2pkh'
  },
  'bip49': {
    name: 'BIP49 (SegWit P2SH)',
    description: 'SegWit wrapped in P2SH, addresses starting with 3',
    basePath: "m/49'/0'/0'",
    addressType: 'p2sh'
  },
  'bip84': {
    name: 'BIP84 (Native SegWit)',
    description: 'Native SegWit addresses starting with bc1',
    basePath: "m/84'/0'/0'",
    addressType: 'p2wpkh'
  },
  'bip86': {
    name: 'BIP86 (Taproot)',
    description: 'Taproot addresses starting with bc1p (not implemented)',
    basePath: "m/86'/0'/0'",
    addressType: 'p2tr'
  },
  'semantic': {
    name: 'Semantic Path (Image)',
    description: 'Semantic derivation path for image/NFT metadata',
    basePath: "m/83696968'/67797668'",
    addressType: 'p2wpkh'
  }
}

export function KeyDerivation({ mnemonic }: KeyDerivationProps) {
  const [selectedBip, setSelectedBip] = useState<string>('bip44')
  const [customPath, setCustomPath] = useState<string>('')
  const [account, setAccount] = useState<string>('0')
  const [change, setChange] = useState<string>('0')
  const [addressIndex, setAddressIndex] = useState<string>('0')
  const [derivedKeys, setDerivedKeys] = useState<DerivedKey[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const bipInfo = BIP_STANDARDS[selectedBip as keyof typeof BIP_STANDARDS]
    if (bipInfo) {
      if (selectedBip === 'semantic') {
        // Special handling for semantic path - no account replacement needed
        setCustomPath(bipInfo.basePath)
      } else {
        const parts = bipInfo.basePath.split('/')
        // The account is the 4th part of the path (index 3), e.g., m/44'/0'/0'
        if (parts.length > 3) {
          parts[3] = `${account}'`
        }
        const path = parts.join('/')
        setCustomPath(path)
      }
    }
  }, [selectedBip, account])

  const deriveKeys = async () => {
    if (!mnemonic || !bip39.validateMnemonic(mnemonic)) {
      setError('Please provide a valid mnemonic phrase')
      return
    }

    setIsGenerating(true)
    setError('')
    
    try {
      const seed = await bip39.mnemonicToSeed(mnemonic)
      const bip32 = BIP32Factory(ecc)
      const root = bip32.fromSeed(seed)
      const bipInfo = BIP_STANDARDS[selectedBip as keyof typeof BIP_STANDARDS]
      
      const accountNode = root.derivePath(customPath)
      
      let keys: DerivedKey[] = []
      const startIndex = parseInt(addressIndex)
      const endIndex = startIndex + 5 // Generate 5 addresses

      if (selectedBip === 'semantic') {
        // Special handling for semantic path - derive directly from semantic base
        for (let i = startIndex; i < endIndex; i++) {
          const child = accountNode.derive(i)
          const fullPath = `${customPath}/${i}`
          
          let address = ''
          
          // Use P2WPKH for semantic paths
          const { address: p2wpkhAddress } = bitcoin.payments.p2wpkh({ 
            pubkey: child.publicKey
          })
          address = p2wpkhAddress || ''

          keys.push({
            path: fullPath,
            privateKey: child.privateKey ? Buffer.from(child.privateKey).toString('hex') : '',
            privateKeyWIF: 'WIF format not available in this version',
            publicKey: child.publicKey ? Buffer.from(child.publicKey).toString('hex') : '',
            address,
            extendedPrivateKey: child.toBase58(),
            extendedPublicKey: child.neutered().toBase58(),
            fingerprint: child.fingerprint ? Buffer.from(child.fingerprint).toString('hex') : 'N/A',
            depth: child.depth
          })
        }
      } else {
        // Standard BIP derivation with change level
        const changeNode = accountNode.derive(parseInt(change))
        
        for (let i = startIndex; i < endIndex; i++) {
          const child = changeNode.derive(i)
          const fullPath = `${customPath}/${change}/${i}`
          
          let address = ''
          
          if (bipInfo.addressType === 'p2pkh') {
            const { address: p2pkhAddress } = bitcoin.payments.p2pkh({ 
              pubkey: child.publicKey
            })
            address = p2pkhAddress || ''
          } else if (bipInfo.addressType === 'p2sh') {
            const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: child.publicKey })
            if (p2wpkh.output) {
              const { address: p2shAddress } = bitcoin.payments.p2sh({
                redeem: p2wpkh
              })
              address = p2shAddress || ''
            }
          } else if (bipInfo.addressType === 'p2wpkh') {
            const { address: p2wpkhAddress } = bitcoin.payments.p2wpkh({ 
              pubkey: child.publicKey
            })
            address = p2wpkhAddress || ''
          } else if (bipInfo.addressType === 'p2tr') {
            address = 'Taproot not implemented in this version'
          }

          keys.push({
            path: fullPath,
            privateKey: child.privateKey ? Buffer.from(child.privateKey).toString('hex') : '',
            privateKeyWIF: 'WIF format not available in this version',
            publicKey: child.publicKey ? Buffer.from(child.publicKey).toString('hex') : '',
            address,
            extendedPrivateKey: child.toBase58(),
            extendedPublicKey: child.neutered().toBase58(),
            fingerprint: child.fingerprint ? Buffer.from(child.fingerprint).toString('hex') : 'N/A',
            depth: child.depth
          })
        }
      }

      setDerivedKeys(keys)
      toast.success(`Generated ${keys.length} keys successfully`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Failed to derive keys: ${errorMessage}`)
      toast.error('Key derivation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`)
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  const isValidMnemonic = mnemonic && bip39.validateMnemonic(mnemonic)

  return (
    <div className="space-y-6">
      {!isValidMnemonic && (
        <Alert variant="destructive">
          <Warning className="w-4 h-4" />
          <AlertDescription>
            Please generate or enter a valid mnemonic phrase in the "Generate Seed" tab first.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bip-standard">BIP Standard</Label>
          <Select value={selectedBip} onValueChange={setSelectedBip}>
            <SelectTrigger id="bip-standard">
              <SelectValue placeholder="Select BIP standard" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BIP_STANDARDS).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  {info.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedBip && (
            <p className="text-sm text-muted-foreground">
              {BIP_STANDARDS[selectedBip as keyof typeof BIP_STANDARDS].description}
            </p>
          )}
        </div>

        {selectedBip !== 'semantic' && (
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Input
              id="account"
              type="number"
              min="0"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Account number"
            />
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 gap-4 ${selectedBip === 'semantic' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        <div className="space-y-2">
          <Label htmlFor="custom-path">Derivation Path</Label>
          <Input
            id="custom-path"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="m/44'/0'/0'"
            className="font-mono"
          />
        </div>

        {selectedBip !== 'semantic' && (
          <div className="space-y-2">
            <Label htmlFor="change">Change</Label>
            <Select value={change} onValueChange={setChange}>
              <SelectTrigger id="change">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (External)</SelectItem>
                <SelectItem value="1">1 (Internal/Change)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="address-index">
            {selectedBip === 'semantic' ? 'Semantic Index' : 'Starting Index'}
          </Label>
          <Input
            id="address-index"
            type="number"
            min="0"
            value={addressIndex}
            onChange={(e) => setAddressIndex(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <Button 
        onClick={deriveKeys}
        disabled={!isValidMnemonic || isGenerating}
        className="w-full"
      >
        <Key className="w-4 h-4 mr-2" />
        {isGenerating ? 'Deriving Keys...' : 'Derive Keys'}
      </Button>

      {error && (
        <Alert variant="destructive">
          <Warning className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {derivedKeys.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Derived Keys</h3>
            <Badge variant="outline">
              {derivedKeys.length} addresses
            </Badge>
          </div>

          <div className="space-y-4">
            {derivedKeys.map((key, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="font-mono text-sm">{key.path}</span>
                    <Badge variant="secondary">Index {parseInt(addressIndex) + index}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Address</Label>
                      <div className="crypto-data flex items-center justify-between">
                        <span className="break-all">{key.address}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.address, 'Address')}
                          className="ml-2 flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Public Key</Label>
                      <div className="crypto-data flex items-center justify-between">
                        <span className="break-all">{key.publicKey}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.publicKey, 'Public Key')}
                          className="ml-2 flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Private Key (Hex)</Label>
                      <div className="crypto-data flex items-center justify-between">
                        <span className="break-all">{key.privateKey}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.privateKey, 'Private Key')}
                          className="ml-2 flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Private Key (WIF)</Label>
                      <div className="crypto-data flex items-center justify-between">
                        <span className="break-all text-muted-foreground">{key.privateKeyWIF}</span>
                        {key.privateKeyWIF !== 'WIF format not available in this version' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(key.privateKeyWIF, 'Private Key WIF')}
                            className="ml-2 flex-shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Key Depth</Label>
                        <div className="crypto-data">
                          <span>{key.depth}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Key Fingerprint</Label>
                        <div className="crypto-data">
                          <span className="break-all">{key.fingerprint}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Extended Public Key</Label>
                      <div className="crypto-data flex items-center justify-between">
                        <span className="break-all">{key.extendedPublicKey}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.extendedPublicKey, 'Extended Public Key')}
                          className="ml-2 flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
