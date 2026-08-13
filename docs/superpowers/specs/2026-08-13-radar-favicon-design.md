# Radar favicon 设计

## 目标

为 Opportunity Radar 添加在浏览器标签页和收藏夹中清晰可辨的站点图标。

## 方案

- 使用原生 SVG，避免位图在 16px、32px 标签尺寸下模糊。
- 图标为深海军蓝圆角方块，匹配网站 Hero 的主背景。
- 方块中使用两条紫色雷达同心环和一枚浅色信号点，表达“持续扫描机会信号”。
- 不包含文字，确保小尺寸仍有识别度。

## 集成与验收

- 资产路径为 `public/favicon.svg`。
- `BaseLayout.astro` 的全站 `<head>` 通过基路径引用该图标，以兼容 GitHub Pages 的 `/OpportunityRadar/` 子路径。
- `npm run build` 必须成功，构建产物包含 SVG，页面 head 含 favicon 引用。
