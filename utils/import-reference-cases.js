/**
 * 将 reference-cases 数据导入到数据库的工具脚本
 * 使用方法：在小程序页面中调用此脚本
 */

const importReferenceCases = {
  // 从云函数获取 cases.js 数据并导入到数据库
  async importFromCases() {
    // 通过云函数获取参考案例数据（需要先创建一个临时云函数读取 cases.js）
    // 或者直接传入数据数组
    throw new Error('请使用 importFromArray 方法，直接传入案例数组')
  },

  // 从数组导入数据到数据库（推荐）
  async importFromArray(casesArray) {
    if (!casesArray || casesArray.length === 0) {
      throw new Error('案例数组为空')
    }

    const db = wx.cloud.database()
    const results = []

    // 批量插入（每次最多20条）
    const batchSize = 20
    for (let i = 0; i < casesArray.length; i += batchSize) {
      const batch = casesArray.slice(i, i + batchSize)
      
      // 准备批量插入数据
      const batchData = batch.map((caseText, index) => ({
        text: caseText,
        case: caseText, // 兼容字段
        order: i + index + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      // 使用 Promise.all 并发插入
      const promises = batchData.map(item => 
        db.collection('reference_cases').add({
          data: item
        })
      )

      try {
        const batchResults = await Promise.all(promises)
        results.push(...batchResults)
        console.log(`导入进度: ${Math.min(i + batchSize, casesArray.length)}/${casesArray.length}`)
      } catch (error) {
        console.error(`批量插入失败 (${i}-${i + batchSize}):`, error)
        // 继续处理下一批
      }
    }

    return {
      success: true,
      total: casesArray.length,
      imported: results.length,
      results
    }
  },

  // 从 Excel 导入（需要先转换为 JSON，实际调用 importFromArray）
  async importFromJSON(casesArray) {
    return this.importFromArray(casesArray)
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = importReferenceCases
}

if (typeof wx !== 'undefined') {
  wx.importReferenceCases = importReferenceCases
}

