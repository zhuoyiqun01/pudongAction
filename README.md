# 社区小事 - 微信小程序

普陀区「社区小事」开放邻里计划的微信小程序版本，基于微信云开发构建。

## 项目简介

「社区小事」是一个社区行动平台，鼓励居民在家门口的五十米范围内，通过微小的行动改善社区生活。平台连接活动家、带领人和居民，提供信息展示、活动参与、社区互动等功能。

## 主要功能

### 用户功能
- **首页**: 展示项目介绍、核心价值观、项目使命
- **活动家**: 浏览社区活动家的介绍和事迹
- **带领人**: 查看社区领导者和工作人员信息
- **加入我们**: 提交加入社区小事的申请

### 管理员功能 (开发中)
- 内容管理
- 用户申请审核
- 数据统计

## 技术栈

- **前端**: 微信小程序原生框架 (WXML + WXSS + JavaScript)
- **后端**: 微信云开发 (云函数 + 云数据库)
- **数据库**: 云数据库 (兼容 MongoDB)
- **样式**: 自定义响应式设计

## 项目结构

```
miniprogram/
├── app.js                 # 小程序入口文件
├── app.json              # 小程序全局配置
├── app.wxss              # 小程序全局样式
├── utils/                # 工具函数
│   └── util.js
├── components/           # 公共组件 (预留)
├── pages/                # 页面
│   ├── home/            # 首页
│   ├── activists/       # 活动家页面
│   ├── leaders/         # 带领人页面
│   ├── join/            # 加入页面
│   ├── learning/        # 学习页面 (预留)
│   ├── spaces/          # 空间页面 (预留)
│   └── admin/           # 管理员页面 (预留)
├── images/              # 图片资源
└── ...

cloudfunctions/          # 云函数
├── getActivists/       # 获取活动家数据
├── getLeaders/         # 获取领导者数据
├── joinCommunity/      # 用户加入申请
└── initDatabase/       # 初始化数据库
```

## 数据库设计

### 集合: activists (活动家)
```javascript
{
  name: "张建国",           // 姓名
  role: "垃圾分类先行者",    // 角色
  tag: "环保卫士",          // 标签
  photo: "图片URL",        // 头像
  bio: "个人简介",          // 个人简介
  street: "长寿路街道",     // 所属街道
  order: 5,               // 排序权重
  published: true,        // 是否发布
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

### 集合: leaders (领导者)
```javascript
{
  name: "倪小倩",           // 姓名
  street: "长征镇",        // 所属街道
  community: "象源丽都社区", // 社区/组织名称
  role: "社区书记",        // 职位
  slogan: "口号",          // 口号/宣言
  contact: "021-12345678", // 联系方式
  photo: "图片URL",        // 头像
  order: 5,               // 排序权重
  published: true,        // 是否发布
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

### 集合: join_applications (加入申请)
```javascript
{
  name: "申请人姓名",       // 姓名
  phone: "13800138000",   // 手机号
  street: "所属街道",      // 所属街道
  bio: "个人简介",         // 个人简介
  interests: ["兴趣1"],   // 兴趣标签
  status: "pending",      // 申请状态: pending/approved/rejected
  openid: "用户openid",    // 微信用户标识
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

## 部署步骤

### 1. 环境准备
1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册微信小程序账号
3. 开启微信云开发服务

### 2. 项目配置
1. 在微信开发者工具中打开项目
2. 修改 `project.config.json` 中的 `appid` 为你的小程序 AppID
3. 修改 `miniprogram/app.js` 中的云环境ID为你的云环境ID

### 3. 初始化数据库
1. 在微信开发者工具中部署 `initDatabase` 云函数
2. 调用云函数初始化基础数据

### 4. 部署云函数
在微信开发者工具中依次部署以下云函数：
- `getActivists`
- `getLeaders`
- `joinCommunity`

### 5. 预览和发布
1. 在开发者工具中预览小程序
2. 测试各项功能
3. 提交审核并发布

## 开发指南

### 添加新页面
1. 在 `miniprogram/pages/` 下创建页面目录
2. 在 `miniprogram/app.json` 的 `pages` 数组中添加页面路径
3. 实现页面的 `.wxml`、`.wxss`、`.js` 和 `.json` 文件

### 添加云函数
1. 在 `cloudfunctions/` 下创建云函数目录
2. 实现 `index.js` 文件
3. 在微信开发者工具中部署云函数

### 样式规范
- 使用rpx作为尺寸单位，确保在不同设备上的一致性
- 遵循品牌色彩：主色 `#1a365d`，辅色 `#fbbf24`
- 保持组件间距和字体大小的统一性

## 注意事项

1. **云环境**: 确保云环境ID配置正确，且云开发服务已开启
2. **权限**: 小程序需要位置权限用于可能的地理位置功能
3. **数据安全**: 用户敏感信息需要妥善处理，遵守相关法律法规
4. **性能优化**: 图片资源建议使用压缩格式，大数据量使用分页加载

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系我们

项目维护者: [你的联系方式]

项目主页: [项目地址]
