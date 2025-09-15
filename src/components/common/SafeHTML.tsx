'use client'

import React, { useMemo } from 'react'
import DOMPurify from 'dompurify'

interface SafeHTMLProps {
  html: string
  className?: string
  allowedTags?: string[]
  allowedAttributes?: { [key: string]: string[] }
  stripTags?: boolean
  maxLength?: number
}

/**
 * SafeHTML Component
 * 
 * Renders HTML content safely by sanitizing it with DOMPurify
 * Prevents XSS attacks while allowing safe HTML formatting
 */
export const SafeHTML: React.FC<SafeHTMLProps> = ({
  html,
  className = '',
  allowedTags = ['p', 'br', 'strong', 'em', 'u', 'span', 'div'],
  allowedAttributes = {
    '*': ['class', 'style'],
    'span': ['class', 'style'],
    'div': ['class', 'style']
  },
  stripTags = false,
  maxLength
}) => {
  const sanitizedHTML = useMemo(() => {
    if (!html) return ''

    // Truncate if maxLength is specified
    let processedHTML = maxLength && html.length > maxLength 
      ? html.substring(0, maxLength) + '...'
      : html

    // Configure DOMPurify options
    const config = {
      ALLOWED_TAGS: stripTags ? [] : allowedTags,
      ALLOWED_ATTR: stripTags ? [] : Object.keys(allowedAttributes).reduce((acc, tag) => {
        allowedAttributes[tag].forEach(attr => {
          if (!acc.includes(attr)) acc.push(attr)
        })
        return acc
      }, [] as string[]),
      KEEP_CONTENT: true
    }

    // Sanitize the HTML
    const sanitized = DOMPurify.sanitize(processedHTML, config)
    
    return sanitized as string
  }, [html, allowedTags, allowedAttributes, stripTags, maxLength])

  // If stripTags is true, return plain text
  if (stripTags) {
    return (
      <span className={className}>
        {sanitizedHTML}
      </span>
    )
  }

  // Return sanitized HTML
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}

/**
 * SafeText Component
 * 
 * Renders text content safely by stripping all HTML tags
 * Use this for user-generated content that should be plain text only
 */
export const SafeText: React.FC<{
  text: string
  className?: string
  maxLength?: number
}> = ({ text, className = '', maxLength }) => {
  return (
    <SafeHTML
      html={text}
      className={className}
      stripTags={true}
      maxLength={maxLength}
    />
  )
}

/**
 * SafeReadingContent Component
 * 
 * Specialized component for tarot reading content
 * Allows basic formatting while maintaining security
 */
export const SafeReadingContent: React.FC<{
  content: string
  className?: string
}> = ({ content, className = '' }) => {
  return (
    <SafeHTML
      html={content}
      className={className}
      allowedTags={['p', 'br', 'strong', 'em', 'span']}
      allowedAttributes={{
        '*': ['class'],
        'span': ['class']
      }}
    />
  )
}

export default SafeHTML