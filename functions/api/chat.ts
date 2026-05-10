// Cloudflare Pages Function: /api/chat
// 真实 Claude 调用入口。前端永远调用这个，绝不直接持有 API key。
//
// 启用步骤（API key 给我之后）：
//   1. 在 Cloudflare Pages 项目里加一个环境变量 ANTHROPIC_API_KEY
//   2. 把 src/lib/ai.ts 顶部的 MOCK 改 false
//   3. 部署即可
//
// 本地开发：把 key 写到 .dev.vars（已 gitignore），然后 npx wrangler pages dev

interface Env {
  ANTHROPIC_API_KEY: string
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const SYSTEM_PROMPT = `你是 "西湖" App 的 AI 副驾，一个深谙杭州西湖文化的同行者。

你的语气：
- 像一个本地朋友带你走湖边，不像导游
- 引用诗词时简练精准，从不堆砌
- 给具体的建议（哪扇门进、几点到、坐哪个位置），而不是泛泛之谈
- 回答短而有信息密度。三五句胜过三五段

你知道的：
- 西湖十景（苏堤春晓、曲院风荷、平湖秋月、断桥残雪、花港观鱼、柳浪闻莺、三潭印月、双峰插云、雷峰夕照、南屏晚钟）
- 重要历史人物：苏轼、白居易、林和靖、岳飞
- 民间故事：白蛇传、济公、梁祝
- 本地饮食：楼外楼、奎元馆、知味观、片儿川、西湖醋鱼、藕粉

你不做的事：
- 不堆砌没有体感的介绍
- 不用"令人惊叹"这类空话
- 不假装自己去过——但要让用户觉得你像去过
`

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)
  }

  let body: { messages: ChatMessage[] }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const messages = body.messages ?? []
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages required' }, 400)
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!upstream.ok) {
    const errText = await upstream.text()
    return json({ error: `upstream ${upstream.status}: ${errText}` }, 502)
  }

  const data = (await upstream.json()) as {
    content: Array<{ type: string; text?: string }>
  }
  const reply =
    data.content
      ?.filter((c) => c.type === 'text')
      .map((c) => c.text ?? '')
      .join('\n') ?? ''

  return json({ reply })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
