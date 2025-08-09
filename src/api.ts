import { client, SEND_MESSAGE_MUTATION } from './graphql'

interface ChatResponse {
  content: string
  error?: string
}

export async function sendMessageToAI(message: string): Promise<ChatResponse> {
  try {
    const result = await client.mutate({
      mutation: SEND_MESSAGE_MUTATION,
      variables: {
        message: message
      }
    })

    const response = result.data?.sendMessage
    
    if (response?.error) {
      return {
        content: response.content || '抱歉，处理请求时出现错误。',
        error: response.error
      }
    }

    return {
      content: response?.content || '抱歉，我无法生成回复。',
      error: undefined
    }
  } catch (error) {
    console.error('GraphQL error:', error)
    return {
      content: '抱歉，网络连接出现问题。请稍后再试。',
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}