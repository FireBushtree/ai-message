import { 
  buildSchema, 
  parse, 
  validate, 
  execute
} from 'graphql'

// GraphQL Schema
const schema = buildSchema(`
  type Query {
    hello: String
  }

  type Mutation {
    sendMessage(message: String!): ChatResponse!
  }

  type ChatResponse {
    content: String!
    error: String
  }
`)

// Root resolver
const rootValue = {
  hello: () => 'Hello from GraphQL!',
  sendMessage: async ({ message }, context) => {
    try {
      if (!message || typeof message !== 'string' || !message.trim()) {
        return {
          content: '',
          error: '请提供有效的消息内容'
        }
      }

      const aiResponse = await callChatGPT(message.trim(), context.env)
      return {
        content: aiResponse,
        error: null
      }
    } catch (error) {
      console.error('处理聊天请求时出错:', error)
      return {
        content: '抱歉，我现在无法处理您的请求。请稍后再试。',
        error: error.message || '服务器内部错误'
      }
    }
  }
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      })
    }

    const url = new URL(request.url)

    // GraphQL endpoint
    if (url.pathname === '/graphql' && request.method === 'POST') {
      return handleGraphQL(request, env)
    }

    // GraphQL Playground (GET request)
    if (url.pathname === '/graphql' && request.method === 'GET') {
      return new Response(graphqlPlaygroundHTML, {
        headers: {
          'Content-Type': 'text/html',
          ...corsHeaders
        }
      })
    }

    // Default 404
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders
    })
  }
}

async function handleGraphQL(request, env) {
  try {
    const body = await request.json()
    const { query, variables, operationName } = body

    if (!query) {
      return new Response(
        JSON.stringify({ 
          errors: [{ message: 'Must provide query string.' }] 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Parse the GraphQL query
    let document
    try {
      document = parse(query)
    } catch (syntaxError) {
      return new Response(
        JSON.stringify({ 
          errors: [{ message: syntaxError.message }] 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Validate the query
    const validationErrors = validate(schema, document)
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          errors: validationErrors.map(error => ({ message: error.message })) 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Execute the query
    const result = await execute({
      schema,
      document,
      rootValue,
      contextValue: { env, request },
      variableValues: variables,
      operationName
    })

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('GraphQL error:', error)
    return new Response(
      JSON.stringify({ 
        errors: [{ message: 'Internal server error' }] 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
}

// 调用OpenAI ChatGPT API
async function callChatGPT(message, env) {
  const openaiApiKey = env.OPENAI_API_KEY

  if (!openaiApiKey) {
    throw new Error('缺少OpenAI API密钥')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个友善的AI助手，请用中文回复用户的问题。'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('OpenAI API错误:', errorData)
    
    if (response.status === 429) {
      throw new Error('OpenAI API 配额已用完，请检查账户余额或稍后重试')
    }
    
    throw new Error(`OpenAI API调用失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || '抱歉，我无法生成回复。'
}

// GraphQL Playground HTML
const graphqlPlaygroundHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset=utf-8/>
  <meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui">
  <title>GraphQL Playground</title>
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
  <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
  <script src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
</head>
<body>
  <div id="root">
    <style>
      body {
        background-color: rgb(23, 42, 58);
        font-family: Open Sans, sans-serif;
        height: 90vh;
      }
      #root {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .loading {
        font-size: 32px;
        font-weight: 200;
        color: rgba(255, 255, 255, .6);
        margin-left: 20px;
      }
      img {
        width: 78px;
        height: 78px;
      }
      .title {
        font-weight: 400;
      }
    </style>
    <img src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/logo.png" alt="">
    <div class="loading"> Loading
      <span class="title">GraphQL Playground</span>
    </div>
  </div>
  <script>window.addEventListener('load', function (event) {
      GraphQLPlayground.init(document.getElementById('root'), {
        endpoint: '/graphql'
      })
    })</script>
</body>
</html>`