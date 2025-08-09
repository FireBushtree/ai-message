import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

// 获取 API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// 创建 Apollo Client
export const client = new ApolloClient({
  uri: `${API_BASE_URL}/graphql`,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  }
})

// GraphQL 查询和变更
export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($message: String!) {
    sendMessage(message: $message) {
      content
      error
    }
  }
`

export const HELLO_QUERY = gql`
  query Hello {
    hello
  }
`