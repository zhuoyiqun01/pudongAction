# 参考案例数据

## 目录说明

这个目录用于存放参考案例的 Excel 文件。

## 使用方法

### 方法一：自动转换（推荐）

1. **安装依赖**
   ```bash
   npm install
   ```

2. **运行转换脚本**
   ```bash
   node data/reference-cases/convert-excel-to-js.js
   ```

3. **完成**
   - 脚本会自动读取 `reference-cases.xlsx`
   - 生成 `cloudfunctions/generateActionSuggestion/cases.js`
   - 检查生成的文件，确认无误后部署云函数

### 方法二：手动导入

1. **打开 Excel 文件**
   - 复制所有案例文本（第一列）

2. **编辑 cases.js**
   - 打开 `cloudfunctions/generateActionSuggestion/cases.js`
   - 将案例粘贴到 `REFERENCE_CASES` 数组中
   - 每个案例用单引号包裹，用逗号分隔

## Excel 格式要求

- **每行一个案例**，放在第一列（A列）
- 第一行可以是标题（会被自动跳过）
- 案例描述要完整、具体
- 确保没有空行（空行会被自动过滤）

## 注意事项

- 每个案例应该是一句完整的话，描述一个具体的社区小事行动
- 案例要温暖、具体、低门槛
- 确保案例描述清晰，便于 AI 理解参考
- 转换后请检查生成的文件，确保格式正确

