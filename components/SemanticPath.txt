import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TreeStructure, Path, Info } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface PathExplorerProps {
  mnemonic: string
}

const PATH_EXAMPLES = {
  'bip44': {
    name: 'BIP44 (Legacy)',
    template: "m/44'/coin'/account'/change/address_index",
    example: "m/44'/0'/0'/0/0",
    description: 'Legacy P2PKH addresses'
  },
  'bip49': {
    name: 'BIP49 (SegWit)',
    template: "m/49'/coin'/account'/change/address_index", 
    example: "m/49'/0'/0'/0/0",
    description: 'SegWit P2SH-wrapped addresses'
  },
  'bip84': {
    name: 'BIP84 (Native SegWit)',
    template: "m/84'/coin'/account'/change/address_index",
    example: "m/84'/0'/0'/0/0", 
    description: 'Native SegWit P2WPKH addresses'
  },
  'bip86': {
    name: 'BIP86 (Taproot)',
    template: "m/86'/coin'/account'/change/address_index",
    example: "m/86'/0'/0'/0/0",
    description: 'Taproot P2TR addresses'
  },
  'semantic': {
    name: 'Semantic Path (Image)',
    template: "m/83696968'/67797668'/semantic_path",
    example: "m/83696968'/67797668'/0",
    description: 'Semantic derivation path for image/NFT metadata storage'
  },
  'custom': {
    name: 'Custom Path',
    template: "m/purpose'/coin'/account'/change/address_index",
    example: "m/44'/0'/0'/0/0",
    description: 'Custom derivation path'
  }
}

const COIN_TYPES = {
  '0': 'Bitcoin (BTC)',
  '1': 'Bitcoin Testnet',
  '2': 'Litecoin (LTC)',
  '3': 'Dogecoin (DOGE)',
  '60': 'Ethereum (ETH)',
  '145': 'Bitcoin Cash (BCH)'
}

