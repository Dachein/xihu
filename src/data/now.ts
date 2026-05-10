// "此刻"卡片：未来 v1 由 AI 根据 GPS + 天气 + 时辰生成
// v0：根据当前月份硬编码到时令推荐

import type { Scene } from './scenes'
import { scenes } from './scenes'

export type NowSuggestion = {
  greeting: string
  headline: string
  body: string
  sceneId: Scene['id']
}

const monthlyPlan: Record<number, NowSuggestion> = {
  1: {
    greeting: '一月，残冬',
    headline: '断桥未必有雪，但梅花已开',
    body: '孤山上的梅花开得最早。趁人少，先去林和靖的旧居，再绕到断桥——即便没雪，桥头清晨的薄霜也是有的。',
    sceneId: 'duanqiao-canxue',
  },
  2: {
    greeting: '二月，立春',
    headline: '柳还没绿，但风变软了',
    body: '柳浪闻莺的柳条已经开始抽芽。从涌金门入园，午后阳光斜照，柳条的金色比绿色更动人。',
    sceneId: 'liulang-wenying',
  },
  3: {
    greeting: '三月，惊蛰',
    headline: '苏堤，该走一遭了',
    body: '六桥烟柳正盛，建议清晨 5:30 从映波桥起步，逆光看东岸——这是东坡九百年前留给你的赠礼。',
    sceneId: 'sudi-chunxiao',
  },
  4: {
    greeting: '四月，清明',
    headline: '花港的牡丹，鱼池西边',
    body: '红鱼池人多，但西边那片牡丹园午后三点光线最好。绕开主道，直奔牡丹。',
    sceneId: 'huagang-guanyu',
  },
  5: {
    greeting: '五月，立夏',
    headline: '柳已成绿幕，是时候听莺',
    body: '柳浪闻莺最盛在四月底到五月中。清晨 6 点从涌金门入，沿湖往南走，不要中央大道。',
    sceneId: 'liulang-wenying',
  },
  6: {
    greeting: '六月，盛夏',
    headline: '风光不与四时同',
    body: '杨万里说的就是六月的曲院风荷。清晨 6 点到 8 点，风吹一池荷——钻东侧小荷塘，人少八成。',
    sceneId: 'quyuan-fenghe',
  },
  7: {
    greeting: '七月，三伏',
    headline: '清晨上山，雨后看云',
    body: '太热，避开正午。雨后初晴去看双峰插云：南北两座高峰各顶一片云，像浸了墨的笔。',
    sceneId: 'shuangfeng-charuyun',
  },
  8: {
    greeting: '八月，立秋',
    headline: '荷已残，月将圆',
    body: '荷花的尾声，月亮的开端。中秋前的几个夜晚，平湖秋月的水面已经开始练习反光。',
    sceneId: 'pinghu-qiuyue',
  },
  9: {
    greeting: '九月，中秋',
    headline: '三潭印月，一年一次',
    body: '三座石塔点烛，每座窗洞映一个月，湖面三十二个月亮。中秋夜需提前订船票，非中秋的傍晚去也好。',
    sceneId: 'santan-yinyue',
  },
  10: {
    greeting: '十月，寒露',
    headline: '雷峰夕照，铜色的一千年',
    body: '日落前 40 分钟到南屏山，从净慈寺方向看塔。逆光剪影比登塔更值——白娘子的一千年就在那一刻。',
    sceneId: 'leifeng-xizhao',
  },
  11: {
    greeting: '十一月，深秋',
    headline: '听一声南屏晚钟',
    body: '17:30 前到净慈寺门口。钟敲过湖面，雷峰塔下的人都会停。听完再吃饭。',
    sceneId: 'nanping-wanzhong',
  },
  12: {
    greeting: '十二月，初冬',
    headline: '等一场雪',
    body: '断桥残雪不是真断，是雪化时桥背先露。如果落了雪，第二天傍晚去——人最少，景最白。',
    sceneId: 'duanqiao-canxue',
  },
}

export function getNowSuggestion(date = new Date()): NowSuggestion {
  return monthlyPlan[date.getMonth() + 1] ?? monthlyPlan[5]
}

export function getSceneById(id: string): Scene | undefined {
  return scenes.find((s) => s.id === id)
}
