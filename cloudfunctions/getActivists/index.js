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

    console.log('getActivists 接收参数:', { page, limit, street, topic, search });

    // 构建查询条件
    let query = {
      published: true
    }

    // 街道筛选：street 是关联数据字段，存储的是 region 的 _id
    // 如果 street 未传递、为空字符串或为 'all'，则不添加筛选条件（显示全部地区）
    if (street !== undefined && street !== null && street !== '' && street !== 'all') {
      query.street = street
      console.log('添加街道筛选:', street);
    } else {
      console.log('不添加街道筛选（显示全部地区）');
    }

    // 议题筛选：topics 是数组字段，匹配数组中的任意一个值
    // 微信云数据库：对于数组字段，使用 query.topics = value 会自动匹配数组中包含该值的文档
    // 注意：需要同时支持数字和字符串格式，因为 CMS 可能存储为字符串数组
    if (topic && topic !== 'all' && topic !== '') {
      // 将字符串转换为数字（如果前端传递的是字符串）
      let topicId;
      if (typeof topic === 'string') {
        topicId = topic === 'all' ? null : parseInt(topic);
      } else {
        topicId = topic;
      }
      
      if (topicId !== null && !isNaN(topicId)) {
        // 对于数组字段，直接使用等于查询会自动匹配数组中包含该值的文档
        // 微信云数据库：query.topics = 1 会匹配 topics: [1, 2]
        // 但如果数据库中存储的是字符串数组 ["1", "2"]，需要查询字符串格式
        // 先尝试数字查询，如果查询结果为空，再尝试字符串查询
        query.topics = topicId;
        console.log('添加议题筛选（数字）:', topicId, '类型:', typeof topicId);
      } else {
        console.warn('议题ID不是有效数字:', topic, '转换后:', topicId);
      }
    } else {
      console.log('不添加议题筛选（显示全部议题）');
    }

    // 搜索：按姓名搜索
    if (search && search.trim()) {
      query.name = db.RegExp({
        regexp: search.trim(),
        options: 'i'
      })
      console.log('添加搜索条件:', search.trim());
    }

    console.log('最终查询条件:', JSON.stringify(query));
    console.log('查询条件详情:', {
      published: query.published,
      street: query.street || '未设置（全部地区）',
      topics: query.topics || '未设置（全部议题）',
      name: query.name ? '已设置（搜索）' : '未设置'
    });

    // 查询总数
    const totalResult = await db.collection('activists')
      .where(query)
      .count()

    console.log('查询总数:', totalResult.total);
    if (totalResult.total === 0) {
      console.warn('查询总数为 0，可能的原因：');
      console.warn('1. 数据库中没有 published: true 的数据');
      if (query.street) console.warn('2. 街道筛选条件不匹配:', query.street);
      if (query.topics) console.warn('3. 议题筛选条件不匹配:', query.topics);
    }

    // 查询数据
    const skip = (page - 1) * limit
    let dataQuery = db.collection('activists')
      .where(query)
      .orderBy('order', 'desc')
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)

    let result = await dataQuery.get()

    console.log('查询结果数量:', result.data.length);
    
    // 如果查询结果为空，且设置了议题筛选，尝试用字符串格式查询
    // 因为 CMS 可能存储为字符串数组 ["1", "2"]，而查询使用的是数字 1
    if (result.data.length === 0 && topic && topic !== 'all' && topic !== '') {
      const topicId = typeof topic === 'string' ? parseInt(topic) : topic;
      if (!isNaN(topicId)) {
        console.log('数字查询无结果，尝试字符串格式查询:', String(topicId));
        // 尝试字符串格式查询
        const stringQuery = { ...query };
        stringQuery.topics = String(topicId);
        const stringResult = await db.collection('activists')
          .where(stringQuery)
          .orderBy('order', 'desc')
          .orderBy('createdAt', 'desc')
          .skip(skip)
          .limit(limit)
          .get();
        
        if (stringResult.data.length > 0) {
          console.log('字符串格式查询成功，结果数量:', stringResult.data.length);
          result = stringResult;
          // 更新总数
          const stringTotalResult = await db.collection('activists')
            .where(stringQuery)
            .count();
          totalResult.total = stringTotalResult.total;
        } else {
          console.log('字符串格式查询也无结果');
        }
      }
    }
    
    if (result.data.length > 0) {
      console.log('第一条数据示例:', {
        _id: result.data[0]._id,
        name: result.data[0].name,
        street: result.data[0].street,
        topics: result.data[0].topics,
        topicsType: typeof result.data[0].topics,
        topicsIsArray: Array.isArray(result.data[0].topics)
      });
      if (Array.isArray(result.data[0].topics) && result.data[0].topics.length > 0) {
        console.log('topics 第一个元素:', result.data[0].topics[0], '类型:', typeof result.data[0].topics[0]);
      }
    } else {
      console.log('没有查询到数据，检查数据库中的 topics 字段格式');
      // 查询一条数据看看格式
      const sampleRes = await db.collection('activists')
        .where({ published: true })
        .limit(1)
        .get();
      if (sampleRes.data.length > 0) {
        const sample = sampleRes.data[0];
        console.log('示例数据 topics 字段:', sample.topics);
        console.log('topics 类型:', typeof sample.topics);
        console.log('topics 是否为数组:', Array.isArray(sample.topics));
        if (Array.isArray(sample.topics) && sample.topics.length > 0) {
          console.log('topics 第一个元素:', sample.topics[0], '类型:', typeof sample.topics[0]);
        }
      }
    }

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
