"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── 类型定义 ──────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface Module {
  id: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ── 诊断模块配置 ──────────────────────────────────
const MODULES: Module[] = [
  { id: "health",     icon: "🏥", title: "账号健康诊断", desc: "互动率、赞藏比、增长趋势全面体检", color: "#00B96B", bgColor: "#E6F9F0", borderColor: "#00B96B" },
  { id: "viral",      icon: "🔥", title: "爆款方向分析", desc: "提炼爆款公式，预测下一个爆款", color: "#1677FF", bgColor: "#E8F3FF", borderColor: "#1677FF" },
  { id: "optimize",   icon: "✨", title: "内容优化建议", desc: "标题、开头、互动引导全面优化", color: "#F5A800", bgColor: "#FFF8D6", borderColor: "#F5A800" },
  { id: "topics",     icon: "💡", title: "智能选题辅助", desc: "5条高质量选题，附理由和框架", color: "#00B96B", bgColor: "#E6F9F0", borderColor: "#00B96B" },
  { id: "script",     icon: "📝", title: "完整脚本生成", desc: "直接可发布的图文/视频脚本", color: "#1677FF", bgColor: "#E8F3FF", borderColor: "#1677FF" },
  { id: "competitor", icon: "🎯", title: "对标账号拆解", desc: "深度分析竞品，找差异化机会", color: "#F5A800", bgColor: "#FFF8D6", borderColor: "#F5A800" },
];

// ── Markdown 简单渲染 ─────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1 text-gray-800">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2 text-gray-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2 text-gray-900">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
    .replace(/^---$/gm, '<hr class="border-gray-200 my-3" />')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-700">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-gray-700">$2</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="my-2 space-y-1">${match}</ul>`)
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>')
    .replace(/^(.+)$/, '<p class="leading-relaxed">$1</p>');
}

// ── 打字机效果组件 ────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 typing-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

// ── 消息气泡 ──────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* 头像 */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          isUser ? "bg-yellow-400 text-gray-900" : "bg-gray-900 text-yellow-400"
        }`}
      >
        {isUser ? "我" : "AI"}
      </div>

      {/* 气泡 */}
      <div className={`max-w-[80%] ${isUser ? "chat-bubble-user px-4 py-3" : "chat-bubble-ai px-4 py-3"}`}>
        {message.isStreaming && !message.content ? (
          <TypingDots />
        ) : (
          <div
            className="prose text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}
      </div>
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `## 👋 你好！我是自媒体账号 AI 诊断师

我可以帮你：
- 🏥 **账号健康诊断** — 互动率、赞藏比、增长趋势全面体检
- 🔥 **爆款方向分析** — 提炼你账号的爆款公式
- ✨ **内容优化建议** — 标题、开头、互动引导全面优化
- 💡 **智能选题辅助** — 5条高质量选题，附理由和框架
- 📝 **完整脚本生成** — 直接可发布的图文/视频脚本
- 🎯 **对标账号拆解** — 深度分析竞品，找差异化机会

**支持平台**：小红书 / 抖音 / B站 / 公众号

---

**开始方式**：
1. 直接把你的账号主页链接发给我
2. 或者告诉我你的账号名称和平台
3. 也可以先选择下方的诊断模块

你的账号链接是？`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState("");
  const [showModules, setShowModules] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setShowModules(false);

    // 检测账号链接
    const urlPattern = /(https?:\/\/[^\s]+|小红书|抖音|B站|bilibili|douyin|xiaohongshu)/i;
    if (urlPattern.test(content) && !accountInfo) {
      setAccountInfo(content);
    }

    // 添加 AI 占位消息
    const aiPlaceholder: Message = { role: "assistant", content: "", isStreaming: true };
    setMessages([...newMessages, aiPlaceholder]);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          module: selectedModule,
          accountInfo: accountInfo || content,
        }),
      });

      if (!response.ok) throw new Error("请求失败");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                aiContent += parsed.content || "";
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: aiContent,
                    isStreaming: true,
                  };
                  return updated;
                });
              } catch {
                // ignore parse errors
              }
            }
          }
        }
      }

      // 完成流式输出
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: aiContent, isStreaming: false };
        return updated;
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "抱歉，出现了一些问题。请检查网络连接后重试，或者联系管理员。",
          isStreaming: false,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, selectedModule, accountInfo]);

  // 选择模块
  const handleModuleSelect = useCallback((moduleId: string) => {
    const module = MODULES.find((m) => m.id === moduleId);
    if (!module) return;
    setSelectedModule(moduleId);
    const prompt = accountInfo
      ? `我想进行「${module.title}」，我的账号是：${accountInfo}`
      : `我想进行「${module.title}」，请先告诉我需要提供哪些信息？`;
    sendMessage(prompt);
  }, [accountInfo, sendMessage]);

  // 快捷回复
  const QUICK_REPLIES = [
    "帮我诊断账号健康度",
    "分析我的爆款规律",
    "给我5个选题方向",
    "帮我优化最近的内容",
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-lg">🔍</div>
        <div>
          <h1 className="font-bold text-gray-900 text-base leading-tight">自媒体账号 AI 诊断师</h1>
          <p className="text-xs text-gray-500">数据驱动 · 爆款提炼 · 内容生成</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">● 在线</span>
          {selectedModule && (
            <span
              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium cursor-pointer"
              onClick={() => setSelectedModule(null)}
            >
              {MODULES.find((m) => m.id === selectedModule)?.title} ✕
            </span>
          )}
        </div>
      </header>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        <div className="max-w-2xl mx-auto">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}

          {/* 模块选择卡片 */}
          {showModules && messages.length === 1 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 text-center mb-3">— 或者直接选择诊断模块 —</p>
              <div className="grid grid-cols-2 gap-2">
                {MODULES.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleModuleSelect(module.id)}
                    className="module-card text-left p-3 rounded-xl border-2 border-gray-200 bg-white"
                    style={
                      selectedModule === module.id
                        ? { borderColor: module.borderColor, backgroundColor: module.bgColor }
                        : {}
                    }
                  >
                    <div className="text-xl mb-1">{module.icon}</div>
                    <div className="font-semibold text-gray-900 text-sm">{module.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-tight">{module.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 快捷回复 */}
          {!isLoading && messages.length > 1 && messages.length < 4 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-yellow-400 hover:text-yellow-700 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {/* 模块快选 */}
          <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide pb-1">
            {MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                className={`flex-shrink-0 text-xs px-3 py-1 rounded-full border transition-all ${
                  selectedModule === module.id
                    ? "border-yellow-400 bg-yellow-100 text-yellow-800 font-medium"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {module.icon} {module.title}
              </button>
            ))}
          </div>

          {/* 输入框 */}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入账号链接或直接提问... (Enter 发送，Shift+Enter 换行)"
              className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 min-h-[48px] max-h-[120px] bg-gray-50"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-2xl bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            支持小红书 / 抖音 / B站 / 公众号 · 粘贴账号链接即可开始诊断
          </p>
        </div>
      </div>
    </div>
  );
}
