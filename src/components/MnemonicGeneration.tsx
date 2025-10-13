import { useState } from 'react'
import * as bip39 from 'bip39'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Shuffle, CheckCircle, XCircle, Play } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface MnemonicGeneratorProps {
  mnemonic: string
  setMnemonic: (mnemonic: string) => void
}

export function MnemonicGenerator({ mnemonic, setMnemonic }: MnemonicGeneratorProps) {
  const [wordCount, setWordCount] = useState<string>('12')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [entropy, setEntropy] = useState<string>('')
  const [sampleMnemonic] = useKV('sample-mnemonic', '')
  const [educationalTips] = useKV<Array<{title: string, content: string}>>('educational-tips', [])

  const generateMnemonic = () => {
    try {
      const strength = wordCount === '12' ? 128 : 256
      const newMnemonic = bip39.generateMnemonic(strength)
      const entropyHex = bip39.mnemonicToEntropy(newMnemonic)
      
      setMnemonic(newMnemonic)
      setEntropy(entropyHex)
      setIsValid(true)
      
      toast.success(`Generated ${wordCount}-word mnemonic successfully`)
    } catch (error) {
      toast.error('Failed to generate mnemonic')
      console.error('Mnemonic generation error:', error)
    }
  }

  const validateMnemonic = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setIsValid(null)
      setEntropy('')
      return
    }

    const valid = bip39.validateMnemonic(trimmed)
    setIsValid(valid)
    
    if (valid) {
      try {
        const entropyHex = bip39.mnemonicToEntropy(trimmed)
        setEntropy(entropyHex)
      } catch (error) {
        setEntropy('')
      }
    } else {
      setEntropy('')
    }
  }

  const handleInputChange = (value: string) => {
    setMnemonic(value)
    validateMnemonic(value)
  }

  const loadSampleMnemonic = () => {
    if (sampleMnemonic) {
      setMnemonic(sampleMnemonic)
      validateMnemonic(sampleMnemonic)
      toast.success('Loaded sample mnemonic for testing')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`)
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  const wordArray = mnemonic.trim().split(/\s+/).filter(word => word.length > 0)
  const currentWordCount = wordArray.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="word-count">Word Count</Label>
          <Select value={wordCount} onValueChange={setWordCount}>
            <SelectTrigger id="word-count">
              <SelectValue placeholder="Select word count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 words (128-bit entropy)</SelectItem>
              <SelectItem value="24">24 words (256-bit entropy)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end gap-2">
          <Button onClick={generateMnemonic} className="flex-1">
            <Shuffle className="w-4 h-4 mr-2" />
            Generate New Seed
          </Button>
          {sampleMnemonic && (
            <Button onClick={loadSampleMnemonic} variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Load Sample
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="mnemonic">Mnemonic Phrase</Label>
          {mnemonic && (
            <div className="flex items-center gap-2">
              <Badge variant={isValid ? 'default' : 'destructive'} className="flex items-center gap-1">
                {isValid ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Valid
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    Invalid
                  </>
                )}
              </Badge>
              <Badge variant="outline">
                {currentWordCount} words
              </Badge>
            </div>
          )}
        </div>
        
        <Textarea
          id="mnemonic"
          placeholder="Enter or generate a BIP39 mnemonic phrase..."
          value={mnemonic}
          onChange={(e) => handleInputChange(e.target.value)}
          className="min-h-24 font-mono text-sm"
        />
        
        {mnemonic && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(mnemonic, 'Mnemonic')}
            className="w-fit"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Mnemonic
          </Button>
        )}
      </div>

      {entropy && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Entropy (Hex)</Label>
            <Badge variant="outline">
              {entropy.length * 4} bits
            </Badge>
          </div>
          <div className="crypto-data flex items-center justify-between">
            <span className="break-all">{entropy}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(entropy, 'Entropy')}
              className="ml-2 flex-shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {mnemonic && !isValid && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertDescription>
            Invalid mnemonic phrase. Please check for typos or generate a new one.
          </AlertDescription>
        </Alert>
      )}

      {isValid && currentWordCount !== parseInt(wordCount) && (
        <Alert>
          <AlertDescription>
            Word count mismatch: Expected {wordCount} words, got {currentWordCount} words.
          </AlertDescription>
        </Alert>
      )}

      {educationalTips && educationalTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Understanding BIP39 Mnemonic Phrases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {educationalTips.map((tip, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-foreground">{tip.title}</h4>
                <p className="text-sm text-muted-foreground">{tip.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
