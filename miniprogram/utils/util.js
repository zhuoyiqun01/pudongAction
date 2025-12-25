// 工具函数库 - 简化为兼容小程序环境

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象或时间戳
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format) {
  if (!date) return ''
  if (!format) format = 'YYYY-MM-DD'

  var d = new Date(date)
  if (isNaN(d.getTime())) return ''

  var year = d.getFullYear()
  var month = String(d.getMonth() + 1).padStart ? String(d.getMonth() + 1).padStart(2, '0') : (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1)
  var day = String(d.getDate()).padStart ? String(d.getDate()).padStart(2, '0') : (d.getDate() < 10 ? '0' : '') + d.getDate()

  return format.replace(/YYYY/g, year).replace(/MM/g, month).replace(/DD/g, day)
}

/**
 * 格式化相对时间
 * @param {Date|string|number} date - 目标日期
 * @returns {string} 相对时间描述
 */
function formatRelativeTime(date) {
  if (!date) return ''

  var now = new Date()
  var target = new Date(date)
  var diff = now - target
  var diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
  var diffHours = Math.floor(diff / (1000 * 60 * 60))
  var diffMinutes = Math.floor(diff / (1000 * 60))

  if (diffDays > 0) {
    return diffDays + '天前'
  } else if (diffHours > 0) {
    return diffHours + '小时前'
  } else if (diffMinutes > 0) {
    return diffMinutes + '分钟前'
  } else {
    return '刚刚'
  }
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
function isValidPhone(phone) {
  var phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

module.exports = {
  formatDate: formatDate,
  formatRelativeTime: formatRelativeTime,
  isValidPhone: isValidPhone
}