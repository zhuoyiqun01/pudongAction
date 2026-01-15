// 云函数：获取活动家列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const { page = 1, limit = 20, street, topic, search } = event

    // 构建查询条件
    let query = {
      published: true
    }

    if (street && street !== 'all') {
      query.street = street
    }

    if (topic && topic !== 'all') {
      // 修改为匹配 topics 数组中的任意一个值
      query.topics = topic
    }

    if (search) {
      query.name = db.RegExp({
        regexp: search,
        options: 'i'
      })
    }

    // 查询总数
    const totalResult = await db.collection('activists')
      .where(query)
      .count()

    // 查询数据
    const skip = (page - 1) * limit
    let dataQuery = db.collection('activists')
      .where(query)
      .orderBy('order', 'desc')
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)

    const result = await dataQuery.get()

    return {
      success: true,
      data: {
        items: result.data,
        total: totalResult.total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalResult.total / limit),
        hasNext: page * limit < totalResult.total,
        hasPrev: page > 1
      },
      message: '获取成功'
    }

  } catch (error) {
    console.error('获取活动家列表失败:', error)
    return {
      success: false,
      message: '获取失败',
      error: error.message
    }
  }
}
