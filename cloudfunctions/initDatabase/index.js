// 云函数：初始化数据库
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// Mock数据
const ACTIVISTS_DATA = [
  {
    name: '张建国',
    role: '垃圾分类先行者',
    tag: '环保卫士',
    photo: 'https://picsum.photos/seed/a1/800/1000',
    bio: '在社区坚持推广垃圾分类3年，带动了超过200户家庭加入。他相信每一份微小的坚持都能改变环境。',
    street: '长寿路街道',
    order: 5,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    name: '李梅',
    role: '社区花园维护人',
    tag: '绿意使者',
    photo: 'https://picsum.photos/seed/a2/800/1000',
    bio: '将废弃空地改造为微型花园，为邻里提供休闲好去处。她认为自然的绿色是社区最温暖的底色。',
    street: '长寿路街道',
    order: 4,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    name: '王小明',
    role: '爱心助学志愿者',
    tag: '教育辅助',
    photo: 'https://picsum.photos/seed/a3/800/1000',
    bio: '利用周末时间为社区外来务工子弟辅导功课。用知识点亮孩子们的未来。',
    street: '曹杨新村街道',
    order: 3,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    name: '陈大姐',
    role: '邻里调解员',
    tag: '和谐基石',
    photo: 'https://picsum.photos/seed/a4/800/1000',
    bio: '活跃在基层第一线，用耐心和智慧化解邻里纠纷。她是邻里间最信任的"和事佬"。',
    street: '长风新村街道',
    order: 2,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    name: '赵老师',
    role: '银发摄影师',
    tag: '记录者',
    photo: 'https://picsum.photos/seed/a5/800/1000',
    bio: '退休后免费为社区高龄老人拍摄生活照，定格时光中的温暖瞬间。',
    street: '长风新村街道',
    order: 1,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }
]

const LEADERS_DATA = [
  {
    name: '倪小倩',
    street: '长征镇',
    community: '象源丽都社区',
    role: '社区书记',
    slogan: '每一个小小的改变，都是社区幸福的起点。',
    contact: '021-12345678',
    photo: 'https://picsum.photos/seed/leader1/400/400',
    order: 5,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    name: '陈骏',
    street: '曹杨新村街道',
    community: '社区骨干',
    role: '街道专员',
    slogan: '邻里之间，小事里见真情，行动中显担当。',
    contact: '021-22334455',
    photo: 'https://picsum.photos/seed/leader2/400/400',
    order: 4,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    name: '李嘉',
    street: '长寿路街道',
    community: '共建单位负责人',
    role: '社区规划师',
    slogan: '让社区的角落都有光，让居民的愿望都有响。',
    contact: '021-33445566',
    photo: 'https://picsum.photos/seed/leader3/400/400',
    order: 3,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    name: '朱婧婷',
    street: '甘泉路街道',
    community: '社区志愿领头人',
    role: '自治委员会主任',
    slogan: '汇聚微小力量，点亮社区温度。',
    contact: '021-44556677',
    photo: 'https://picsum.photos/seed/leader4/400/400',
    order: 2,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    name: '钱幸',
    street: '万里街道',
    community: '片区管理组',
    role: '社区联络官',
    slogan: '发现身边的美，从一件小事做起。',
    contact: '021-55667788',
    photo: 'https://picsum.photos/seed/leader5/400/400',
    order: 1,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }
]

const ARTICLES_DATA = [
  {
    title: '什么是"社区小事"计划？',
    date: '2024-05-20',
    category: '政策解读',
    summary: '了解我们如何通过微小的行动改变社区生活。',
    image: 'https://picsum.photos/seed/p1/800/400',
    content: '社区小事计划是普陀区委社会工作部、团区委联合大鱼营造发起的开放邻里计划...',
    author: '社区小事团队',
    read_count: 0,
    order: 2,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    title: '基层治理的新路径',
    date: '2024-05-18',
    category: '行业观察',
    summary: 'NGO与政府联手，共同打造韧性社区。',
    image: 'https://picsum.photos/seed/p2/800/400',
    content: '在现代城市治理中，NGO组织与政府部门的合作越来越重要...',
    author: '社区观察者',
    read_count: 0,
    order: 1,
    published: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }
]

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    console.log('开始初始化数据库...')

    // 1. 初始化活动家数据
    console.log('初始化活动家数据...')
    for (const activist of ACTIVISTS_DATA) {
      const result = await db.collection('activists').add({
        data: activist
      })
      console.log(`添加活动家: ${activist.name}, ID: ${result._id}`)
    }

    // 2. 初始化领导者数据
    console.log('初始化领导者数据...')
    for (const leader of LEADERS_DATA) {
      const result = await db.collection('leaders').add({
        data: leader
      })
      console.log(`添加领导者: ${leader.name}, ID: ${result._id}`)
    }

    // 3. 初始化文章数据
    console.log('初始化文章数据...')
    for (const article of ARTICLES_DATA) {
      const result = await db.collection('articles').add({
        data: article
      })
      console.log(`添加文章: ${article.title}, ID: ${result._id}`)
    }

    // 4. 创建索引（可选，提升查询性能）
    console.log('创建数据库索引...')

    return {
      success: true,
      message: '数据库初始化完成',
      data: {
        activistsCount: ACTIVISTS_DATA.length,
        leadersCount: LEADERS_DATA.length,
        articlesCount: ARTICLES_DATA.length
      }
    }

  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      success: false,
      message: '数据库初始化失败',
      error: error.message
    }
  }
}
