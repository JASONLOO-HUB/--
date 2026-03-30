(function () {
  const STORAGE_KEY = 'site-lang';

  const STRINGS = {
    'zh-CN': {
      'page.title': '履程 — 大模型驱动的简历与求职路径助手',
      'page.desc':
        '简历与 JD 先结构化，再 RAG 对齐、分段改写与可审计采纳——方舟大模型 + SSE/ASR，把求职材料跑成一条闭环管线。',
      'logo.brand': '履程',
      'logo.tag': ' · 求职助手',
      'lang.label': '语言',
      'lang.zhCN': '简体',
      'lang.zhTW': '繁體',
      'lang.en': 'English',
      'nav.input': '录入',
      'nav.analysis': '分析',
      'nav.rewrite': '改写',
      'nav.followup': '补信息',
      'nav.diff': '核对',
      'nav.plan': '规划',
      'deck.hero': '封面',
      'deck.input': '录入',
      'deck.analysis': '分析',
      'deck.rewrite': '改写',
      'deck.followup': '补信息',
      'deck.diff': '核对',
      'deck.plan': '规划',
      'hero.title': '履程：面向香港与内地，把履历对齐真实岗位',
      'hero.focusLabel': '地区就业市场痛点',
      'hero.tablistAria': '选择地区以查看痛点并自动调整地图视角',
      'hero.mainland': '内地',
      'hero.hk': '香港',
      'hero.ml.h': '中国内地',
      'hero.ml.li1':
        '环境高度竞争，雇主极看重垂直实习与对口经历，履历与 JD 之间常见「匹配断层」。',
      'hero.ml.li2':
        '职业规划近乎刚需，传统高价咨询却将多数普通学生挡在门外，信息与服务仍不对称。',
      'hero.hk.h': '香港',
      'hero.hk.li1':
        '国际金融与多元产业并存，简历需要经得住行业逻辑的审视，而非简单信息堆砌。',
      'hero.hk.li2': '筛选与匹配成本高，求职者难以及时看清岗位叙事与自身材料的差距。',
      'hero.cta': '进入功能介绍',
      'hero.scrollHint':
        '向下可展开<strong>产品闭环</strong>、<strong>技术选型</strong>与<strong>社会效益</strong>；能力由<strong>方舟大模型 + RAG + 流式交付</strong>支撑，把对齐 JD、补经历与可执行规划收成一条你能跟完的链路。',
      'hero.pipelineHeading': '产品闭环、技术选型与社会效益',
      'hero.statement':
        '把散落在各处的经历，收成模型能读懂、敢下判断的一份叙事——再交回你手里签字。',
      'hero.acc1.title': '产品闭环',
      'hero.acc1.tag': '六步 · 录入 → 规划',
      'hero.acc2.title': '技术选型',
      'hero.acc2.tag': '模型 · RAG · 工程栈',
      'hero.acc3.title': '社会效益',
      'hero.acc3.tag': '普惠 · 匹配 · 赋权',
      'hero.flow1':
        '<strong>录入</strong> — 简历与多份 JD 结构化入库，解析绑定会话，后续分析、改写、追问共用<strong>同一份可对齐的上下文</strong>。',
      'hero.flow2':
        '<strong>分析</strong> — 简历 × 多岗位匹配推理；长报告用 <abbr title="Server-Sent Events">SSE</abbr> 渐进送达，少白屏、多「看得见在推」。',
      'hero.flow3':
        '<strong>改写</strong> — 按教育 / 实习 / 项目等模块分段生成；口述经历经 ASR 再进大模型整理与改写，多模态进同一条管线。',
      'hero.flow4':
        '<strong>补信息</strong> — 模型驱动追问与选项，缺口补全后写回会话，再喂回生成链路。',
      'hero.flow5':
        '<strong>核对</strong> — 原文与改写并排、差异高亮，确认后再采纳，闭环可审计。',
      'hero.flow6':
        '<strong>规划</strong> — 模型归纳投递时间线与行动建议，长内容支持屏内滚动读完，从材料落到「下一步干嘛」。',
      'hero.tech1':
        '<strong>火山引擎方舟（豆包）大模型</strong> — OpenAI 兼容 API（北京区域端点），统一客户端与模型版本切换。',
      'hero.tech2':
        '<strong>检索增强（RAG）</strong> — 岗位描述与简历结构化片段检索相关上下文，再交由大模型做分析、追问与改写；索引形态随迭代对齐。',
      'hero.tech3':
        '<strong>多场景 prompt 与链式编排</strong> — 分析、改写、追问、规划、语音整理等分场景模板与调用链（可配合 LangChain 组织复杂逻辑）。',
      'hero.tech4':
        '<strong>SSE 流式分析</strong> — 长上下文与多 JD 下服务端推送分段呈现，避免一次等待大段 JSON 的断裂感。',
      'hero.tech5':
        '<strong>ASR + LLM</strong> — 火山语音识别与大模型总结 / 追问衔接；前端可选用 WebSocket 流式转写，口述快速进入结构化流程。',
      'hero.techFoot':
        '工程底座：React、TypeScript、Vite、Tailwind；FastAPI；Supabase（PostgreSQL）；前端 Vercel。交付与扩展的底子，差异化仍在模型与数据链。',
      'hero.social1':
        '简历与 JD 错位、招聘初筛成本高，叠加高价职业规划，常把普通求职者挡在机会之外。履程用 AI 把深度对齐岗位、挖掘既有优势与实习路径建议做成可反复使用的辅助，压低门槛，让缺少资源背景的人也能持续获得像样的支持。',
      'hero.social2':
        '人与岗匹配更准，盲投与误筛略减，社会层面的人力资源配置会更健康；用技术降低信息与服务的门槛，也是在放大普通人的可见度与选择权。',
      'feat.input.eyebrow': '录入',
      'feat.input.title': '结构化入口：给模型「可对齐」的简历与 JD',
      'feat.input.body':
        '材料散在 PDF、Word 和好几段 JD 里，模型只能猜——猜多了，后面每一步都带噪。',
      'feat.input.detail':
        '上传 + 多岗位并行录入，后端用 PyPDF2、python-docx 等解析，REST 写入会话与岗位表（Supabase）。<strong>统一结构化输入</strong>，让后面的 RAG 与生成少做「格式侦探」，多做判断。',
      'feat.input.caption': '产品界面（嵌入模式布局，与前端同源样式类名）',
      'feat.analysis.eyebrow': '分析',
      'feat.analysis.title': '匹配分析：RAG 上下文 + 大模型推理',
      'feat.analysis.body':
        'JD 又长又绕，多岗位并排时人眼先投降。要的是一眼看清「差在哪」，不是一份打不开的说明书。',
      'feat.analysis.detail':
        '简历与 JD 的结构化片段先检索对齐，再交给方舟大模型归纳差距与补强方向；前端用 <abbr title="Server-Sent Events">SSE</abbr> 流式接片段，配上摘要与维度图表。长分析可以<strong>边生成边读完</strong>，你始终知道系统正在往哪走，而不是对着空白干等。',
      'feat.rewrite.eyebrow': '改写',
      'feat.rewrite.title': '分段改写与口述进模型',
      'feat.rewrite.body':
        '整页丢给模型改写，像闭眼踩油门：你不知道它动了哪一句。拆开按模块改，才敢对自己负责。',
      'feat.rewrite.detail':
        '教育 / 实习 / 项目分段提交；口述可走火山 ASR，再进大模型整理成可追问草稿。后端 <code>voice</code> 与方舟链路衔接，前端也可接 <strong>WebSocket 流式转写</strong>，语音与文字走同一条生成管线，少一道复制粘贴。',
      'feat.rewrite.caption': '产品界面（改写页 · 嵌入模式）',
      'feat.followup.eyebrow': '补信息',
      'feat.followup.title': '模型驱动追问：把缺口补回上下文',
      'feat.followup.body':
        '经历写不细，模型不敢编；硬编了，你更不敢投。要的是它问你答，把洞补上，而不是一次 prompt 赌命。',
      'feat.followup.detail':
        '大模型点名缺口，生成追问与可点选项；回答与简历片段一并写回会话，再驱动改写。你可选用<strong>手动输入</strong>逐条写细，或<strong>智能选项</strong>快速点选——人机协同把上下文补满，再进入下一轮改写。',
      'feat.followup.variantLabel': '切换演示',
      'feat.followup.selectLabel': '演示切换',
      'feat.followup.tab0': '手动输入',
      'feat.followup.tab1': '智能选项',
      'followup.variant.0.title': '手动补充',
      'followup.variant.0.blurb':
        '亲手把经历写细：模型接住你的字句，并入上下文，下一轮改写才有凭有据。',
      'followup.variant.1.title': '智能选项',
      'followup.variant.1.blurb':
        '模型先出结构化选项，你点选即写入上下文——少冷启动，多「像在和顾问对齐」。',
      'feat.diff.eyebrow': '核对',
      'feat.diff.title': '可审计的采纳闭环',
      'feat.diff.body':
        '黑盒改写不敢签字：你不知道它「优化」掉了什么真实经历。并排看清楚，再点采纳。',
      'feat.diff.detail':
        '结构化 diff 标出改动范围，后端要点与说明可与并排视图对照，每一处改动<strong>有据可查</strong>。采纳前你能自己对齐「改了什么、为什么改」，心里踏实再保存。',
      'feat.diff.caption': '产品界面（DiffViewer 并排结构）',
      'feat.plan.hint':
        '规划报告同样跟着屏内滚动走——长内容需要<strong>完整的阅读动线</strong>，你可以从头到尾跟完，而不是被截成几段就丢。',
      'feat.plan.eyebrow': '规划',
      'feat.plan.title': '投递时间线：模型生成的行动草案',
      'feat.plan.body':
        '材料改完了仍不知道下周干嘛——焦虑从「写不好」变成「动不了」。要的是能执行的月历，不是鸡汤清单。',
      'feat.plan.detail':
        '方舟大模型结合简历与前置分析出规划草案，经 <code>plan</code> API 落库，与录入—分析—改写串成闭环。<strong>从材料到行动</strong>可复看、可跟进，投递节奏落在同一条链路上。',
    },
    'zh-TW': {
      'page.title': '履程 — 大模型驅動的履歷與求職路徑助手',
      'page.desc':
        '履歷與 JD 先結構化，再 RAG 對齊、分段改寫與可審計採納——方舟大模型 + SSE/ASR，把求職材料跑成一條閉環管線。',
      'logo.brand': '履程',
      'logo.tag': ' · 求職助手',
      'lang.label': '語言',
      'lang.zhCN': '简体',
      'lang.zhTW': '繁體',
      'lang.en': 'English',
      'nav.input': '錄入',
      'nav.analysis': '分析',
      'nav.rewrite': '改寫',
      'nav.followup': '補資訊',
      'nav.diff': '核對',
      'nav.plan': '規劃',
      'deck.hero': '封面',
      'deck.input': '錄入',
      'deck.analysis': '分析',
      'deck.rewrite': '改寫',
      'deck.followup': '補資訊',
      'deck.diff': '核對',
      'deck.plan': '規劃',
      'hero.title': '履程：面向香港與內地，把履歷對齊真實崗位',
      'hero.focusLabel': '地區就業市場痛點',
      'hero.tablistAria': '選擇地區以檢視痛點並自動調整地圖視角',
      'hero.mainland': '內地',
      'hero.hk': '香港',
      'hero.ml.h': '中國內地',
      'hero.ml.li1':
        '環境高度競爭，雇主極看重垂直實習與對口經歷，履歷與 JD 之間常見「匹配斷層」。',
      'hero.ml.li2':
        '職涯規劃近乎剛需，傳統高價諮詢卻將多數普通學生擋在門外，資訊與服務仍不對稱。',
      'hero.hk.h': '香港',
      'hero.hk.li1':
        '國際金融與多元產業並存，履歷需要經得住行業邏輯的審視，而非簡單資訊堆砌。',
      'hero.hk.li2': '篩選與匹配成本高，求職者難以及時看清崗位敘事與自身材料的差距。',
      'hero.cta': '進入功能介紹',
      'hero.scrollHint':
        '向下可展開<strong>產品閉環</strong>、<strong>技術選型</strong>與<strong>社會效益</strong>；能力由<strong>方舟大模型 + RAG + 串流交付</strong>支撐，把對齊 JD、補經歷與可執行規劃收成一條你能跟完的鏈路。',
      'hero.pipelineHeading': '產品閉環、技術選型與社會效益',
      'hero.statement':
        '把散落在各處的經歷，收成模型能讀懂、敢下判斷的一份敘事——再交回你手裡簽字。',
      'hero.acc1.title': '產品閉環',
      'hero.acc1.tag': '六步 · 錄入 → 規劃',
      'hero.acc2.title': '技術選型',
      'hero.acc2.tag': '模型 · RAG · 工程棧',
      'hero.acc3.title': '社會效益',
      'hero.acc3.tag': '普惠 · 匹配 · 賦權',
      'hero.flow1':
        '<strong>錄入</strong> — 履歷與多份 JD 結構化入庫，解析綁定工作階段，後續分析、改寫、追問共用<strong>同一份可對齊的上下文</strong>。',
      'hero.flow2':
        '<strong>分析</strong> — 履歷 × 多崗位匹配推理；長報告以 <abbr title="Server-Sent Events">SSE</abbr> 漸進送達，少白屏、多「看得見在推」。',
      'hero.flow3':
        '<strong>改寫</strong> — 依教育 / 實習 / 專案等模組分段生成；口述經歷經 ASR 再進大模型整理與改寫，多模態進同一條管線。',
      'hero.flow4':
        '<strong>補資訊</strong> — 模型驅動追問與選項，缺口補齊後寫回工作階段，再餵回生成鏈路。',
      'hero.flow5':
        '<strong>核對</strong> — 原文與改寫並排、差異醒目提示，確認後再採納，閉環可審計。',
      'hero.flow6':
        '<strong>規劃</strong> — 模型歸納投遞時間線與行動建議，長內容支援屏內捲動讀完，從材料落到「下一步做什麼」。',
      'hero.tech1':
        '<strong>火山引擎方舟（豆包）大模型</strong> — OpenAI 相容 API（北京區域端點），統一客戶端與模型版本切換。',
      'hero.tech2':
        '<strong>檢索增強（RAG）</strong> — 崗位描述與履歷結構化片段檢索相關上下文，再交由大模型做分析、追問與改寫；索引形態隨迭代對齊。',
      'hero.tech3':
        '<strong>多場景 prompt 與鏈式編排</strong> — 分析、改寫、追問、規劃、語音整理等分場景模板與呼叫鏈（可搭配 LangChain 組織複雜邏輯）。',
      'hero.tech4':
        '<strong>SSE 串流分析</strong> — 長上下文與多 JD 下伺服器推送分段呈現，避免一次等待大段 JSON 的斷裂感。',
      'hero.tech5':
        '<strong>ASR + LLM</strong> — 火山語音辨識與大模型總結 / 追問銜接；前端可選用 WebSocket 串流轉寫，口述快速進入結構化流程。',
      'hero.techFoot':
        '工程底座：React、TypeScript、Vite、Tailwind；FastAPI；Supabase（PostgreSQL）；前端 Vercel。交付與擴展的底子，差異化仍在模型與資料鏈。',
      'hero.social1':
        '履歷與 JD 錯位、招聘初篩成本高，疊加高價職涯規劃，常把普通求職者擋在機會之外。履程用 AI 把深度對齊崗位、挖掘既有優勢與實習路徑建議做成可反覆使用的輔助，壓低門檻，讓缺少資源背景的人也能持續獲得像樣的支持。',
      'hero.social2':
        '人與崗匹配更準，盲投與誤篩略減，社會層面的人力資源配置會更健康；用技術降低資訊與服務的門檻，也是在放大普通人的可見度與選擇權。',
      'feat.input.eyebrow': '錄入',
      'feat.input.title': '結構化入口：給模型「可對齊」的履歷與 JD',
      'feat.input.body':
        '材料散在 PDF、Word 和好幾段 JD 裡，模型只能猜——猜多了，後面每一步都帶噪。',
      'feat.input.detail':
        '上傳 + 多崗位並行錄入，後端以 PyPDF2、python-docx 等解析，REST 寫入工作階段與崗位表（Supabase）。<strong>統一結構化輸入</strong>，讓後續 RAG 與生成少做「格式偵探」，多做判斷。',
      'feat.input.caption': '產品介面（嵌入模式版面，與前端同源樣式類名）',
      'feat.analysis.eyebrow': '分析',
      'feat.analysis.title': '匹配分析：RAG 上下文 + 大模型推理',
      'feat.analysis.body':
        'JD 又長又繞，多崗位並排時人眼先投降。要的是一眼看清「差在哪」，不是一份打不開的說明書。',
      'feat.analysis.detail':
        '履歷與 JD 的結構化片段先檢索對齊，再交給方舟大模型歸納差距與補強方向；前端以 <abbr title="Server-Sent Events">SSE</abbr> 串流接片段，配上摘要與維度圖表。長分析可以<strong>邊生成邊讀完</strong>，你始終知道系統正在往哪走，而不是對著空白乾等。',
      'feat.rewrite.eyebrow': '改寫',
      'feat.rewrite.title': '分段改寫與口述進模型',
      'feat.rewrite.body':
        '整頁丟給模型改寫，像閉眼踩油門：你不知道它動了哪一句。拆開按模組改，才敢對自己負責。',
      'feat.rewrite.detail':
        '教育 / 實習 / 專案分段提交；口述可走火山 ASR，再進大模型整理成可追問草稿。後端 <code>voice</code> 與方舟鏈路銜接，前端也可接 <strong>WebSocket 串流轉寫</strong>，語音與文字走同一條生成管線，少一道複製貼上。',
      'feat.rewrite.caption': '產品介面（改寫頁 · 嵌入模式）',
      'feat.followup.eyebrow': '補資訊',
      'feat.followup.title': '模型驅動追問：把缺口補回上下文',
      'feat.followup.body':
        '經歷寫不細，模型不敢編；硬編了，你更不敢投。要的是它問你答，把洞補上，而不是一次 prompt 賭命。',
      'feat.followup.detail':
        '大模型點名缺口，生成追問與可點選項；回答與履歷片段一併寫回工作階段，再驅動改寫。你可選用<strong>手動輸入</strong>逐條寫細，或<strong>智慧選項</strong>快速點選——人機協同把上下文補滿，再進入下一輪改寫。',
      'feat.followup.variantLabel': '切換演示',
      'feat.followup.selectLabel': '演示切換',
      'feat.followup.tab0': '手動輸入',
      'feat.followup.tab1': '智慧選項',
      'followup.variant.0.title': '手動補充',
      'followup.variant.0.blurb':
        '親手把經歷寫細：模型接住你的字句，併入上下文，下一輪改寫才有憑有據。',
      'followup.variant.1.title': '智慧選項',
      'followup.variant.1.blurb':
        '模型先出結構化選項，你點選即寫入上下文——少冷啟動，多「像在和顧問對齊」。',
      'feat.diff.eyebrow': '核對',
      'feat.diff.title': '可審計的採納閉環',
      'feat.diff.body':
        '黑盒改寫不敢簽字：你不知道它「優化」掉了什麼真實經歷。並排看清楚，再點採納。',
      'feat.diff.detail':
        '結構化 diff 標出改動範圍，後端要點與說明可與並排檢視對照，每一處改動<strong>有據可查</strong>。採納前你能自己對齊「改了什麼、為什麼改」，心裡踏實再儲存。',
      'feat.diff.caption': '產品介面（DiffViewer 並排結構）',
      'feat.plan.hint':
        '規劃報告同樣跟著屏內捲動走——長內容需要<strong>完整的閱讀動線</strong>，你可以從頭到尾跟完，而不是被截成幾段就丟。',
      'feat.plan.eyebrow': '規劃',
      'feat.plan.title': '投遞時間線：模型生成的行動草案',
      'feat.plan.body':
        '材料改完了仍不知道下週做什麼——焦慮從「寫不好」變成「動不了」。要的是能執行的月曆，不是雞湯清單。',
      'feat.plan.detail':
        '方舟大模型結合履歷與前置分析出規劃草案，經 <code>plan</code> API 落庫，與錄入—分析—改寫串成閉環。<strong>從材料到行動</strong>可複看、可跟進，投遞節奏落在同一條鏈路上。',
    },
    en: {
      'page.title': 'CVCoach — LLM-powered resume and job-search path assistant',
      'page.desc':
        'Structure resumes and JDs first, then RAG alignment, sectioned rewriting, and auditable adoption—Volcengine Ark + SSE/ASR in one closed pipeline.',
      'logo.brand': 'CVCoach',
      'logo.tag': '',
      'lang.label': 'Language',
      'lang.zhCN': '简体中文',
      'lang.zhTW': '繁體中文',
      'lang.en': 'English',
      'nav.input': 'Input',
      'nav.analysis': 'Analysis',
      'nav.rewrite': 'Rewrite',
      'nav.followup': 'Follow-up',
      'nav.diff': 'Review',
      'nav.plan': 'Plan',
      'deck.hero': 'Cover',
      'deck.input': 'Input',
      'deck.analysis': 'Analysis',
      'deck.rewrite': 'Rewrite',
      'deck.followup': 'Follow-up',
      'deck.diff': 'Review',
      'deck.plan': 'Plan',
      'hero.title': 'CVCoach: align your resume with real roles in Hong Kong and Mainland China',
      'hero.focusLabel': 'Regional hiring pain points',
      'hero.tablistAria': 'Pick a region to read pain points and adjust the map view',
      'hero.mainland': 'Mainland',
      'hero.hk': 'Hong Kong',
      'hero.ml.h': 'Mainland China',
      'hero.ml.li1':
        'Fierce competition: employers expect vertical internships and on-target experience; resumes and JDs often sit in a “match gap.”',
      'hero.ml.li2':
        'Career planning feels mandatory, yet pricey consulting shuts out most students—information and services stay asymmetric.',
      'hero.hk.h': 'Hong Kong',
      'hero.hk.li1':
        'Finance and diverse industries demand resumes that survive industry logic—not a flat list of facts.',
      'hero.hk.li2':
        'Screening is costly; candidates struggle to see how role narratives differ from their materials.',
      'hero.cta': 'Explore the product flow',
      'hero.scrollHint':
        'Scroll down for <strong>the product loop</strong>, <strong>technical choices</strong>, and <strong>social impact</strong>—powered by <strong>Volcengine Ark + RAG + streaming delivery</strong>, turning JD alignment, experience gaps, and actionable plans into one track you can follow.',
      'hero.pipelineHeading': 'Product loop, technical stack, and social impact',
      'hero.statement':
        'Turn scattered experience into a narrative the model can read and judge—then hand it back to you to sign off.',
      'hero.acc1.title': 'Product loop',
      'hero.acc1.tag': 'Six steps · Input → Plan',
      'hero.acc2.title': 'Technical stack',
      'hero.acc2.tag': 'Model · RAG · Engineering',
      'hero.acc3.title': 'Social impact',
      'hero.acc3.tag': 'Access · Fit · Agency',
      'hero.flow1':
        '<strong>Input</strong> — Resumes and multiple JDs are structured and tied to a session so analysis, rewrite, and follow-up share <strong>one alignable context</strong>.',
      'hero.flow2':
        '<strong>Analysis</strong> — Resume × multi-role matching; long reports stream via <abbr title="Server-Sent Events">SSE</abbr> so you see progress instead of a blank wait.',
      'hero.flow3':
        '<strong>Rewrite</strong> — Section-by-section generation (education, internships, projects); voice goes through ASR into the same multimodal pipeline.',
      'hero.flow4':
        '<strong>Follow-up</strong> — Model-driven questions and chips; answers write back to the session and feed the next generation pass.',
      'hero.flow5':
        '<strong>Review</strong> — Original vs rewrite side by side with diff highlights; adopt only after you confirm—an auditable loop.',
      'hero.flow6':
        '<strong>Plan</strong> — Timeline and next actions from the model; long output scrolls in-page so materials land on “what to do next.”',
      'hero.tech1':
        '<strong>Volcengine Ark (Doubao) LLMs</strong> — OpenAI-compatible API (Beijing region), one client and version control.',
      'hero.tech2':
        '<strong>RAG</strong> — Retrieve structured JD and resume snippets for context before analysis, follow-up, and rewrite; index shape evolves with the product.',
      'hero.tech3':
        '<strong>Prompts & chains</strong> — Per-scenario templates for analysis, rewrite, follow-up, planning, and voice cleanup (e.g. via LangChain).',
      'hero.tech4':
        '<strong>SSE streaming</strong> — Chunked server push for long context and multiple JDs, avoiding one giant JSON pause.',
      'hero.tech5':
        '<strong>ASR + LLM</strong> — Volcengine speech tied to summarization and follow-up; optional WebSocket streaming transcription on the web.',
      'hero.techFoot':
        'Stack: React, TypeScript, Vite, Tailwind; FastAPI; Supabase (PostgreSQL); frontend on Vercel. Plumbing for delivery; differentiation is model and data flow.',
      'hero.social1':
        'Misaligned resumes and JDs, costly screening, and expensive coaching often block everyday candidates. CVCoach uses AI to make deep JD alignment, strength mining, and internship-path advice reusable—lowering the bar so people without privileged access still get solid support.',
      'hero.social2':
        'Better person–role fit means less spray-and-pray and fewer bad screens—healthier allocation of talent. Lowering the cost of information and services expands visibility and choice for more people.',
      'feat.input.eyebrow': 'Input',
      'feat.input.title': 'Structured entry: resumes and JDs the model can align to',
      'feat.input.body':
        'When materials live across PDFs, Word files, and several JDs, the model guesses—and noise compounds downstream.',
      'feat.input.detail':
        'Upload plus parallel JD entry; backend parsing (PyPDF2, python-docx, etc.) and REST into session and role tables (Supabase). <strong>One structured input surface</strong> so RAG and generation spend less time on format detective work.',
      'feat.input.caption': 'Product UI (embedded layout, same utility classes as the app)',
      'feat.analysis.eyebrow': 'Analysis',
      'feat.analysis.title': 'Match analysis: RAG context + LLM reasoning',
      'feat.analysis.body':
        'Long, winding JDs and multiple roles exhaust the eye. You need to see the gap—not an unreadable manual.',
      'feat.analysis.detail':
        'Structured resume and JD snippets are retrieved and aligned, then Ark summarizes gaps and fixes; the UI consumes <abbr title="Server-Sent Events">SSE</abbr> chunks with summaries and charts. You can <strong>read as it generates</strong> instead of staring at a spinner.',
      'feat.rewrite.eyebrow': 'Rewrite',
      'feat.rewrite.title': 'Section rewrite and voice into the model',
      'feat.rewrite.body':
        'Throwing a whole page at the model is like driving blind—you cannot see what moved. Sections make it accountable.',
      'feat.rewrite.detail':
        'Education / internship / project slices; voice via Volcengine ASR into draft follow-ups. Backend <code>voice</code> ties to Ark; the web can use <strong>WebSocket streaming transcription</strong> on the same generation path—no extra copy-paste.',
      'feat.rewrite.caption': 'Product UI (rewrite page · embedded)',
      'feat.followup.eyebrow': 'Follow-up',
      'feat.followup.title': 'Model-driven Q&A: fill gaps back into context',
      'feat.followup.body':
        'Thin experience means the model cannot invent; invented text is worse. You answer its questions and close the holes—not one risky mega-prompt.',
      'feat.followup.detail':
        'The model names gaps, generates prompts and tappable options; answers and resume snippets write back to the session and drive the next rewrite. Choose <strong>manual typing</strong> line by line or <strong>smart chips</strong> for speed—human-in-the-loop until context is full.',
      'feat.followup.variantLabel': 'Switch demo',
      'feat.followup.selectLabel': 'Demo mode',
      'feat.followup.tab0': 'Manual input',
      'feat.followup.tab1': 'Smart options',
      'followup.variant.0.title': 'Manual fill-in',
      'followup.variant.0.blurb':
        'You write the detail; the model absorbs it into context so the next rewrite is grounded.',
      'followup.variant.1.title': 'Smart options',
      'followup.variant.1.blurb':
        'Structured choices from the model—tap to write context with less cold start, closer to chatting with a coach.',
      'feat.diff.eyebrow': 'Review',
      'feat.diff.title': 'An auditable adopt loop',
      'feat.diff.body':
        'Black-box rewrite is hard to sign: you do not know which real lines vanished. Side-by-side diff, then adopt.',
      'feat.diff.detail':
        'Structured diff scopes changes; backend notes map to the view—every change is <strong>traceable</strong>. You reconcile what changed and why before you save with confidence.',
      'feat.diff.caption': 'Product UI (DiffViewer side-by-side)',
      'feat.plan.hint':
        'The plan report scrolls with the slide—long content needs a <strong>full reading path</strong> you can finish, not shards that disappear.',
      'feat.plan.eyebrow': 'Plan',
      'feat.plan.title': 'Application timeline: model-drafted actions',
      'feat.plan.body':
        'After edits, “what next week?” anxiety replaces writing anxiety. You need a calendar of moves, not slogans.',
      'feat.plan.detail':
        'Ark drafts plans from resume and prior analysis, persisted via <code>plan</code> API, chained with input—analysis—rewrite. <strong>From materials to action</strong>: reviewable, trackable, same pipeline as the rest.',
    },
  };

  const LANG_HTML = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-Hant', en: 'en' };

  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
  if (!STRINGS[currentLang]) currentLang = 'en';

  function t(key) {
    const pack = STRINGS[currentLang];
    if (!pack || pack[key] == null) return STRINGS['zh-CN'][key] || '';
    return pack[key];
  }

  function applyMeta() {
    const titleEl = document.querySelector('title');
    if (titleEl) titleEl.textContent = t('page.title');
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('page.desc'));
  }

  function applyDom() {
    document.documentElement.lang = LANG_HTML[currentLang] || 'en';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const val = t(key);
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', t(key));
    });

    document.querySelectorAll('option[data-i18n]').forEach((opt) => {
      const key = opt.getAttribute('data-i18n');
      if (key) opt.textContent = t(key);
    });

    const trigger = document.getElementById('lang-switch-trigger');
    if (trigger) {
      const labelKey =
        currentLang === 'zh-CN' ? 'lang.zhCN' : currentLang === 'zh-TW' ? 'lang.zhTW' : 'lang.en';
      trigger.textContent = t(labelKey);
    }

    const menuItems = document.querySelectorAll('[data-lang-option]');
    menuItems.forEach((item) => {
      const code = item.getAttribute('data-lang-option');
      item.setAttribute('aria-current', code === currentLang ? 'true' : 'false');
    });
  }

  function closeMenu() {
    const menu = document.getElementById('lang-switch-menu');
    const trigger = document.getElementById('lang-switch-trigger');
    if (menu) {
      menu.hidden = true;
    }
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  }

  function openMenu() {
    const menu = document.getElementById('lang-switch-menu');
    const trigger = document.getElementById('lang-switch-trigger');
    if (menu) {
      menu.hidden = false;
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }

  function setLang(code) {
    if (!STRINGS[code]) return;
    currentLang = code;
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (_) {}
    applyMeta();
    applyDom();
    closeMenu();
    window.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: code } }));
  }

  function bindDropdown() {
    const root = document.querySelector('[data-lang-dropdown]');
    const trigger = document.getElementById('lang-switch-trigger');
    const menu = document.getElementById('lang-switch-menu');
    if (!root || !trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = trigger.getAttribute('aria-expanded') === 'true';
      if (open) closeMenu();
      else openMenu();
    });

    menu.querySelectorAll('[data-lang-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-lang-option');
        if (code) setLang(code);
      });
    });

    document.addEventListener('click', () => closeMenu());
    root.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  window.SITE_I18N = {
    t,
    getLang: () => currentLang,
    setLang,
    applyDom,
    STRINGS,
  };

  function init() {
    applyMeta();
    applyDom();
    bindDropdown();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
