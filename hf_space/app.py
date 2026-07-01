import os, json, re, urllib.parse, glob, tempfile, asyncio
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, field_validator
import uvicorn

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
OPENAI_API_KEY  = os.environ.get("OPENAI_API_KEY", "")
API_KEY    = DEEPSEEK_API_KEY or OPENAI_API_KEY
API_BASE   = "https://api.deepseek.com/v1"
API_MODEL  = "deepseek-chat"
API_SOURCE = "deepseek" if DEEPSEEK_API_KEY else ("openai" if OPENAI_API_KEY else "none")

CACHE_DIR = os.path.join(tempfile.gettempdir(), "knowledge_flow_cache")

app = FastAPI(title="Knowledge Flow API", version="10.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dzha0118-knowledge-flow.hf.space",
        "https://dzha0118-knowledge-flow.hf.space/",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    max_age=600,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"]    = "nosniff"
        response.headers["Referrer-Policy"]           = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"]   = "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https://*.cloudfront.net; frame-src 'self' https://www.youtube-nocookie.com https://player.bilibili.com; connect-src 'self'; frame-ancestors 'self' https://huggingface.co https://*.hf.space"
        return response

app.add_middleware(SecurityHeadersMiddleware)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

ALLOWED_DOMAINS = [
    "youtube.com", "youtu.be",
    "bilibili.com", "b23.tv",
    "douyin.com", "iesdouyin.com", "v.douyin.com",
    "xiaohongshu.com", "xhslink.com",
]

def is_allowed_url(url: str) -> bool:
    url = url.strip()
    if not url:
        return False
    if url.lower().startswith(("javascript:", "data:", "vbscript:", "file:")):
        return False
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False
    netloc = parsed.netloc.lower().removeprefix("www.")
    return any(netloc == d or netloc.endswith("." + d) for d in ALLOWED_DOMAINS)

def sanitize_video_id(platform: str, raw_id: str) -> str:
    raw_id = (raw_id or "").strip()
    if platform == "youtube":
        return re.sub(r"[^a-zA-Z0-9_-]", "", raw_id)
    if platform == "bilibili":
        return re.sub(r"[^a-zA-Z0-9]", "", raw_id)
    return re.sub(r"[^a-zA-Z0-9_-]", "", raw_id)

class ProcessVideoRequest(BaseModel):
    url: str
    lang: str = "zh"

    @field_validator("lang")
    @classmethod
    def validate_lang(cls, v):
        if v not in ("zh", "en"):
            raise ValueError("lang must be 'zh' or 'en'")
        return v


def detect_platform(url: str) -> str:
    if re.search(r"youtube\.com|youtu\.be", url, re.I):       return "youtube"
    if re.search(r"bilibili\.com|b23\.tv", url, re.I):         return "bilibili"
    if re.search(r"(?:douyin\.com|iesdouyin\.com|v\.douyin\.com)", url, re.I): return "douyin"
    if re.search(r"xiaohongshu\.com|xhslink\.com", url, re.I): return "xiaohongshu"
    return "unknown"


def extract_video_id(url: str, platform: str) -> str:
    url = url.rstrip("/")
    if platform == "youtube":
        m = re.search(r"(?:v=|/)([\w\-]{11})", url)
        return m.group(1) if m else url
    if platform == "bilibili":
        m = re.search(r"BV([a-zA-Z0-9]{10})", url)
        return f"BV{m.group(1)}" if m else url.split("/")[-1]
    return url.split("/")[-1]


def _try_ytdlp_meta(url: str) -> dict:
    try:
        import yt_dlp
        opts = {"quiet": True, "no_warnings": True, "skip_download": True, "extract_flat": False}
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
        title = (info.get("title", "") or "")[:200]
        desc  = ((info.get("description") or "").replace("\n", " "))[:600]
        dur   = info.get("duration", 0) or 0
        return {"title": title, "description": desc, "duration": dur, "subtitle": "", "source": "ytdlp_meta"}
    except:
        return {}

def _try_douyin_ajax(short_url: str) -> dict:
    try:
        import requests as req
        headers = {"User-Agent": "Mozilla/5.0"}
        r = req.get(short_url, headers=headers, timeout=8, allow_redirects=True)
        final = r.url
        m = re.search(r"(?:video/|modal_id=)(\d+)", final)
        vid = sanitize_video_id("douyin", m.group(1) if m else "")
        try:
            r2 = req.get(f"https://www.douyin.com/oembed?url={urllib.parse.quote(final)}", headers=headers, timeout=6)
            if r2.status_code == 200:
                d = r2.json(); t = d.get("title", "")
                if t and len(t) > 3:
                    return {"title": t, "description": "", "duration": 0, "subtitle": "", "source": "douyin_oembed", "video_id": vid}
        except:
            pass
        return {"title": "", "description": "", "duration": 0, "subtitle": "", "source": "douyin_resolved", "video_id": vid}
    except:
        return {}


def _try_bilibili_api(bvid: str) -> dict:
    try:
        import requests as req
        headers = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.bilibili.com/"}
        r = req.get(f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}", headers=headers, timeout=8)
        if r.status_code != 200: return {}
        d = r.json()
        if d.get("code") != 0: return {}
        info = d["data"]
        title = info.get("title", "")
        desc  = (info.get("desc", "") or "").replace("\n", " ")[:500]
        cid = info.get("cid", 0) or (info.get("pages", [{}])[0].get("cid", 0) if info.get("pages") else 0)
        sub_text = ""
        if cid:
            try:
                r2 = req.get(f"https://api.bilibili.com/x/player/v2?bvid={bvid}&cid={cid}", headers=headers, timeout=8)
                if r2.status_code == 200:
                    pd = r2.json()
                    if pd.get("code") == 0:
                        slist = pd.get("data", {}).get("subtitle", {}).get("subtitles", [])
                        if slist:
                            s_url = slist[0].get("subtitle_url", "")
                            if s_url:
                                if s_url.startswith("//"): s_url = "https:" + s_url
                                r3 = req.get(s_url, headers=headers, timeout=8)
                                if r3.status_code == 200:
                                    body = r3.json().get("body", [])
                                    sub_text = " ".join(item["content"] for item in body if item.get("content"))
            except:
                pass
        return {"title": title, "description": desc, "duration": info.get("duration", 0) or 0,
                "subtitle": sub_text[:6000] if sub_text else "", "source": "bilibili_api"}
    except:
        return {}


def call_ai(system: str, prompt: str) -> tuple:
    if not API_KEY:
        return None, "no_api_key"
    try:
        from openai import OpenAI
        client = OpenAI(api_key=API_KEY, base_url=API_BASE, timeout=60)
        resp = client.chat.completions.create(
            model=API_MODEL,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            temperature=0.8, max_tokens=6000,
        )
        return resp.choices[0].message.content, "ok"
    except Exception as e:
        return None, str(e)[:300]


def build_prompt(url: str, platform: str, video_id: str, extracted: dict, lang: str) -> str:
    pname = {"youtube": "▶ YouTube", "bilibili": "📺 B站", "douyin": "🎵 抖音", "xiaohongshu": "📕 小红书"}.get(platform, "在线视频")
    ctx = [f"平台: {pname}"]
    ext_title = extracted.get("title", "")
    ext_desc  = extracted.get("description", "")
    ext_sub   = extracted.get("subtitle", "")
    if ext_title and len(ext_title) > 2:
        ctx.append(f"视频标题: {ext_title}")
    if ext_desc:
        ctx.append(f"视频描述: {ext_desc}")
    if ext_sub and len(ext_sub) > 20:
        ctx.append(f"视频文案/字幕: {ext_sub[:5000]}")
    else:
        ctx.append(f"视频ID: {video_id}")
        ctx.append(f"链接: {url}")
    context = "\n\n".join(ctx)
    has_sub = len(ext_sub) > 100

    return f"""你是资深教育内容架构师。用户提交了一个视频。
{'重要：已通过文字提取获取了该视频文案，请基于此文案精确生成。' if has_sub else '请基于标题和链接推测知识体系。'}

{context}

生成详尽学习材料。用中文输出所有字段，内容必须详细完整。

JSON（只输出JSON）:
{{
  "titleZh": "具体标题≤15字",
  "titleEn": "title",
  "descriptionZh": "简介30-50字",
  "descriptionEn": "desc",
  "summaryZh": "摘要≥150字",
  "summaryEn": "summary",
  "chapters": [
    {{"id":"ch1","titleZh":"章节标题","titleEn":"Ch","startTime":0,"endTime":120,
     "detailZh":"本章详细内容≥60字"}}
    ...4章
  ],
  "captions": [...10条模拟字幕],
  "knowledgeNodes": [
    {{"id":"kn1","labelZh":"知识点3-6字","labelEn":"Name","timestamp":10,
     "connectedTo":[],"detailZh":"完整解释≥50字","category":"concept"}}
    ...12个, connectedTo构成单向树
  ],
  "quizQuestions": [
    {{"id":"q1","type":"single","questionZh":"题目","questionEn":"Q",
     "optionsZh":["选项A","选项B","选项C","选项D"],
     "optionsEn":["A","B","C","D"],
     "correctAnswer":[0],
     "explanationZh":"解释","explanationEn":"explanation",
     "difficulty":"easy","timestamp":10}}
    ...5题: 3single+1truefalse+1multiple
  ]
}}

硬性规则: knowledgeNodes 12个每detailZh≥50字, 章节detailZh≥60字, summaryZh≥150字
字段名: correctAnswer (number数组), quizQuestion.type 三选一 single|multiple|truefalse
"""


def build_article_prompt(course_title: str, nodes: list, chaps: list, summary: str) -> str:
    return f"""你是资深图文编辑。视频: {course_title}
知识点: {', '.join(n.get('labelZh', '') for n in nodes)}
章节: {', '.join(c.get('titleZh', '') for c in chaps)}
摘要: {summary}
撰写深度图文文章≥1000字。
JSON: {{"articleTitle":"标题","articleSections":[{{"heading":"节标题","body":"正文≥150字","iconEmoji":"📝"}}...8节],"keyHighlights":["要点"...6个],"conclusion":"总结≥100字"}}"""


def json_fix(text: str) -> dict | None:
    text = (text or "").strip()
    text = re.sub(r"^```\w*\n?", "", text)
    text = re.sub(r"\n?```$", "", text)
    try:
        return json.loads(text)
    except:
        ob, oa = text.count("{") - text.count("}"), text.count("[") - text.count("]")
        if ob > 0 or oa > 0:
            fixed = text.rstrip().rstrip(",")
            lq = fixed.rfind('"')
            if lq > 0 and fixed[lq + 1:] and fixed[lq + 1] not in ('}', '[', ']', '"', ','):
                fixed += '"'
            fixed += "]" * oa + "}" * ob
            try:
                return json.loads(fixed)
            except:
                pass
    return None


def fill_empty(course: dict) -> dict:
    nodes = course.get("knowledgeNodes", [])
    title = course.get("titleZh", "")
    for n in nodes:
        if not (n.get("detailZh") or "").strip():
            n["detailZh"] = f"[{n.get('labelZh', '')}]是[{title}]中的核心概念，涉及理论与实践交叉应用。"
        if "connectedTo" not in n:
            n["connectedTo"] = []
    return course


def generate_course_sync(url: str, platform: str, video_id: str, lang: str, extracted: dict) -> dict:
    if not API_KEY:
        return {"courseId": video_id[:12], "videoPlatform": platform, "videoUrl": url, "videoId": video_id,
                "source": "no_key", "quizQuestions": [], "message": "未配置 API Key。"}

    prompt = build_prompt(url, platform, video_id, extracted, lang)
    ai_text, ai_err = call_ai("你是资深教育内容架构师。", prompt)
    if not ai_text:
        return {"courseId": video_id[:12], "videoPlatform": platform, "videoUrl": url, "videoId": video_id,
                "source": "ai_error", "quizQuestions": [], "message": ai_err or "AI调用失败"}

    course = json_fix(ai_text)
    if not course:
        return {"courseId": video_id[:12], "videoPlatform": platform, "videoUrl": url, "videoId": video_id,
                "source": "json_error", "quizQuestions": [], "message": "AI JSON解析失败"}

    course = fill_empty(course)
    course["courseId"]      = video_id[:12] or "unknown"
    course["videoPlatform"] = platform
    course["videoUrl"]      = url
    course["videoId"]       = video_id
    course["source"]        = API_SOURCE
    course["extracted"]     = {"method": extracted.get("source", "none"),
                                "title": (extracted.get("title", "") or "")[:200],
                                "subtitle_len": len(extracted.get("subtitle", "") or "")}

    nodes   = course.get("knowledgeNodes", [])
    chaps   = course.get("chapters", [])
    summary = course.get("summaryZh", "")
    article = {
        "articleTitle": course.get("titleZh", ""),
        "articleSections": [
            {"heading": "📝 内容摘要", "body": summary or course.get("descriptionZh", ""), "iconEmoji": "📝"},
            {"heading": "📖 知识点详解", "body": "；".join(f"{n.get('labelZh','')}——{n.get('detailZh','')}" for n in nodes[:8]), "iconEmoji": "📖"},
            {"heading": "🎯 关键要点", "body": "、".join(n.get("labelZh","") for n in nodes[:12]), "iconEmoji": "🎯"},
        ],
        "keyHighlights": [n.get("labelZh","") for n in nodes[:6]],
        "conclusion": summary or course.get("descriptionZh", ""),
    }
    course["article"] = article
    return course


@app.post("/api/process-video")
async def process_video(req: ProcessVideoRequest):
    raw_url = str(req.url).strip()
    url_match = re.search(r"https?://[^\s'\"<>]+", raw_url)
    url = url_match.group(0) if url_match else raw_url
    platform   = detect_platform(url)
    video_id   = sanitize_video_id(platform, extract_video_id(url, platform))
    lang       = req.lang

    if not url:
        raise HTTPException(status_code=400, detail="Empty URL")
    if platform == "unknown":
        raise HTTPException(status_code=400, detail="Unsupported video platform")

    extracted = {}
    if platform == "douyin":
        try:
            extracted = _try_douyin_ajax(url) or {}
        except:
            extracted = {}
    elif platform == "bilibili":
        try:
            extracted = _try_bilibili_api(video_id) or {}
        except:
            extracted = {}

    if extracted.get("title") and len(extracted["title"]) > 2:
        video_id = extracted.get("video_id", "") or video_id

    try:
        result = generate_course_sync(url, platform, video_id, lang, extracted)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)[:200]}")


@app.post("/api/clear-cache")
async def clear_cache():
    for folder in [CACHE_DIR, "/tmp/kf_cache", "/tmp/kf_audio", "/tmp/whisper_audio"]:
        try:
            if os.path.isdir(folder):
                for f in glob.glob(os.path.join(folder, "*")):
                    try: os.remove(f)
                    except: pass
        except: pass
    return {"status": "ok", "message": "Cache cleared"}


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "10.7"}


@app.get("/{full_path:path}")
async def spa(full_path: str):
    fp = os.path.join(STATIC_DIR, full_path)
    if os.path.isfile(fp):
        return FileResponse(fp)
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


if STATIC_DIR and os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 7860)))
