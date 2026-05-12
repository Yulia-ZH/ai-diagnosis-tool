# 自媒体账号 AI 诊断师

> 数据驱动的账号诊断 × 爆款规律提炼 × 内容直接生成

支持平台：小红书 / 抖音 / B站 / 公众号

## 功能

- 🏥 **账号健康诊断** — 互动率、赞藏比、增长趋势全面体检
- 🔥 **爆款方向分析** — 提炼爆款公式，预测下一个爆款
- ✨ **内容优化建议** — 标题、开头、互动引导全面优化
- 💡 **智能选题辅助** — 5条高质量选题，附理由和框架
- 📝 **完整脚本生成** — 直接可发布的图文/视频脚本
- 🎯 **对标账号拆解** — 深度分析竞品，找差异化机会

## 部署到 Vercel（5分钟完成）

### 方法一：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL&env=DEEPSEEK_API_KEY&envDescription=DeepSeek%20API%20Key&envLink=https://platform.deepseek.com/api_keys)

### 方法二：手动部署

1. **Fork 或上传代码到 GitHub**

2. **在 Vercel 导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project" → 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置环境变量**
   - 在 Vercel 项目设置中找到 "Environment Variables"
   - 添加：`DEEPSEEK_API_KEY` = 你的 DeepSeek API Key
   - 获取 API Key：https://platform.deepseek.com/api_keys

4. **点击 Deploy**，等待 1-2 分钟即可上线

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 DEEPSEEK_API_KEY

# 启动开发服务器
npm run dev
# 访问 http://localhost:3000
```

## 技术栈

- **框架**：Next.js 15 (App Router)
- **样式**：Tailwind CSS
- **AI**：DeepSeek API（兼容 OpenAI 接口）
- **部署**：Vercel（免费）

## 费用说明

- **Vercel 托管**：免费（个人项目）
- **DeepSeek API**：约 ¥0.001/次诊断（极低成本）
