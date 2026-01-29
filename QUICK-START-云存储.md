# 云存储快速上手指南

## 📋 准备工作

### 1. 创建数据库集合

在微信云开发控制台创建以下集合：

#### `image_config` 集合
用于存储图片配置

#### `reference_cases` 集合  
用于存储参考案例数据

## 🚀 快速开始

### 步骤 1: 部署云函数

在微信开发者工具中，右键点击以下云函数，选择"上传并部署：云端安装依赖"：

1. ✅ `getImageConfig` - 获取图片配置
2. ✅ `uploadImage` - 保存图片配置
3. ✅ `getReferenceCases` - 获取参考案例

### 步骤 2: 上传图片到云存储

#### 方法 A: 使用临时上传页面（最简单）

1. 在 `miniprogram/pages/` 下创建 `upload-images` 目录
2. 复制以下文件到该目录：
   - `utils/upload-images-page.js` → `pages/upload-images/index.js`
   - `utils/upload-images-page.wxml` → `pages/upload-images/index.wxml`
   - `utils/upload-images-page.wxss` → `pages/upload-images/index.wxss`
3. 在 `app.json` 的 `pages` 数组中添加：
   ```json
   "pages/upload-images/index"
   ```
4. 在小程序中打开该页面，点击"上传所有图片"按钮
5. 等待上传完成

#### 方法 B: 手动上传

1. 打开微信开发者工具 → 云开发 → 存储 → 文件管理
2. **创建新的文件夹**（不要使用 `weda-richtext-upload` 或 `weda-uploader`）：
   - 点击"新建文件夹"，创建 `images` 文件夹
   - 在 `images` 下创建子文件夹：
     ```
     images/
     ├── banner/    ← 新建这个
     ├── icon/      ← 新建这个
     └── tabbar/    ← 新建这个（可选）
     ```
3. 逐个上传图片文件到对应文件夹
4. 上传完成后，在小程序控制台运行：

```javascript
// 获取上传后的文件 ID，然后保存配置
const fileIDs = [
  'cloud://xxx.xxx/images/banner/leaders1.jpeg',
  // ... 其他文件
]

// 批量保存配置
for (let i = 0; i < fileIDs.length; i++) {
  wx.cloud.callFunction({
    name: 'uploadImage',
    data: {
      cloudPath: fileIDs[i],
      category: 'banner',
      page: 'leaders',
      order: i + 1
    }
  })
}
```

### 步骤 3: 导入参考案例数据

#### 方法 A: 使用小程序控制台

在小程序控制台运行：

```javascript
// 1. 先获取 cases.js 的数据（需要创建一个临时云函数读取）
// 或者直接复制数据

// 2. 导入数据
const importTool = require('./utils/import-reference-cases.js')
const casesArray = [
  '邀请一位或多位社区里的伙伴一起进行一次社区观察',
  '在街坊群发起「社区老照片征集」...',
  // ... 复制所有案例
]

importTool.importFromArray(casesArray).then(result => {
  console.log('导入完成:', result)
})
```

#### 方法 B: 使用云开发 CMS

1. 打开云开发控制台 → CMS 内容管理
2. 选择 `reference_cases` 集合
3. 点击"导入数据"
4. 从 Excel 或 JSON 文件导入

### 步骤 4: 验证

1. **验证图片加载**：
   - 打开"带领人"页面，检查 Banner 是否正常显示
   - 如果显示正常，说明云存储配置成功

2. **验证参考案例**：
   - 打开"小事生成器"页面
   - 输入关键词，生成建议
   - 如果生成正常，说明参考案例数据加载成功

## ⚠️ 重要提示

### TabBar 图标限制

**TabBar 图标必须使用本地路径**，不能使用云存储 URL！

微信小程序的原生 TabBar 只支持本地路径。如果需要动态 TabBar，必须使用自定义 TabBar 组件（你已经在使用 `custom-tab-bar`）。

如果你想让 TabBar 图标也使用云存储，需要：
1. 在 `custom-tab-bar/index.js` 的 `attached` 生命周期中加载图标
2. 使用云存储 URL 更新 `tabbarList` 中的图标路径

### 图片加载失败处理

代码已经添加了失败回退机制：
- 如果云存储加载失败，会自动使用本地图片路径
- 确保本地图片文件仍然存在作为备份

### 参考案例数据

- 云函数会优先从数据库获取参考案例
- 如果数据库没有数据，会使用本地 `cases.js` 作为兜底
- 建议先导入数据到数据库，再删除本地 `cases.js` 文件以减小云函数体积

## 🔧 故障排查

### 问题：图片不显示

1. 检查云存储文件是否上传成功
2. 检查 `image_config` 集合中是否有对应配置
3. 检查云函数 `getImageConfig` 是否部署成功
4. 查看小程序控制台是否有错误信息

### 问题：参考案例加载失败

1. 检查 `reference_cases` 集合中是否有数据
2. 检查云函数 `getReferenceCases` 是否部署成功
3. 查看云函数日志是否有错误

### 问题：云函数体积过大

1. 确保已创建 `.gitignore` 和 `.npmignore` 排除 `node_modules`
2. 上传时选择"云端安装依赖"
3. 删除 `cases.js` 文件（如果已导入数据库）

## 📝 下一步

迁移完成后，可以：

1. ✅ 删除本地图片文件（保留备份）
2. ✅ 删除 `cases.js` 文件（如果已导入数据库）
3. ✅ 优化图片加载性能（添加缓存、压缩等）
4. ✅ 在 CMS 中管理图片和案例数据