export function PathExplorer({ mnemonic }: PathExplorerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('bip44')
  const [purpose, setPurpose] = useState<string>('44')
  const [coinType, setCoinType] = useState<string>('0')
  const [account, setAccount] = useState<string>('0')
  const [change, setChange] = useState<string>('0')
  const [addressIndex, setAddressIndex] = useState<string>('0')
  const [customPath, setCustomPath] = useState<string>('')
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [derivationExamples] = useKV<Array<{bip: string, path: string, description: string}>>('derivation-examples', [])

  const buildPath = () => {
    if (isCustomMode) return customPath
    if (selectedTemplate === 'semantic') {
      return `m/${purpose}'/${coinType}'/${addressIndex}`
    }
    return `m/${purpose}'/${coinType}'/${account}'/${change}/${addressIndex}`
  }

  const validatePath = (path: string) => {
    const pathRegex = /^m(\/\d+'?)*$/
    return pathRegex.test(path)
  }

  const parsePath = (path: string) => {
    const parts = path.split('/')
    if (parts[0] !== 'm') return null
    
    return parts.slice(1).map((part, index) => {
      const isHardened = part.endsWith("'")
      const value = isHardened ? part.slice(0, -1) : part
      let label = ''
      
      if (selectedTemplate === 'semantic' && index < 3) {
        const semanticLabels = ['Purpose (83696968)', 'Namespace (67797668)', 'Semantic Index']
        label = semanticLabels[index] || `Level ${index + 1}`
      } else {
        const labels = ['Purpose', 'Coin Type', 'Account', 'Change', 'Address Index']
        label = labels[index] || `Level ${index + 1}`
      }
      
      return {
        label,
        value: parseInt(value),
        isHardened,
        raw: part
      }
    })
  }

  const currentPath = buildPath()
  const isValidPath = validatePath(currentPath)
  const pathComponents = parsePath(currentPath)

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template)
    setIsCustomMode(template === 'custom')
    
    if (template !== 'custom') {
      const pathInfo = PATH_EXAMPLES[template as keyof typeof PATH_EXAMPLES]
      const parts = pathInfo.example.split('/')
      
      if (template === 'semantic') {
        // Special handling for semantic path
        setPurpose('83696968')
        setCoinType('67797668')
        setAccount('0')
        setChange('0')
        setAddressIndex('0')
      } else if (parts.length >= 6) {
        setPurpose(parts[1].replace("'", ""))
        setCoinType(parts[2].replace("'", ""))
        setAccount(parts[3].replace("'", ""))
        setChange(parts[4])
        setAddressIndex(parts[5])
      }
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          BIP32 derivation paths follow a hierarchical structure. Each level represents a different aspect of the key derivation.
          Hardened derivation (marked with ') provides additional security by not exposing parent public keys.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="path-template">Path Template</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger id="path-template">
              <SelectValue placeholder="Select a path template" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PATH_EXAMPLES).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  {info.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && selectedTemplate !== 'custom' && (
            <p className="text-sm text-muted-foreground">
              {PATH_EXAMPLES[selectedTemplate as keyof typeof PATH_EXAMPLES].description}
            </p>
          )}
        </div>

        {isCustomMode ? (
          <div className="space-y-2">
            <Label htmlFor="custom-path">Custom Derivation Path</Label>
            <Input
              id="custom-path"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="m/44'/0'/0'/0/0"
              className="font-mono"
            />
          </div>
        ) : selectedTemplate === 'semantic' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="83696968"
                className="font-mono"
                disabled
              />
              <p className="text-xs text-muted-foreground">Fixed: 83696968</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coin-type">Namespace</Label>
              <Input
                id="coin-type"
                value={coinType}
                onChange={(e) => setCoinType(e.target.value)}
                placeholder="67797668"
                className="font-mono"
                disabled
              />
              <p className="text-xs text-muted-foreground">Fixed: 67797668</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address-input">Semantic Index</Label>
              <Input
                id="address-input"
                value={addressIndex}
                onChange={(e) => setAddressIndex(e.target.value)}
                placeholder="0"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Image identifier</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="44"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">BIP number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coin-type">Coin Type</Label>
              <Select value={coinType} onValueChange={setCoinType}>
                <SelectTrigger id="coin-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COIN_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {value} - {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-input">Account</Label>
              <Input
                id="account-input"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="0"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Wallet account</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="change-input">Change</Label>
              <Select value={change} onValueChange={setChange}>
                <SelectTrigger id="change-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (External)</SelectItem>
                  <SelectItem value="1">1 (Internal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address-input">Index</Label>
              <Input
                id="address-input"
                value={addressIndex}
                onChange={(e) => setAddressIndex(e.target.value)}
                placeholder="0"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Address index</p>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreeStructure className="w-5 h-5" />
            Built Path Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Derivation Path</Label>
              <Badge variant={isValidPath ? 'default' : 'destructive'}>
                {isValidPath ? 'Valid' : 'Invalid'}
              </Badge>
            </div>
            <div className="crypto-data">
              <span className="break-all">{currentPath}</span>
            </div>
          </div>

          {pathComponents && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <Label>Path Breakdown</Label>
                <div className="space-y-2">
                  {pathComponents.map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {component.raw}
                        </Badge>
                        <span className="text-sm font-medium">{component.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Value: {component.value}
                        </span>
                        {component.isHardened && (
                          <Badge variant="secondary" className="text-xs">
                            Hardened
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isValidPath && (
            <Alert variant="destructive">
              <AlertDescription>
                Invalid path format. Paths should start with 'm' and contain numeric components separated by slashes.
                Use apostrophes (') for hardened derivation.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Path Template Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(PATH_EXAMPLES).filter(([key]) => key !== 'custom').map(([key, info]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{info.name}</h4>
                  <Badge variant="outline">{key.toUpperCase()}</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Template:</span>
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {info.template}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Example:</span>
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {info.example}
                    </code>
                  </div>
                  <p className="text-muted-foreground">{info.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {derivationExamples && derivationExamples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Derivation Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {derivationExamples.map((example, index) => (
                <div key={index} className="p-3 bg-muted rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{example.bip}</Badge>
                    <code className="font-mono text-xs bg-background px-2 py-1 rounded">
                      {example.path}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
