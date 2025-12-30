#!/bin/bash

# SVG到PNG转换脚本
# 需要安装 ImageMagick 或 librsvg

echo "开始转换SVG图标到PNG格式..."

# 检查是否安装了ImageMagick
if command -v convert &> /dev/null; then
    echo "使用ImageMagick进行转换..."

    # 转换所有SVG到PNG (81x81像素)
    for svg_file in miniprogram/images/tabbar/svg/*.svg; do
        filename=$(basename "$svg_file" .svg)
        convert "$svg_file" -resize 81x81 "miniprogram/images/tabbar/${filename}.png"
        echo "✓ 转换完成: ${filename}.png"
    done

elif command -v rsvg-convert &> /dev/null; then
    echo "使用librsvg进行转换..."

    for svg_file in miniprogram/images/tabbar/svg/*.svg; do
        filename=$(basename "$svg_file" .svg)
        rsvg-convert -w 81 -h 81 "$svg_file" -o "miniprogram/images/tabbar/${filename}.png"
        echo "✓ 转换完成: ${filename}.png"
    done

else
    echo "❌ 未找到ImageMagick或librsvg，请安装其中之一："
    echo "  macOS: brew install imagemagick"
    echo "  或使用在线转换工具"
fi

echo "转换完成！"
