const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * 计算活动状态
 * @param {Object} activity 活动对象
 * @returns {string} 'ongoing' | 'pending' | 'ended'
 */
function calculateStatus(activity) {
  if (activity.start_time) {
    const now = new Date();
    const startDate = new Date(activity.start_time);
    const endDate = activity.end_time ? new Date(activity.end_time) : null;
    
    if (now < startDate) {
      return 'pending'; // 未开始
    } else if (endDate && now > endDate) {
      return 'ended'; // 已结束
    } else {
      return 'ongoing'; // 进行中
    }
  } else {
    // 长期活动，使用 CMS 手动选择的状态
    return activity.activity_status || 'ongoing';
  }
}

/**
 * 状态优先级：进行中(1) > 未开始(2) > 已结束(3)
 */
function getStatusPriority(status) {
  const priorityMap = {
    'ongoing': 1,
    'pending': 2,
    'ended': 3
  };
  return priorityMap[status] || 3;
}

exports.main = async (event, context) => {
  try {
    const { limit = 20, type = 'all', statusFilter } = event
    
    let query = { 
      published: true 
    }

    // 如果指定了 banner 类型，则只取 banner
    if (type === 'banner') {
      query.isBanner = true
    }

    // 如果指定了状态筛选
    if (statusFilter && statusFilter !== 'all') {
      // 注意：这里不能直接筛选，因为状态是计算出来的
      // 需要在排序后筛选，或者使用更复杂的查询逻辑
    }

    // 先获取所有数据，然后在内存中排序
    const activities = await db.collection('activities')
      .where(query)
      .limit(limit * 5) // 多取一些，排序和筛选后再截取
      .get()
    
    // 计算每个活动的状态
    const activitiesWithStatus = activities.data.map(item => ({
      ...item,
      _status: calculateStatus(item)
    }));

    // 在内存中排序
    let sortedData = activitiesWithStatus.sort((a, b) => {
      // 1. isBanner 优先（true > false）
      const aBanner = a.isBanner === true ? 1 : 0;
      const bBanner = b.isBanner === true ? 1 : 0;
      if (aBanner !== bBanner) return bBanner - aBanner;
      
      // 2. 状态排序：进行中 > 未开始 > 已结束
      const aStatusPriority = getStatusPriority(a._status);
      const bStatusPriority = getStatusPriority(b._status);
      if (aStatusPriority !== bStatusPriority) return aStatusPriority - bStatusPriority;
      
      // 3. 最新编辑优先（updatedAt，如果没有则用 createdAt）
      const aUpdateTime = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const bUpdateTime = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      if (aUpdateTime !== bUpdateTime) return bUpdateTime - aUpdateTime;
      
      // 4. 无日期优先（没有 start_time 的优先）
      const aHasDate = a.start_time ? 1 : 0;
      const bHasDate = b.start_time ? 1 : 0;
      if (aHasDate !== bHasDate) return aHasDate - bHasDate; // 0（无日期）优先于 1（有日期）
      
      // 5. 结束时间早的优先（对于有日期的活动）
      if (a.end_time && b.end_time) {
        const aEndTime = new Date(a.end_time).getTime();
        const bEndTime = new Date(b.end_time).getTime();
        if (aEndTime !== bEndTime) return aEndTime - bEndTime; // 早的优先
      } else if (a.end_time && !b.end_time) {
        return -1; // a 有结束时间，b 没有，a 优先
      } else if (!a.end_time && b.end_time) {
        return 1; // b 有结束时间，a 没有，b 优先
      }
      
      // 6. 最后按 order 排序（数字越小越靠前）
      const aOrder = a.order || 0;
      const bOrder = b.order || 0;
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // 7. 最后按创建时间排序（越新越靠前）
      const aCreateTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreateTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bCreateTime - aCreateTime;
    });

    // 如果指定了状态筛选，进行筛选
    if (statusFilter && statusFilter !== 'all') {
      const now = new Date();
      const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 一周后
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 一周前（用于即将结束）
      
      sortedData = sortedData.filter(item => {
        const status = item._status;
        
        switch (statusFilter) {
          case 'upcoming': // 即将开始：未开始中一周内开始的
            if (status === 'pending' && item.start_time) {
              const startDate = new Date(item.start_time);
              return startDate >= now && startDate <= oneWeekLater;
            }
            return false;
            
          case 'ending_soon': // 即将结束：进行中中一周内结束的
            if (status === 'ongoing' && item.end_time) {
              const endDate = new Date(item.end_time);
              return endDate >= now && endDate <= oneWeekLater;
            }
            return false;
            
          case 'pending': // 未开始
            return status === 'pending';
            
          case 'ongoing': // 进行中
            return status === 'ongoing';
            
          case 'ended': // 已结束
            return status === 'ended';
            
          default:
            return true;
        }
      });
    }

    // 移除临时状态字段
    sortedData = sortedData.map(({ _status, ...item }) => item);

    return {
      success: true,
      data: sortedData.slice(0, limit),
      message: '获取活动成功'
    }
  } catch (e) {
    console.error(e)
    return { success: false, message: e.message }
  }
}
