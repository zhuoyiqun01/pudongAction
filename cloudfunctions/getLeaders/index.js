// 云函数：获取领导者列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const { page = 1, limit = 20, street, search } = event

    // 构建查询条件
    let query = {
      published: true
    }

    // 街道筛选：street 可能是关联数据字段（存储 region 的 _id），也可能是字符串名称
    // 如果 street 未传递、为空字符串或为 'all'，则不添加筛选条件（显示全部地区）
    if (street !== undefined && street !== null && street !== '' && street !== 'all') {
      query.street = street
      console.log('添加街道筛选:', street);
    } else {
      console.log('不添加街道筛选（显示全部地区）');
    }

    if (search) {
      query.name = db.RegExp({
        regexp: search,
        options: 'i'
      })
    }

    // 查询总数
    const totalResult = await db.collection('leaders')
      .where(query)
      .count()

    // 查询数据
    const skip = (page - 1) * limit
    let dataQuery = db.collection('leaders')
      .where(query)
      // 1. 优先把金牌带领人排在最前面 (true > false)
      .orderBy('is_gold_medal', 'desc')
      // 2. 然后再按照后台设置的手动顺序排序
      .orderBy('order', 'desc')
      // 3. 最后按时间倒序
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
    console.error('获取领导者列表失败:', error)
    return {
      success: false,
      message: '获取失败',
      error: error.message
    }
  }
}
