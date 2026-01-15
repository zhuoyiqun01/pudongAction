/**
 * 时间日期格式化工具
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`
    case 'MM/DD':
      return `${month}/${day}`
    default:
      return `${year}-${month}-${day}`
  }
}

/**
 * 文本截断
 */
const truncateText = (text, length = 20) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

module.exports = {
  formatDate,
  truncateText
}

