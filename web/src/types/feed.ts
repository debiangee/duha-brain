export interface Feed {
  id: string
  title: string
  url: string
  description: string
  lastFetched?: string
  fetchError?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FeedItem {
  id: string
  feedId: string
  title: string
  link: string
  description: string
  content?: string
  pubDate?: string
  guid?: string
  isSaved: boolean
  savedNoteId?: string
  fetchedAt: string
}
