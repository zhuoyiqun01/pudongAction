// 将 Excel 文件转换为 cases.js
// 使用方法：node convert-excel-to-js.js

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 读取 Excel 文件
const excelPath = path.join(__dirname, 'reference-cases.xlsx');
const outputPath = path.join(__dirname, '../../cloudfunctions/generateActionSuggestion/cases.js');

try {
  // 读取 Excel 文件
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0]; // 读取第一个工作表
  const worksheet = workbook.Sheets[sheetName];
  
  // 转换为 JSON 数组
  const data = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1, // 使用数组格式，第一行也是数据
    defval: '' // 空单元格默认值
  });
  
  // 提取所有案例（过滤空行）
  const cases = [];
  data.forEach((row, index) => {
    // 取第一列的内容
    const caseText = row[0];
    if (caseText && typeof caseText === 'string' && caseText.trim()) {
      cases.push(caseText.trim());
    }
  });
  
  // 生成 JavaScript 代码
  const jsCode = `// 参考案例数据
// 自动生成于 ${new Date().toLocaleString('zh-CN')}
// 共 ${cases.length} 个案例

const REFERENCE_CASES = [
${cases.map(c => `  '${c.replace(/'/g, "\\'")}'`).join(',\n')}
]

module.exports = REFERENCE_CASES
`;
  
  // 写入文件
  fs.writeFileSync(outputPath, jsCode, 'utf8');
  
  console.log(`✅ 成功转换！`);
  console.log(`   - 读取文件: ${excelPath}`);
  console.log(`   - 输出文件: ${outputPath}`);
  console.log(`   - 案例数量: ${cases.length}`);
  console.log(`\n📝 请检查生成的文件，确认无误后部署云函数。`);
  
} catch (error) {
  console.error('❌ 转换失败:', error.message);
  console.error('\n请确保：');
  console.error('1. 已安装 xlsx 依赖: npm install xlsx');
  console.error('2. Excel 文件存在: reference-cases.xlsx');
  console.error('3. Excel 文件格式正确（第一列是案例描述）');
  process.exit(1);
}



