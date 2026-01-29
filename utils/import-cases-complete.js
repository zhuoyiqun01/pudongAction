/**
 * 完整导入参考案例到数据库的工具
 * 自动从云函数获取 cases.js 数据并导入到数据库
 * 
 * 使用方法：
 * 1. 先部署 exportCases 云函数
 * 2. 在小程序控制台运行：wx.importCasesComplete()
 */

const importCasesComplete = async () => {
  console.log('🚀 开始导入参考案例到数据库...')
  console.log('注意：参考案例存储在云数据库中，不是云存储！')
  
  try {
    // 步骤 1: 从云函数获取 cases.js 数据
    console.log('📥 步骤 1: 从云函数获取参考案例数据...')
    const exportResult = await wx.cloud.callFunction({
      name: 'exportCases'
    })
    
    if (!exportResult.result.success) {
      throw new Error('获取参考案例数据失败: ' + exportResult.result.message)
    }
    
    const REFERENCE_CASES = exportResult.result.data || []
    
    if (REFERENCE_CASES.length === 0) {
      throw new Error('参考案例数据为空')
    }
    
    console.log(`✅ 成功获取 ${REFERENCE_CASES.length} 个参考案例`)
    
    // 步骤 2: 检查数据库中是否已有数据
    console.log('🔍 步骤 2: 检查数据库中是否已有数据...')
    const db = wx.cloud.database()
    const existingResult = await db.collection('reference_cases').count()
    const existingCount = existingResult.total || 0
    
    if (existingCount > 0) {
      const confirm = await new Promise((resolve) => {
        wx.showModal({
          title: '提示',
          content: `数据库中已有 ${existingCount} 条记录，是否继续导入？（将添加新记录）`,
          success: (res) => resolve(res.confirm),
          fail: () => resolve(false)
        })
      })
      
      if (!confirm) {
        console.log('❌ 用户取消导入')
        return { success: false, message: '用户取消导入' }
      }
    }
    
    // 步骤 3: 批量导入到数据库
    console.log('📤 步骤 3: 开始导入到数据库...')
    const results = []
    const batchSize = 20
    
    for (let i = 0; i < REFERENCE_CASES.length; i += batchSize) {
      const batch = REFERENCE_CASES.slice(i, i + batchSize)
      
      const batchData = batch.map((caseText, index) => ({
        text: caseText,
        case: caseText, // 兼容字段
        order: existingCount + i + index + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      
      const promises = batchData.map(item => 
        db.collection('reference_cases').add({
          data: item
        })
      )
      
      try {
        const batchResults = await Promise.all(promises)
        results.push(...batchResults)
        const progress = Math.min(i + batchSize, REFERENCE_CASES.length)
        console.log(`✅ 导入进度: ${progress}/${REFERENCE_CASES.length}`)
        
        // 显示进度提示
        wx.showToast({
          title: `导入中 ${progress}/${REFERENCE_CASES.length}`,
          icon: 'loading',
          duration: 1000
        })
      } catch (error) {
        console.error(`❌ 批量插入失败 (${i}-${i + batchSize}):`, error)
      }
    }
    
    console.log(`🎉 导入完成！成功导入 ${results.length}/${REFERENCE_CASES.length} 个案例`)
    
    wx.showModal({
      title: '导入完成',
      content: `成功导入 ${results.length}/${REFERENCE_CASES.length} 个参考案例到数据库`,
      showCancel: false
    })
    
    return {
      success: true,
      total: REFERENCE_CASES.length,
      imported: results.length,
      existing: existingCount
    }
    
  } catch (error) {
    console.error('❌ 导入失败:', error)
    wx.showModal({
      title: '导入失败',
      content: error.message || '未知错误',
      showCancel: false
    })
    return {
      success: false,
      error: error.message
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { importCasesComplete }
}

// 挂载到全局
if (typeof wx !== 'undefined') {
  wx.importCasesComplete = importCasesComplete
}



