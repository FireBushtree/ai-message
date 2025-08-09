// Cloudflare Workers 聊天API处理器

export default {
  async fetch(request, env) {
    // 处理CORS预检请求
    if (request.method === 'OPTIONS') {
      return handleCORS()
    }

    const url = new URL(request.url)
    
    // 路由处理
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChatRequest(request, env)
    }

    // 默认返回404
    return new Response('Not Found', { 
      status: 404,
      headers: getCORSHeaders()
    })
  }
}

// 处理聊天请求
async function handleChatRequest(request, env) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        error: '请提供有效的消息内容'
      }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders()
        }
      })
    }

    // 调用ChatGPT API
    const aiResponse = await callChatGPT(message, env)

    return new Response(JSON.stringify({
      content: aiResponse
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      }
    })

  } catch (error) {
    console.error('处理聊天请求时出错:', error)
    
    return new Response(JSON.stringify({
      error: '服务器内部错误',
      content: '抱歉，我现在无法处理您的请求。请稍后再试。'
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      }
    })
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
    throw new Error(`OpenAI API调用失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || '抱歉，我无法生成回复。'
}

// 获取CORS头部
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

// 处理CORS预检请求
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  })
}