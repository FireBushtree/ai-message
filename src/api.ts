interface ChatResponse {
  content: string
  error?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export async function sendMessageToAI(message: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error calling AI API:', error)
    return {
      content: '抱歉，我现在无法回复。请稍后再试。',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}