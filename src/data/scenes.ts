export type Scene = {
  id: string
  name: string
  pinyin: string
  season: '春' | '夏' | '秋' | '冬' | '四时'
  bestTime: string
  oneLiner: string
  poem: { text: string; author: string; title: string }
  location: string
  walkingTip: string
}

export const scenes: Scene[] = [
  {
    id: 'sudi-chunxiao',
    name: '苏堤春晓',
    pinyin: 'Sūdī Chūnxiǎo',
    season: '春',
    bestTime: '清晨 5:30 - 7:00',
    oneLiner: '六桥烟柳，三月里被东坡的影子唤醒。',
    poem: {
      text: '水光潋滟晴方好，山色空濛雨亦奇。',
      author: '苏轼',
      title: '《饮湖上初晴后雨》',
    },
    location: '西湖西侧，南起南屏山，北至栖霞岭',
    walkingTip: '从南端"映波桥"入，逆光看东岸建筑剪影最美。',
  },
  {
    id: 'quyuan-fenghe',
    name: '曲院风荷',
    pinyin: 'Qǔyuàn Fēnghé',
    season: '夏',
    bestTime: '盛夏清晨 6:00 - 8:00',
    oneLiner: '风吹一池荷，连酿酒的曲香都成了陪衬。',
    poem: {
      text: '毕竟西湖六月中，风光不与四时同。',
      author: '杨万里',
      title: '《晓出净慈寺送林子方》',
    },
    location: '苏堤北端跨虹桥畔',
    walkingTip: '不要走主道，钻进东侧小荷塘，人会少八成。',
  },
  {
    id: 'pinghu-qiuyue',
    name: '平湖秋月',
    pinyin: 'Pínghú Qiūyuè',
    season: '秋',
    bestTime: '中秋前后 19:00 - 21:00',
    oneLiner: '一镜秋水落天上，月色与楼外楼的灯一同摇晃。',
    poem: {
      text: '万顷波平长似镜，四时月好最宜秋。',
      author: '孙锐',
      title: '《平湖秋月》',
    },
    location: '白堤西端，孤山路口',
    walkingTip: '坐在御碑亭石阶最低处，水面就在你脚边。',
  },
  {
    id: 'duanqiao-canxue',
    name: '断桥残雪',
    pinyin: 'Duànqiáo Cánxuě',
    season: '冬',
    bestTime: '雪后初晴的清晨',
    oneLiner: '不是断，是雪化时桥背先露出来——和白蛇撑伞那年一样。',
    poem: {
      text: '断桥是处簇英游，三寸鞋弓步步愁。',
      author: '王洧',
      title: '《断桥残雪》',
    },
    location: '白堤东端',
    walkingTip: '雪天人挤人，错峰走 —— 雪后第二天傍晚，最静。',
  },
  {
    id: 'huagang-guanyu',
    name: '花港观鱼',
    pinyin: 'Huāgǎng Guānyú',
    season: '春',
    bestTime: '4-5 月午后',
    oneLiner: '红鱼在牡丹影子里游，乾隆题字的碑上"鱼"字少一点——少了水，鱼就活不久。',
    poem: {
      text: '花家山下流花港，花著鱼身鱼嘬花。',
      author: '高士奇',
      title: '《花港观鱼》',
    },
    location: '苏堤映波桥西',
    walkingTip: '别只看红鱼池，往西走有片牡丹园，午后三点光最好。',
  },
  {
    id: 'liulang-wenying',
    name: '柳浪闻莺',
    pinyin: 'Liǔlàng Wényīng',
    season: '春',
    bestTime: '4 月清晨 6:00 - 8:00',
    oneLiner: '柳条扫地，莺声从看不见的地方落到耳朵里。',
    poem: {
      text: '柳浪闻莺夹岸俱，香车紫骑似云驱。',
      author: '万达甫',
      title: '《柳浪闻莺》',
    },
    location: '南山路涌金门一带',
    walkingTip: '从涌金门入，沿湖往南走，不要走中央大道。',
  },
  {
    id: 'santan-yinyue',
    name: '三潭印月',
    pinyin: 'Sāntán Yìnyuè',
    season: '秋',
    bestTime: '中秋夜',
    oneLiner: '三座石塔点上烛，每座窗洞映一个月——湖面便有了三十二个月亮。',
    poem: {
      text: '三塔亭亭引碧流，一轮素月印中秋。',
      author: '尹廷高',
      title: '《三潭印月》',
    },
    location: '湖中小瀛洲岛南',
    walkingTip: '中秋夜需提前订船票；非中秋的傍晚也好，没有人挤。',
  },
  {
    id: 'shuangfeng-charuyun',
    name: '双峰插云',
    pinyin: 'Shuāngfēng Chāyún',
    season: '四时',
    bestTime: '雨后初晴',
    oneLiner: '南北高峰各自顶一片云，像两支浸了墨的笔。',
    poem: {
      text: '南北高峰高插天，两峰相对不相连。',
      author: '王守仁',
      title: '《登南高峰》',
    },
    location: '洪春桥畔为最佳观景点',
    walkingTip: '下雨别撤，雨停半小时后云气最浓。',
  },
  {
    id: 'leifeng-xizhao',
    name: '雷峰夕照',
    pinyin: 'Léifēng Xīzhào',
    season: '四时',
    bestTime: '日落前 40 分钟',
    oneLiner: '塔身被夕阳染成铜色那一刻，是白娘子的一千年。',
    poem: {
      text: '保俶如美人，雷峰似老衲。',
      author: '闻起祥',
      title: '题雷峰塔',
    },
    location: '南屏山夕照山',
    walkingTip: '从净慈寺方向看塔，逆光剪影比登塔更值。',
  },
  {
    id: 'nanping-wanzhong',
    name: '南屏晚钟',
    pinyin: 'Nánpíng Wǎnzhōng',
    season: '四时',
    bestTime: '日落后到入夜',
    oneLiner: '净慈寺的钟敲过湖面，雷峰塔下的人都会停下脚步。',
    poem: {
      text: '夜气清浮万象空，孤撞独击度疏钟。',
      author: '尹廷高',
      title: '《南屏晚钟》',
    },
    location: '南屏山净慈寺',
    walkingTip: '17:30 前到寺门口，听完钟再吃晚饭。',
  },
]
