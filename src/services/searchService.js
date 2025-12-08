import { MeiliSearch } from 'meilisearch'
import { getMenuItems } from './menuService'

// Tạo Meilisearch client với in-memory index
let searchClient = null
let isIndexed = false

const initializeSearch = async () => {
  if (searchClient && isIndexed) return

  try {
    // Tạo Meilisearch instance với in-memory storage
    searchClient = new MeiliSearch({
      host: 'http://localhost:7700', // Dummy host, sẽ dùng in-memory
    })

    // Vì không có server, tạo một search function tương tự Meilisearch
    // với fuzzy matching và typo tolerance
    searchClient = {
      search: async (query, options = {}) => {
        const { limit = 5, offset = 0 } = options
        const allItems = await getAllMenuItems()
        const results = fuzzySearch(allItems, query, { limit, offset })
        return {
          hits: results,
          estimatedTotalHits: results.length,
          query,
          processingTimeMs: 0,
        }
      },
    }
    isIndexed = true
  } catch (error) {
    console.error('Search initialization error:', error)
    // Fallback to simple search
    searchClient = {
      search: async (query, options = {}) => {
        const { limit = 5 } = options
        const allItems = await getAllMenuItems()
        const results = fuzzySearch(allItems, query, { limit })
        return {
          hits: results,
          estimatedTotalHits: results.length,
          query,
          processingTimeMs: 0,
        }
      },
    }
    isIndexed = true
  }
}

// Cache để tránh gọi API nhiều lần
let menuItemsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 phút

const getAllMenuItems = async () => {
  const now = Date.now()
  if (menuItemsCache && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    return menuItemsCache
  }

  try {
    const response = await getMenuItems({ limit: 1000 })
    menuItemsCache = response.data || []
    cacheTimestamp = now
    return menuItemsCache
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return menuItemsCache || []
  }
}

// Thuật toán tìm kiếm tương tự Meilisearch với fuzzy matching
const fuzzySearch = (items, query, options = {}) => {
  if (!query || !query.trim()) return []

  const { limit = 5, offset = 0 } = options
  const searchTerm = query.toLowerCase().trim()

  // Tính điểm cho mỗi item
  const scoredItems = items.map((item) => {
    const name = (item.name || '').toLowerCase()
    const description = (item.description || '').toLowerCase()
    const category = (item.category || '').toLowerCase()
    const tags = (item.tags || []).map((tag) => tag.toLowerCase()).join(' ')

    let score = 0

    // Exact match trong name (điểm cao nhất)
    if (name === searchTerm) {
      score += 1000
    } else if (name.startsWith(searchTerm)) {
      score += 500
    } else if (name.includes(searchTerm)) {
      score += 300
    }

    // Fuzzy match trong name
    const nameSimilarity = calculateSimilarity(name, searchTerm)
    score += nameSimilarity * 200

    // Match trong description
    if (description.includes(searchTerm)) {
      score += 100
    }
    const descSimilarity = calculateSimilarity(description, searchTerm)
    score += descSimilarity * 50

    // Match trong category
    if (category.includes(searchTerm)) {
      score += 150
    }

    // Match trong tags
    if (tags.includes(searchTerm)) {
      score += 120
    }

    // Typo tolerance - tìm các từ gần giống
    const words = searchTerm.split(/\s+/)
    words.forEach((word) => {
      if (name.includes(word)) score += 80
      if (description.includes(word)) score += 40
    })

    return { item, score }
  })

  // Sắp xếp theo điểm và lọc
  const filtered = scoredItems
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(offset, offset + limit)
    .map(({ item }) => item)

  return filtered
}

// Tính độ tương đồng giữa 2 chuỗi (Levenshtein distance based)
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0
  if (str1 === str2) return 1

  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1

  // Kiểm tra nếu shorter là substring của longer
  if (longer.includes(shorter)) {
    return shorter.length / longer.length
  }

  // Tính Levenshtein distance
  const distance = levenshteinDistance(str1, str2)
  const maxLength = Math.max(str1.length, str2.length)
  return 1 - distance / maxLength
}

// Levenshtein distance algorithm
const levenshteinDistance = (str1, str2) => {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

// Export search function
export const searchMenuItems = async (query, options = {}) => {
  await initializeSearch()
  if (!query || !query.trim()) {
    return { hits: [], estimatedTotalHits: 0, query: '', processingTimeMs: 0 }
  }

  try {
    const result = await searchClient.search(query, {
      limit: options.limit || 5,
      offset: options.offset || 0,
    })
    return result
  } catch (error) {
    console.error('Search error:', error)
    // Fallback to API search
    try {
      const response = await getMenuItems({ query, limit: options.limit || 5 })
      return {
        hits: response.data || [],
        estimatedTotalHits: response.pagination?.total || 0,
        query,
        processingTimeMs: 0,
      }
    } catch (apiError) {
      console.error('API search error:', apiError)
      return { hits: [], estimatedTotalHits: 0, query: '', processingTimeMs: 0 }
    }
  }
}

