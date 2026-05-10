// 前端只调本地的 /api/chat —— 真实 Claude 调用在 Cloudflare Pages Function 里
// v0：Function 还没接 key，先在前端 mock 一段返回，保证体验完整

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const MOCK = true // TODO: 接到真 API 后改 false

export async function chat(messages: ChatMessage[]): Promise<string> {
  if (MOCK) {
    return mockReply(messages[messages.length - 1]?.content ?? '')
  }
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`)
  const data = (await res.json()) as { reply: string }
  return data.reply
}

function mockReply(prompt: string): Promise<string> {
  const reply = pickReply(prompt)
  return new Promise((resolve) => {
    setTimeout(() => resolve(reply), 600 + Math.random() * 400)
  })
}

function pickReply(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes('断桥') || p.includes('白蛇')) {
    return [
      '断桥的"断"，宋人看见的并不是桥本身——是雪化的瞬间，桥的弧背先露出一段，远看像断了。',
      '白蛇传里许仙借伞那一幕，发生在清明时节，但 Tang 末就已经有"段家桥"的记载了。',
      '一个少有人去的角度：站在保俶塔下回望断桥，黄昏时湖面会把整座桥映成两段——这是"断"的另一层意思。',
    ].join('\n\n')
  }
  if (p.includes('苏堤') || p.includes('东坡')) {
    return [
      '苏堤的真正主人不是苏轼，是 1090 年那二十万民工。东坡只是写信向太皇太后要来 100 道度牒，把工程钱凑齐了。',
      '六桥的名字按春夏秋冬排：映波、锁澜、望山、压堤、东浦、跨虹——你走一遍刚好走完四季。',
      '清晨 5:30 从映波桥起步，逆光，每一座桥的背都泛着一层薄银。',
    ].join('\n\n')
  }
  if (p.includes('安排') || p.includes('路线') || p.includes('重排') || p.includes('两小时') || p.includes('小时')) {
    return [
      '基于现在的时令，我给你排一版（可以再迭代）：',
      '1. 涌金门入园（柳浪闻莺）— 15 分钟',
      '2. 沿湖步行至长桥 — 25 分钟，路过净慈寺远观',
      '3. 雷峰塔下小坐 — 40 分钟，正好赶上夕照',
      '4. 南屏晚钟 — 17:30 准时到，听完一记钟再离开',
      '',
      '想换一个心情就告诉我：更安静、更短、更猛、或者只想坐着不走。',
    ].join('\n')
  }
  if (p.includes('吃') || p.includes('喝') || p.includes('饭')) {
    return [
      '湖边正经吃饭三家，按顺序：',
      '· 楼外楼（孤山路）— 西湖醋鱼汤是真的，清蒸不要点',
      '· 奎元馆（解放路）— 片儿川，老杭州早午餐',
      '· 知味观（仁和路）— 猫耳朵，糯',
      '',
      '不正经的：苏堤北边一家无名摊，清晨卖桂花糖藕粥，5 块。我也不知道还在不在。',
    ].join('\n')
  }
  return [
    '这是个好问题。在等真模型接入之前，我先用一段诗回应你：',
    '',
    '「水光潋滟晴方好，山色空濛雨亦奇。」',
    '',
    '把 API key 给我之后，这里会变成 Claude 的真回答——它会知道你正看着哪张卡、此刻几点、季节如何，给你一个真正合此刻的回应。',
  ].join('\n')
}
