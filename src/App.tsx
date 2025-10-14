import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Alert, AlertDescription } from './components/ui/alert'
import { Shield, Key, Info } from '@phosphor-icons/react'
import { MnemonicGenerator } from './components/MnemonicGeneration'
import { KeyDerivation } from './components/KeyDerivation'
import { PathExplorer } from './components/PathExplorer'
import { SemanticPath } from './components/SemanticPath'

function App() {
  const [mnemonic, setMnemonic] = useState('')
  const [activeTab, setActiveTab] = useState('generate')

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Key className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">BIP Keychain</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hierarchical Deterministic wallet key derivation tool supporting BIP32, BIP39, BIP44, BIP49, and BIP84 standards
          </p>
        </div>

        <Alert className="security-warning">
          <Shield className="w-4 h-4" />
          <AlertDescription className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Security Warning:</strong> This tool generates cryptographic keys in your browser. 
              Never use keys generated on this site for real funds. For production use, generate keys offline on an air-gapped device.
            </div>
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate">Generate Seed</TabsTrigger>
            <TabsTrigger value="derive">Key Derivation</TabsTrigger>
            <TabsTrigger value="explore">Path Explorer</TabsTrigger>
            <TabsTrigger value="semantic">Semantic Paths</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Mnemonic Seed Generation</CardTitle>
                <CardDescription>
                  Generate or import a BIP39 mnemonic phrase to use as the root seed for key derivation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MnemonicGenerator mnemonic={mnemonic} setMnemonic={setMnemonic} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="derive">
            <Card>
              <CardHeader>
                <CardTitle>HD Key Derivation</CardTitle>
                <CardDescription>
                  Derive keys and addresses using hierarchical deterministic paths (BIP32/44/49/84)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyDerivation mnemonic={mnemonic} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explore">
            <Card>
              <CardHeader>
                <CardTitle>Derivation Path Explorer</CardTitle>
                <CardDescription>
                  Interactive tool to build and understand BIP32 derivation paths
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PathExplorer mnemonic={mnemonic} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semantic">
            <Card>
              <CardHeader>
                <CardTitle>BIP-Keychain Semantic Paths</CardTitle>
                <CardDescription>
                  Generate keys using semantic JSON-LD entities following BIP-Keychain specification (m/83696968'/67797668')
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SemanticPath mnemonic={mnemonic} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
