// 工具函数库

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象或时间戳
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  const formats = {
    'YYYY': year,
    'MM': month,
    'DD': day,
    'HH': hours,
    'mm': minutes,
    'ss': seconds
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => formats[match])
}

/**
 * 格式化相对时间
 * @param {Date|string|number} date - 目标日期
 * @returns {string} 相对时间描述
 */
function formatRelativeTime(date) {
  if (!date) return ''

  const now = new Date()
  const target = new Date(date)
  const diff = now - target
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diff / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diff / (1000 * 60))

  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小时前`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 截取字符串
 * @param {string} str - 原始字符串
 * @param {number} length - 最大长度
 * @param {string} suffix - 后缀，默认 '...'
 * @returns {string} 截取后的字符串
 */
function truncateText(str, length, suffix = '...') {
  if (!str || str.length <= length) return str
  return str.substring(0, length) + suffix
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间，默认 300ms
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay = 300) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 延迟时间，默认 300ms
 * @returns {Function} 节流后的函数
 */
function throttle(func, delay = 300) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(this, args)
    }
  }
}

/**
 * 获取URL参数
 * @param {string} url - URL字符串
 * @param {string} param - 参数名
 * @returns {string|null} 参数值
 */
function getUrlParam(url, param) {
  const urlObj = new URL(url)
  return urlObj.searchParams.get(param)
}

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
function isValidPhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 数组去重
 * @param {Array} arr - 数组
 * @param {string} key - 对象数组去重时的键名
 * @returns {Array} 去重后的数组
 */
function uniqueArray(arr, key) {
  if (!Array.isArray(arr)) return arr

  if (key) {
    const seen = new Set()
    return arr.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      } else {
        seen.add(value)
        return true
      }
    })
  } else {
    return [...new Set(arr)]
  }
}

/**
 * 数组分组
 * @param {Array} arr - 数组
 * @param {Function} fn - 分组函数
 * @returns {Object} 分组后的对象
 */
function groupBy(arr, fn) {
  return arr.reduce((groups, item) => {
    const key = fn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {})
}

/**
 * 数组排序
 * @param {Array} arr - 数组
 * @param {string} key - 排序键
 * @param {string} order - 排序顺序，'asc' 或 'desc'
 * @returns {Array} 排序后的数组
 */
function sortBy(arr, key, order = 'asc') {
  return arr.sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

module.exports = {
  formatDate,
  formatRelativeTime,
  truncateText,
  deepClone,
  debounce,
  throttle,
  getUrlParam,
  generateUUID,
  isValidPhone,
  isValidEmail,
  uniqueArray,
  groupBy,
  sortBy
}
