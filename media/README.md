# 图标说明

## 当前图标

- `icon.svg` - SVG 矢量图标（源文件）

## 转换为 PNG

VS Code Marketplace 要求使用 PNG 格式的图标（128x128 像素）。

### 方法1：在线转换（推荐）

1. 访问 https://cloudconvert.com/svg-to-png
2. 上传 `icon.svg`
3. 设置宽度和高度为 128 像素
4. 下载转换后的文件
5. 重命名为 `icon.png`
6. 放到此目录

### 方法2：使用命令行（需要 ImageMagick）

```bash
# macOS
brew install imagemagick

# 转换
convert icon.svg -resize 128x128 icon.png
```

### 方法3：使用 Inkscape

```bash
# macOS
brew install --cask inkscape

# 转换
inkscape icon.svg --export-type=png --export-width=128 --export-height=128 --export-filename=icon.png
```

## 自定义图标

如果你想创建自己的图标：

### 设计规范

- 尺寸：128x128 像素
- 格式：PNG（需要）或 SVG（源文件）
- 背景：建议透明或品牌色
- 风格：简洁、识别度高
- 颜色：与品牌一致（推荐绿色系）

### 设计工具

- [Figma](https://www.figma.com) - 免费在线设计
- [Canva](https://www.canva.com) - 简单易用
- [GIMP](https://www.gimp.org) - 免费开源
- [Inkscape](https://inkscape.org) - 矢量图编辑

### 设计建议

CodeFit 的核心元素：
- ❤️ 心形（代表健康）
- 💻 代码符号（{}, <>, 等）
- 🏃 运动元素
- 💚 绿色系（健康、活力）

当前 SVG 图标包含：
- 绿色圆角矩形背景 (#22c55e)
- 白色心形
- 代码括号 {}

## 临时解决方案

如果还没有图标，可以临时在 `package.json` 中注释掉 icon 字段：

```json
// "icon": "media/icon.png",
```

这样可以先打包测试，稍后再添加图标。
