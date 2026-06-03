# 轻量工作流 — ui-color-variables

## 元信息
- **slug**: ui-color-variables
- **mode**: single
- **status**: active
- **created_at**: 2026-06-03
- **updated_at**: 2026-06-03

## 目标
全量颜色变量化：将 66 个文件中所有硬编码颜色值替换为 CSS var() 引用，基于现有 common.css 颜色变量体系扩展。

## 当前迭代
- **iteration**: 1
- **step**: verify
- **started_at**: 2026-06-03

## 迭代历史
| # | 步骤 | 状态 | 完成时间 | 备注 |
|---|------|------|----------|------|
| 1 | discuss | COMPLETE | 2026-06-03 | D-01~D-05 |
| 1 | plan    | COMPLETE | 2026-06-03 | 5 任务 |
| 1 | execute | COMPLETE | 2026-06-03 | 全部 66 文件，142→0 硬编码色值 |

## 决策记录
- **D-01**: 全量变量化 — 主色、功能色、文字色、背景色、边框色全部 var() 化
- **D-02**: 单主题变量化 — 不做深色/多主题切换，只统一规范
- **D-03**: 全部 66 文件 — common.css + 64 pages/*.html + page-index.html
- **D-04**: 基于现有变量扩展 — 复用 common.css 已有颜色变量，不足的补充新变量
- **D-05**: 全部色值 var() 化 — 包括各种灰色（#f8f8f8、#f0f0f0 等），不留硬编码颜色
