/**
 * 保存图片配置到数据库 - 直接复制粘贴使用
 * 
 * 使用方法：
 * 1. 复制下面的代码
 * 2. 在小程序控制台直接粘贴运行
 * 3. 修改文件 ID 数组
 * 4. 调用 saveBannerImages() 函数
 */

// ========== 复制从这里开始 ==========

// 保存单个图片配置
async function saveSingleImage(config) {
  const { cloudPath, category, name, page, type, order } = config
  
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'uploadImage',
      data: {
        cloudPath: cloudPath,
        category: category,
        name: name,
        page: page,
        type: type,
        order: order
      },
      success: (res) => {
        if (res.result.success) {
          console.log('✅ 保存成功:', res.result.data)
          resolve(res.result.data)
        } else {
          reject(new Error(res.result.message || '保存失败'))
        }
      },
      fail: reject
    })
  })
}

// 批量保存 Banner 图片配置
async function saveBannerImages(cloudFileIDs, page = 'leaders') {
  console.log(`🚀 开始保存 ${cloudFileIDs.length} 个 Banner 图片配置...`)
  
  const results = []
  for (let i = 0; i < cloudFileIDs.length; i++) {
    try {
      const fileName = cloudFileIDs[i].split('/').pop()
      const result = await saveSingleImage({
        cloudPath: cloudFileIDs[i],
        category: 'banner',
        page: page,
        order: i + 1,
        name: fileName.split('.')[0]
      })
      results.push(result)
      console.log(`✅ 进度: ${i + 1}/${cloudFileIDs.length} - ${fileName}`)
    } catch (error) {
      console.error(`❌ 保存失败 (${i + 1}):`, error)
    }
  }
  
  console.log(`🎉 完成！成功保存 ${results.length}/${cloudFileIDs.length} 个配置`)
  return results
}


const bannerFileIDs = [
  'cloud://cloud1-3g71minke37b68b6.636c-cloud1-3g71minke37b68b6-1393420244/images/banner/leaders1.jpeg',
  'cloud://cloud1-3g71minke37b68b6.636c-cloud1-3g71minke37b68b6-1393420244/images/banner/leaders2.jpeg',
  'cloud://cloud1-3g71minke37b68b6.636c-cloud1-3g71minke37b68b6-1393420244/images/banner/leaders3.jpeg',
  'cloud://cloud1-3g71minke37b68b6.636c-cloud1-3g71minke37b68b6-1393420244/images/banner/leaders4.png',
  'cloud://cloud1-3g71minke37b68b6.636c-cloud1-3g71minke37b68b6-1393420244/images/banner/leaders5.jpeg',
  'cloud://cloud1-3g71minke37b68b6.636c-cloud1-3g71minke37b68b6-1393420244/images/banner/leaders6.jpeg',
]

// 执行保存（复制到控制台后会自动执行）
saveBannerImages(bannerFileIDs, 'leaders').then(results => {
  console.log('✅ 全部完成！', results)
  console.log(`成功保存 ${results.length} 个配置`)
  if (typeof wx !== 'undefined') {
    wx.showToast({
      title: `保存成功 ${results.length} 个`,
      icon: 'success',
      duration: 2000
    })
  }
}).catch(error => {
  console.error('❌ 保存过程出错:', error)
  if (typeof wx !== 'undefined') {
    wx.showToast({
      title: '保存失败',
      icon: 'error'
    })
  }
})


