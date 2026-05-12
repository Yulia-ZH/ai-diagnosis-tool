import { NextRequest } from "next/server";

function detectPlatform(url: string): string {
  if (url.includes("xiaohongshu.com") || url.includes("xhslink.com")) return "xiaohongshu";
  if (url.includes("douyin.com") || url.includes("dy.app")) return "douyin";
  if (url.includes("bilibili.com") || url.includes("b23.tv")) return "bilibili";
  return "unknown";
}

async function fetchXiaohongshu(url: string): Promise<Record<string, string>> {
  try {
    let finalUrl = url;
    // 解析短链接
    if (url.includes("xhslink.com")) {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1" },
      });
      finalUrl = res.url;
    }

    const response = await fetch(finalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Referer": "https://www.xiaohongshu.com/",
      },
    });

    const html = await response.text();
    const data: Record<string, string> = { platform: "小红书", url: finalUrl };

    // 账号名
    const nameMatch = html.match(/"nickname"\s*:\s*"([^"]+)"/) || html.match(/<title>([^<-]+)/);
    if (nameMatch) data.name = nameMatch[1].trim();

    // 粉丝数
    const fansMatch = html.match(/"fans"\s*:\s*(\d+)/) ||
                      html.match(/"followerCount"\s*:\s*(\d+)/) ||
                      html.match(/粉丝[^\d]*(\d+[\.\d]*[万kK]?)/);
    if (fansMatch) data.fans = fansMatch[1];

    // 获赞与收藏
    const likesMatch = html.match(/"liked"\s*:\s*(\d+)/) ||
                       html.match(/"totalCollectLiked"\s*:\s*(\d+)/) ||
                       html.match(/获赞与收藏[^\d]*(\d+[\.\d]*[万kK]?)/);
    if (likesMatch) data.likes = likesMatch[1];

    // 关注数
    const followMatch = html.match(/"follows"\s*:\s*(\d+)/) || html.match(/"followingCount"\s*:\s*(\d+)/);
    if (followMatch) data.following = followMatch[1];

    // 简介
    const descMatch = html.match(/"desc"\s*:\s*"([^"]{5,200})"/) || html.match(/"description"\s*:\s*"([^"]{5,200})"/);
    if (descMatch) data.bio = descMatch[1];

    // 笔记数
    const notesMatch = html.match(/"noteCount"\s*:\s*(\d+)/);
    if (notesMatch) data.noteCount = notesMatch[1];

    // 近期笔记标题（最多5条）
    const titleMatches = [...html.matchAll(/"title"\s*:\s*"([^"]{3,80})"/g)];
    const titles = [...new Set(titleMatches.map((m) => m[1]))].slice(0, 5);
    if (titles.length > 0) data.recentTitles = titles.join(" | ");

    // 近期笔记点赞数
    const likedMatches = [...html.matchAll(/"likedCount"\s*:\s*(\d+)/g)];
    const likedCounts = likedMatches.map((m) => m[1]).slice(0, 5);
    if (likedCounts.length > 0) data.recentLikes = likedCounts.join(", ");

    return data;
  } catch (e) {
    return { platform: "小红书", url, error: String(e) };
  }
}

async function fetchDouyin(url: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept-Language": "zh-CN,zh;q=0.9",
      },
    });
    const html = await response.text();
    const data: Record<string, string> = { platform: "抖音", url };

    const nameMatch = html.match(/"nickname"\s*:\s*"([^"]+)"/);
    if (nameMatch) data.name = nameMatch[1];
    const fansMatch = html.match(/"follower_count"\s*:\s*(\d+)/);
    if (fansMatch) data.fans = fansMatch[1];
    const likeMatch = html.match(/"total_favorited"\s*:\s*"?(\d+)"?/);
    if (likeMatch) data.likes = likeMatch[1];
    const descMatch = html.match(/"signature"\s*:\s*"([^"]{3,200})"/);
    if (descMatch) data.bio = descMatch[1];

    return data;
  } catch (e) {
    return { platform: "抖音", url, error: String(e) };
  }
}

async function fetchBilibili(url: string): Promise<Record<string, string>> {
  try {
    const uidMatch = url.match(/space\.bilibili\.com\/(\d+)/) || url.match(/uid=(\d+)/);
    if (!uidMatch) return { platform: "B站", url, error: "无法提取UID" };

    const uid = uidMatch[1];
    const response = await fetch(`https://api.bilibili.com/x/space/acc/info?mid=${uid}`, {
      headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.bilibili.com" },
    });
    const json = await response.json();
    const d = json?.data;
    if (!d) return { platform: "B站", url, error: "API返回空数据" };

    return {
      platform: "B站",
      url,
      name: d.name || "",
      fans: String(d.follower || ""),
      bio: d.sign || "",
      level: String(d.level || ""),
    };
  } catch (e) {
    return { platform: "B站", url, error: String(e) };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return Response.json({ error: "缺少 url 参数" }, { status: 400 });

    const platform = detectPlatform(url);
    let data: Record<string, string> = {};

    if (platform === "xiaohongshu") {
      data = await fetchXiaohongshu(url);
    } else if (platform === "douyin") {
      data = await fetchDouyin(url);
    } else if (platform === "bilibili") {
      data = await fetchBilibili(url);
    } else {
      data = { platform: "未知平台", url, note: "请手动提供账号数据" };
    }

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
