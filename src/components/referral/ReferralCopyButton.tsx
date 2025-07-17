'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ReferralCopyButtonProps {
  referralLink: string
  onCopySuccess?: () => void
  onCopyError?: () => void
}

export const ReferralCopyButton = ({ 
  referralLink, 
  onCopySuccess, 
  onCopyError 
}: ReferralCopyButtonProps) => {
  const [copied, setCopied] = useState(false)
  const [copying, setCopying] = useState(false)

  const handleCopy = async () => {
    if (copying) return

    setCopying(true)
    
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      onCopySuccess?.()
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy referral link:', err)
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = referralLink
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          setCopied(true)
          onCopySuccess?.()
          
          setTimeout(() => {
            setCopied(false)
          }, 2000)
        } else {
          throw new Error('Fallback copy failed')
        }
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr)
        onCopyError?.()
      }
    } finally {
      setCopying(false)
    }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={copying}
      className={`btn btn-square ${
        copied 
          ? 'btn-success' 
          : 'btn-primary'
      } ${copying ? 'loading' : ''}`}
      title={copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
    >
      {!copying && (
        copied ? (
          <Check className="w-5 h-5" />
        ) : (
          <Copy className="w-5 h-5" />
        )
      )}
    </button>
  )
}