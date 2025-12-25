// 云函数：用户加入社区
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const { name, phone, street, bio, interests } = event

    // 参数验证
    if (!name || !phone || !street) {
      return {
        success: false,
        message: '请填写必要信息'
      }
    }

    // 检查手机号是否已存在
    const existingUser = await db.collection('join_applications')
      .where({
        phone: phone,
        status: _.neq('rejected') // 排除已拒绝的申请
      })
      .get()

    if (existingUser.data.length > 0) {
      return {
        success: false,
        message: '该手机号已提交过申请'
      }
    }

    // 创建加入申请
    const applicationData = {
      name,
      phone,
      street,
      bio: bio || '',
      interests: interests || [],
      status: 'pending', // 待审核
      openid: wxContext.OPENID,
      unionid: wxContext.UNIONID,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }

    const result = await db.collection('join_applications').add({
      data: applicationData
    })

    return {
      success: true,
      data: {
        id: result._id,
        ...applicationData
      },
      message: '申请提交成功，我们会尽快审核'
    }

  } catch (error) {
    console.error('加入社区申请失败:', error)
    return {
      success: false,
      message: '申请提交失败，请重试',
      error: error.message
    }
  }
}
