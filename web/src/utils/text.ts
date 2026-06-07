/**
 * Extract plain text from HTML content
 */
export const stripHtml = (html: string): string => {
  // Create a temporary element to parse HTML
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  // Get text content and clean up whitespace
  let text = temp.textContent || temp.innerText || ''
  
  // Replace multiple spaces and newlines with single space
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}

/**
 * Get a preview of content (first N characters)
 */
export const getPreview = (content: string, length: number = 80): string => {
  const plainText = stripHtml(content)
  return plainText.substring(0, length)
}

/**
 * Convert text to proper title case
 */
export const toTitleCase = (text: string): string => {
  if (!text) return ''
  
  // Words that should be lowercase (unless at the beginning)
  const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'with']
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // First word or not a small word
      if (index === 0 || !smallWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(' ')
}
