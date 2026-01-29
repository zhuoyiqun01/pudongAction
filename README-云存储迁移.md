# 云存储迁移指南

## 概述

将图片资源（Banner、Icon、TabBar Icon）和参考案例数据迁移到云存储和数据库，减少小程序包体积和云函数体积。

## 步骤 1: 创建数据库集合

在微信云开发控制台创建以下集合：

### 1. `image_config` 集合
用于存储图片配置信息

**字段结构：**
- `category` (String): 'banner' | 'icon' | 'tabbar'
- `cloudPath` (String): 云存储路径
- `url` (String): 图片 URL（兼容字段）
- `name` (String, 可选): 图片名称（用于 icon）
- `page` (String, 可选): 所属页面 'leaders' | 'activists' | 'home' | 'generator' | 'action-hub'
- `type` (String, 可选): 类型 'icon' | 'selectedIcon'（用于 tabbar）
- `order` (Number, 可选): 排序（用于 banner）
- `createdAt` (Date): 创建时间
- `updatedAt` (Date): 更新时间

### 2. `reference_cases` 集合
用于存储参考案例数据

**字段结构：**
- `text` (String): 案例文本
- `case` (String): 案例文本（兼容字段）
- `order` (Number): 排序
- `createdAt` (Date): 创建时间
- `updatedAt` (Date): 更新时间

## 步骤 2: 部署云函数

在微信开发者工具中部署以下云函数：

1. **getImageConfig** - 获取图片配置
2. **uploadImage** - 保存图片配置（图片已上传）
3. **getReferenceCases** - 获取参考案例

## 步骤 3: 上传图片到云存储

### 方法一：使用临时上传页面（推荐）

1. 在 `miniprogram/pages/` 下创建 `upload-images` 页面
2. 将 `utils/upload-images-page.js`、`.wxml`、`.wxss` 复制到该页面
3. 在 `app.json` 的 `pages` 数组中添加 `pages/upload-images/index`
4. 在小程序中打开该页面，点击"上传所有图片"按钮
5. 上传完成后，可以在云开发控制台的 `image_config` 集合中查看

### 方法二：手动上传

1. 在微信开发者工具中打开云开发控制台
2. 进入"存储" -> "文件管理"
3. 创建以下目录结构：
   ```
   images/
   ├── banner/
   ├── icon/
   └── tabbar/
   ```
4. 逐个上传图片文件
5. 上传完成后，使用云函数 `uploadImage` 保存配置

### 方法三：使用工具脚本

在小程序控制台或临时页面中运行：

```javascript
const uploadTool = require('./utils/upload-images-to-cloud.js')

// 上传所有图片
uploadTool.uploadAll().then(results => {
  console.log('上传完成:', results)
})
```

## 步骤 4: 导入参考案例数据

### 方法一：使用工具脚本

在小程序控制台或临时页面中运行：

```javascript
const importTool = require('./utils/import-reference-cases.js')

// 从 cases.js 导入
importTool.importFromCases().then(result => {
  console.log('导入完成:', result)
})
```

### 方法二：使用云开发 CMS

1. 在云开发控制台打开 CMS 内容管理
2. 选择 `reference_cases` 集合
3. 批量导入数据（从 Excel 或 JSON）

## 步骤 5: 修改代码使用云存储

### 5.1 修改图片加载逻辑

**修改 `miniprogram/pages/leaders/index.js`:**

```javascript
// 在 onLoad 中加载图片配置
async loadImageConfig() {
  try {
    const result = await wx.cloud.callFunction({
      name: 'getImageConfig',
      data: { type: 'banners' }
    })
    
    if (result.result.success) {
      const banners = result.result.data
        .filter(item => item.page === 'leaders')
        .sort((a, b) => a.order - b.order)
        .map(item => item.url)
      
      this.setData({ banners })
    }
  } catch (error) {
    console.error('加载图片配置失败:', error)
  }
}
```

**修改 `miniprogram/custom-tab-bar/index.js`:**

```javascript
// 在 attached 生命周期中加载 TabBar 图标
async loadTabBarIcons() {
  try {
    const result = await wx.cloud.callFunction({
      name: 'getImageConfig',
      data: { type: 'tabbar' }
    })
    
    if (result.result.success) {
      const tabbarData = result.result.data
      const tabbarList = this.data.tabbarList.map((item, index) => {
        const page = item.pagePath.split('/').pop().replace('.html', '')
        const config = tabbarData.find(t => t.page === page)
        
        if (config) {
          return {
            ...item,
            iconPath: config.type === 'icon' ? config.url : item.iconPath,
            selectedIconPath: config.type === 'selectedIcon' ? config.url : item.selectedIconPath
          }
        }
        return item
      })
      
      this.setData({ tabbarList })
    }
  } catch (error) {
    console.error('加载 TabBar 图标失败:', error)
  }
}
```

### 5.2 修改参考案例加载

**修改 `cloudfunctions/generateActionSuggestion/index.js`:**

```javascript
// 替换本地 cases.js 导入
// const REFERENCE_CASES = require('./cases.js')

// 改为从云函数获取
async function getReferenceCases(angle = null) {
  const result = await cloud.callFunction({
    name: 'getReferenceCases',
    data: { angle }
  })
  
  if (result.result.success) {
    return result.result.data
  }
  
  // 兜底：返回空数组或默认案例
  return []
}

// 在 main 函数中使用
exports.main = async (event, context) => {
  const { keyword, angle } = event
  
  // 获取参考案例
  const REFERENCE_CASES = await getReferenceCases(angle)
  
  // ... 后续逻辑
}
```

## 步骤 6: 清理本地资源（可选）

迁移完成后，可以删除本地图片文件以减小小程序包体积：

1. 备份 `miniprogram/images/` 目录
2. 删除已上传的图片文件
3. 保留必要的占位图片（如果需要）

## 注意事项

1. **TabBar 图标限制**: TabBar 图标必须使用本地路径，不能使用云存储 URL。如果需要动态 TabBar，需要使用自定义 TabBar 组件。

2. **图片加载性能**: 使用云存储 URL 时，建议：
   - 使用 CDN 加速
   - 添加图片加载失败的回退处理
   - 考虑使用图片压缩

3. **数据迁移**: 迁移参考案例数据时，建议：
   - 先在测试环境验证
   - 保留本地 cases.js 作为备份
   - 逐步迁移，确保功能正常

4. **云函数体积**: 迁移参考案例到数据库后，可以删除 `cloudfunctions/generateActionSuggestion/cases.js` 文件，减小云函数体积。

## 验证

迁移完成后，验证以下功能：

- [ ] Banner 图片正常显示
- [ ] Icon 图片正常显示
- [ ] TabBar 图标正常显示（如果使用自定义 TabBar）
- [ ] 参考案例正常加载
- [ ] AI 生成建议功能正常

## 回滚方案

如果迁移出现问题，可以：

1. 恢复本地图片路径
2. 恢复使用 `cases.js` 文件
3. 重新部署云函数



