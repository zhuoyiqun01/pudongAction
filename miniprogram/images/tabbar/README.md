# TabBar 图标说明

## 📁 文件结构

```
tabbar/
├── svg/                    # SVG 源文件
│   ├── home.svg           # 首页图标
│   ├── home-active.svg    # 首页激活状态
│   ├── generator.svg      # 小事生成器图标
│   ├── generator-active.svg # 小事生成器激活状态
│   ├── action.svg         # 小事行动吧图标
│   └── action-active.svg  # 小事行动吧激活状态
├── home.png              # 首页图标 (81x81px)
├── home-active.png       # 首页激活状态
├── generator.png         # 小事生成器图标
├── generator-active.png  # 小事生成器激活状态
├── action.png            # 小事行动吧图标
└── action-active.png     # 小事行动吧激活状态
```

## 🎨 图标设计

### 🏠 首页 (Home)
- **普通状态**: 灰色轮廓的房子
- **激活状态**: 翠绿色填充的房子

### 💡 小事生成器 (Generator)
- **普通状态**: 灰色轮廓的灯泡
- **激活状态**: 金黄色填充的灯泡，带光晕效果

### 🧩 小事行动吧 (Action)
- **普通状态**: 灰色轮廓的拼图
- **激活状态**: 粉红色填充的拼图

## 🔧 转换工具

### 方法1：使用命令行工具 (推荐)

```bash
# 安装 ImageMagick (macOS)
brew install imagemagick

# 运行转换脚本
chmod +x convert_icons.sh
./convert_icons.sh
```

### 方法2：在线转换工具

1. 访问 [Convertio](https://convertio.co/svg-png/) 或 [CloudConvert](https://cloudconvert.com/svg-to-png)
2. 上传对应的 SVG 文件
3. 设置尺寸为 81x81 像素
4. 下载 PNG 文件

### 方法3：使用设计软件

- Adobe Illustrator
- Sketch
- Figma
- Inkscape (免费)

导出时设置：
- 尺寸：81x81px
- 格式：PNG
- 背景：透明

## 📋 颜色规范

- **普通状态**: `#64748b` (灰色)
- **首页激活**: `#068D7B` (翠绿色)
- **生成器激活**: `#FFE501` (金黄色)
- **行动吧激活**: `#F49B9B` (粉红色)

## ✅ 检查清单

转换完成后，请确认：

- [ ] 所有6个PNG文件都存在
- [ ] 文件尺寸为81x81px
- [ ] 背景透明
- [ ] 微信开发者工具不再报错

## 🔄 更新流程

如需修改图标：

1. 编辑 `svg/` 目录下的 SVG 文件
2. 重新转换为 PNG 格式
3. 测试在微信开发者工具中的显示效果

