// 云函数：初始化数据库
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 1. 活动家数据 (Activist Wall)
const ACTIVISTS_DATA = [
  {
    _id: 'activist_1', 
    name: '张建国',
    topics: ['environment'], // 改为数组，支持多选
    street: '长寿路街道',
    keyword: '持之以恒',
    image: 'https://picsum.photos/seed/a1/800/1000',
    action_image: 'https://picsum.photos/seed/a1_action/800/600',
    feeling_image: 'https://picsum.photos/seed/a1_feeling/800/600',
    tags: ['环保', '社区'],
    bio: '<p>张建国是长寿路街道的一名退休职工，自2021年起就投身于社区的<b>垃圾分类</b>推广工作。</p><p>他不仅自己做，还带着邻居一起做，通过“垃圾换绿植”的小活动，让原本枯燥的环保变成了一种社区时尚。</p>',
    order: 1,
    published: true,
    createdAt: db.serverDate()
  },
  {
    _id: 'activist_2',
    name: '李梅',
    topics: ['environment', 'health'], // 示例：多选议题
    street: '曹杨新村街道',
    keyword: '自然治愈',
    image: 'https://picsum.photos/seed/a2/800/800',
    action_image: 'https://picsum.photos/seed/a2_action/800/600',
    feeling_image: 'https://picsum.photos/seed/a2_feeling/800/600',
    tags: ['园艺', '绿化'],
    bio: '<p>李梅是一名景观设计师，她利用业余时间将楼下的<b>废弃空地</b>改造成了一个充满生机的微型花园。</p><p>这里现在成了邻里交流的热门场所，孩子们在这里观察植物成长，老人们在这里晒太阳聊天。</p>',
    order: 2,
    published: true,
    createdAt: db.serverDate()
  },
  {
    _id: 'activist_3',
    name: '王大妈',
    topics: ['culture'],
    street: '真如镇街道',
    keyword: '传统传承',
    image: 'https://picsum.photos/seed/a3/1000/800',
    action_image: 'https://picsum.photos/seed/a3_action/800/600',
    feeling_image: 'https://picsum.photos/seed/a3_feeling/800/600',
    tags: ['编织', '非遗'],
    bio: '<p>王大妈是真如镇街道有名的编织达人。她发起了一场名为<b>“真如织梦”</b>的公益活动，教授年轻一代传统的编织技艺。</p><p>通过一针一线，不仅传承了非遗，更拉近了社区里不同年龄层之间的距离。</p>',
    order: 3,
    published: true,
    createdAt: db.serverDate()
  },
  {
    _id: 'activist_4',
    name: '赵工',
    topics: ['environment'],
    street: '长征镇',
    keyword: '热心公益',
    image: 'https://picsum.photos/seed/a4/800/1200',
    action_image: 'https://picsum.photos/seed/a4_action/800/600',
    feeling_image: 'https://picsum.photos/seed/a4_feeling/800/600',
    tags: ['维修', '公益'],
    bio: '<p>赵工是长征镇的一名电工技术骨干。他利用周末时间，长期坚持为社区的老弱病残家庭<b>免费提供电器维修</b>服务。</p><p>在他的影响下，越来越多有技术专长的年轻人也加入了这个公益维修小分队。</p>',
    order: 4,
    published: true,
    createdAt: db.serverDate()
  }
]

