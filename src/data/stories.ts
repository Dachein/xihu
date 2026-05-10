export type Story = {
  id: string
  title: string
  anchor: string
  era: string
  excerpt: string
}

export const stories: Story[] = [
  {
    id: 'baishe-duanqiao',
    title: '断桥相遇',
    anchor: '白堤 · 断桥',
    era: '南宋 · 民间',
    excerpt:
      '清明时节，许仙在断桥借伞给一位姓白的小娘子。雨水漫上桥面，谁也没说什么——但那把油纸伞此后，就再没还过。',
  },
  {
    id: 'sushi-shuju',
    title: '苏轼疏湖',
    anchor: '苏堤全段',
    era: '北宋元祐五年 · 1090',
    excerpt:
      '湖被葑草堵了一半，苏轼上任杭州太守。他没有写诗，先调民工二十万，挖出的淤泥垒成一道堤，长二点八公里——后来人叫它苏堤。',
  },
  {
    id: 'linbu-meihe',
    title: '梅妻鹤子',
    anchor: '孤山 · 放鹤亭',
    era: '北宋 · 林逋',
    excerpt:
      '林和靖隐居孤山二十年，不娶不仕，种梅三百株，养两只白鹤。客来时鹤报，他便撑舟回。死后人在山上立"放鹤亭"。',
  },
  {
    id: 'yuefei-fenmu',
    title: '岳王庙',
    anchor: '北山街 · 栖霞岭南麓',
    era: '南宋绍兴十二年 · 1142',
    excerpt:
      '岳飞被害风波亭，二十年后才得以归葬。庙前跪着秦桧夫妇的铁像，每一代游人都吐过它们一口——铁面被磨得发亮。',
  },
  {
    id: 'qiuyue-yongbo',
    title: '秋月与永泊',
    anchor: '平湖秋月 · 御碑亭',
    era: '清乾隆 · 1751',
    excerpt:
      '乾隆六下江南，每到平湖秋月必来题字。他写"水月双清"那一年，江南正大旱——但御船所至，他只看月。',
  },
]
