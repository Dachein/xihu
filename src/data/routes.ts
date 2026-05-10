// "半日漫游" 路线：v0 写死，v1 由 AI 按心情/体力/时长重新生成

export type RouteStop = {
  sceneId?: string
  label: string
  note: string
}

export type Route = {
  id: string
  title: string
  duration: string
  vibe: string
  stops: RouteStop[]
}

export const routes: Route[] = [
  {
    id: 'morning-east',
    title: '一个清晨，从断桥到平湖秋月',
    duration: '2 小时',
    vibe: '安静，适合一个人',
    stops: [
      { sceneId: 'duanqiao-canxue', label: '断桥', note: '6:00 到，光最柔' },
      { label: '白堤', note: '走完整条，不要骑车' },
      { sceneId: 'pinghu-qiuyue', label: '平湖秋月', note: '坐石阶最低处吃早点' },
      { label: '楼外楼', note: '7:30 开门，一碗西湖醋鱼汤' },
    ],
  },
  {
    id: 'half-day-poetry',
    title: '半日东坡，沿苏堤一路读诗',
    duration: '3 小时',
    vibe: '文气重，宜带本书',
    stops: [
      { sceneId: 'huagang-guanyu', label: '花港观鱼', note: '从西门入' },
      { sceneId: 'sudi-chunxiao', label: '苏堤', note: '六桥逐一走过' },
      { sceneId: 'quyuan-fenghe', label: '曲院风荷', note: '夏日尤宜' },
      { label: '岳王庙', note: '北山街尾，致意便走' },
    ],
  },
  {
    id: 'sunset-south',
    title: '黄昏，从雷峰塔到一声晚钟',
    duration: '2 小时',
    vibe: '黄昏到入夜，适合两个人',
    stops: [
      { sceneId: 'leifeng-xizhao', label: '雷峰塔下', note: '日落前 40 分钟' },
      { label: '净寺前榕树下', note: '坐 15 分钟' },
      { sceneId: 'nanping-wanzhong', label: '南屏晚钟', note: '17:30 听钟' },
      { label: '河坊街吃晚饭', note: '步行 15 分钟' },
    ],
  },
]