// 2. 活动数据 (用于 Banner 和 列表)
const ACTIVITIES_DATA = [
  {
    _id: 'banner_1',
    name: '社区环保日',
    title: '社区环保日',
    description: '一起守护我们的绿色家园',
    intro: '<p>为了增强居民的环保意识，我们发起了一场别开生面的<b>社区环保日</b>活动。</p><p>活动内容包括：垃圾分类趣味竞赛、旧物改造工作坊、绿色植物认领等。欢迎全家总动员，一起来参与！</p>',
    image: 'https://picsum.photos/seed/banner1/750/400',
    type: '环保行动',
    // 改为 Date 对象，便于逻辑筛选
    start_time: new Date('2026-03-12T09:00:00'),
    end_time: new Date('2026-03-12T12:00:00'),
    time_display: '2026-03-12 09:00', // 保留一个展示用的字符串
    address: '普陀区长寿路街道中心广场',
    url: '/pages/activity-detail/index?id=banner_1',
    isBanner: true,
    status: 'show',
    order: 1,
    published: true,
    createdAt: db.serverDate()
  },
  {
    _id: 'banner_2',
    name: '邻里读书会',
    title: '邻里读书会',
    description: '分享知识，增进友谊',
    intro: '<p>在这个快节奏的时代，让我们慢下来，享受阅读的乐趣。<b>邻里读书会</b>诚邀您共读好书。</p><p>本期主题：《社区营造的艺术》。现场将提供精美茶点，并有资深书友分享感悟。</p>',
    image: 'https://picsum.photos/seed/banner2/750/400',
    type: '文化沙龙',
    start_time: new Date('2026-03-15T14:00:00'),
    end_time: new Date('2026-03-15T17:00:00'),
    time_display: '2026-03-15 14:00',
    address: '曹杨新村街道文化活动中心302室',
    url: '/pages/activity-detail/index?id=banner_2',
    isBanner: true,
    status: 'show',
    order: 2,
    published: true,
    createdAt: db.serverDate()
  },
  {
    _id: 'banner_3',
    name: '社区艺术展',
    title: '社区艺术展',
    description: '发现身边的生活美学',
    intro: '<p>艺术不应只在美术馆，它就在我们的街巷之间。<b>社区艺术展</b>展出了由居民创作的50余件作品。</p><p>包括摄影、绘画、手工艺品等，记录了社区的点滴变化。欢迎前来观展并为您喜欢的作品投上一票。</p>',
    image: 'https://picsum.photos/seed/banner3/750/400',
    type: '艺术展览',
    start_time: new Date('2026-03-20T09:00:00'),
    end_time: new Date('2026-03-30T18:00:00'),
    time_display: '2026-03-20 至 03-30',
    address: '石泉路街道社区党群服务中心一楼大厅',
    url: '/pages/activity-detail/index?id=banner_3',
    isBanner: true,
    status: 'show',
    order: 3,
    published: true,
    createdAt: db.serverDate()
  },
  {
    _id: 'banner_4',
    name: '闲置物交换',
    title: '闲置物交换',
    description: '让爱心与旧物继续流动',
    intro: '<p>您的闲置，或许是邻居的心头好。加入<b>闲置物交换</b>市集，让资源循环利用。</p><p>请携带洗净晾干的旧物前往现场（书籍、玩具、小家电等均可）。以物换物，让爱流转。</p>',
    image: 'https://picsum.photos/seed/banner4/750/400',
    type: '公益市集',
    start_time: new Date('2026-03-25T10:00:00'),
    end_time: new Date('2026-03-25T16:00:00'),
    time_display: '2026-03-25 10:00-16:00',
    address: '真如镇街道真如绿廊入口',
    url: '/pages/activity-detail/index?id=banner_4',
    isBanner: true,
    status: 'show',
    order: 4,
    published: true,
    createdAt: db.serverDate()
  }
]

// 3. 领导者数据 (Action Bar)
const LEADERS_DATA = [
  {
    _id: 'leader_1',
    name: '倪小倩',
    street: '长征镇',
    community: '象源丽都社区',
    role: '社区书记',
    slogan: '每一个小小的改变，都是社区幸福的起点。',
    contact: '13800000001',
    wechat_id: 'nini_123',
    photo: 'https://picsum.photos/seed/leader1/400/400',
    published: true,
    is_gold_medal: true,
    order: 1,
    createdAt: db.serverDate()
  }
]

// 4. 配置数据
const REGIONS_DATA = [
  { _id: 'reg_1', id: 'all', name: '全部地区', order: 1 },
  { _id: 'reg_2', id: '曹杨新村街道', name: '曹杨新村街道', order: 2 },
  { _id: 'reg_3', id: '长寿路街道', name: '长寿路街道', order: 3 },
  { _id: 'reg_4', id: '甘泉路街道', name: '甘泉路街道', order: 4 },
  { _id: 'reg_5', id: '石泉路街道', name: '石泉路街道', order: 5 },
  { _id: 'reg_6', id: '宜川路街道', name: '宜川路街道', order: 6 },
  { _id: 'reg_7', id: '真如镇街道', name: '真如镇街道', order: 7 },
  { _id: 'reg_8', id: '万里街道', name: '万里街道', order: 8 },
  { _id: 'reg_9', id: '长征镇', name: '长征镇', order: 9 },
  { _id: 'reg_10', id: '桃浦镇', name: '桃浦镇', order: 10 }
]

const TOPICS_DATA = [
  { _id: 'top_1', id: 'all', name: '全部议题', order: 1 },
  { _id: 'top_2', id: 'environment', name: '环保', order: 2 },
  { _id: 'top_3', id: 'culture', name: '文化', order: 3 },
  { _id: 'top_4', id: 'education', name: '教育', order: 4 },
  { _id: 'top_5', id: 'health', name: '健康', order: 5 }
]

exports.main = async (event, context) => {
  try {
    const collections = [
      { name: 'activists', data: ACTIVISTS_DATA },
      { name: 'activities', data: ACTIVITIES_DATA },
      { name: 'leaders', data: LEADERS_DATA },
      { name: 'regions', data: REGIONS_DATA },
      { name: 'topics', data: TOPICS_DATA }
    ]

    for (const col of collections) {
      console.log(`正在同步集合: ${col.name}`)
      for (const item of col.data) {
        const { _id, ...data } = item
        // 使用 doc(_id).set() 实现幂等更新
        await db.collection(col.name).doc(_id).set({
          data: {
            ...data,
            updatedAt: db.serverDate()
          }
        })
      }
    }

    return { 
      success: true, 
      message: '数据库初始化成功（已更新为 Date 类型及数组议题）' 
    }
  } catch (error) {
    console.error('初始化失败:', error)
    return { success: false, message: error.message }
  }
}
