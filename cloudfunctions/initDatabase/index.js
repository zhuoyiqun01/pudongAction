// 云函数：初始化数据库
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 1. 活动家数据 (Activist Wall)
const ACTIVISTS_DATA = [
  {
    name: '张建国',
    role: '垃圾分类先行者',
    topic: 'environment',
    street: '长寿路街道',
    image: 'https://picsum.photos/seed/a1/800/1000',
    tags: ['环保', '社区'],
    bio: '在社区坚持推广垃圾分类3年...',
    order: 1,
    published: true,
    createdAt: db.serverDate()
  },
  {
    name: '李梅',
    role: '社区花园维护人',
    topic: 'environment',
    street: '曹杨新村街道',
    image: 'https://picsum.photos/seed/a2/800/1000',
    tags: ['园艺', '绿化'],
    bio: '将废弃空地改造为微型花园...',
    order: 2,
    published: true,
    createdAt: db.serverDate()
  },
  {
    name: '王大妈',
    role: '真如织梦人',
    topic: 'culture',
    street: '真如镇街道',
    image: 'https://picsum.photos/seed/a3/800/1000',
    tags: ['编织', '非遗'],
    bio: '传承真如编织技艺...',
    order: 3,
    published: true,
    createdAt: db.serverDate()
  },
  {
    name: '赵工',
    role: '长征维修达人',
    topic: 'environment',
    street: '长征镇',
    image: 'https://picsum.photos/seed/a4/800/1000',
    tags: ['维修', '公益'],
    bio: '免费为邻里修理电器...',
    order: 4,
    published: true,
    createdAt: db.serverDate()
  }
]

// 2. 活动数据 (用于 Banner)
const ACTIVITIES_DATA = [
  {
    title: '社区环保日',
    description: '一起守护我们的绿色家园',
    image: 'https://picsum.photos/seed/banner1/750/400',
    url: '/pages/action/detail?id=1',
    isBanner: true,
    status: 'show',
    order: 1,
    published: true,
    createdAt: db.serverDate()
  },
  {
    title: '邻里读书会',
    description: '分享知识，增进友谊',
    image: 'https://picsum.photos/seed/banner2/750/400',
    url: '/pages/action/detail?id=2',
    isBanner: true,
    status: 'show',
    order: 2,
    published: true,
    createdAt: db.serverDate()
  }
]

// 3. 领导者数据 (Action Bar)
const LEADERS_DATA = [
  {
    name: '倪小倩',
    street: '长征镇',
    community: '象源丽都社区',
    role: '社区书记',
    slogan: '每一个小小的改变，都是社区幸福的起点。',
    contact: '021-12345678',
    photo: 'https://picsum.photos/seed/leader1/400/400',
    published: true,
    order: 1,
    createdAt: db.serverDate()
  }
]

// 4. 配置数据
const REGIONS_DATA = [
  { id: 'all', name: '全部地区', order: 1 },
  { id: '曹杨新村街道', name: '曹杨新村街道', order: 2 },
  { id: '长寿路街道', name: '长寿路街道', order: 3 },
  { id: '甘泉路街道', name: '甘泉路街道', order: 4 },
  { id: '石泉路街道', name: '石泉路街道', order: 5 },
  { id: '宜川路街道', name: '宜川路街道', order: 6 },
  { id: '真如镇街道', name: '真如镇街道', order: 7 },
  { id: '万里街道', name: '万里街道', order: 8 },
  { id: '长征镇', name: '长征镇', order: 9 },
  { id: '桃浦镇', name: '桃浦镇', order: 10 }
]

const TOPICS_DATA = [
  { id: 'all', name: '全部议题', order: 1 },
  { id: 'environment', name: '环保', order: 2 },
  { id: 'culture', name: '文化', order: 3 },
  { id: 'education', name: '教育', order: 4 },
  { id: 'health', name: '健康', order: 5 }
]

exports.main = async (event, context) => {
  try {
    // 依次初始化
    const collections = [
      { name: 'xsxdz', data: ACTIVISTS_DATA },
      { name: 'activities', data: ACTIVITIES_DATA },
      { name: 'leaders', data: LEADERS_DATA },
      { name: 'regions', data: REGIONS_DATA },
      { name: 'topics', data: TOPICS_DATA }
    ]

    for (const col of collections) {
      // 1. 先清空集合 (可选，为了防止重复初始化)
      try {
        await db.collection(col.name).where({
          _id: db.command.exists(true)
        }).remove()
      } catch (e) {
        console.log(`清空 ${col.name} 失败或集合不存在`)
      }

      // 2. 写入新数据
      for (const item of col.data) {
        await db.collection(col.name).add({ data: item })
      }
    }

    return { success: true, message: '数据库初始化及数据更新成功' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
