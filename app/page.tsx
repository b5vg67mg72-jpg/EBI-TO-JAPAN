"use client";
/* eslint-disable @next/next/no-img-element -- vinext's next/image shim causes client hook errors. */

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Lang = "ja" | "en" | "zh" | "zh-TW";
type AnalysisResult = {
  label: string;
  score: number;
  level: string;
  confidence: number;
  confidenceLabel: string;
  language: string;
  characters: number;
  sentenceCount: number;
  reason: string;
  metrics: { label: string; value: number; positive?: boolean }[];
  flags: string[];
  suggestions: string[];
};
type UploadedResource = { id: string; title: string; description: string; category: string; language: string; accessLevel: "public" | "group" | "paid"; resourceKind: "study" | "exam"; schoolName: string; faculty: string; examYear: string; subject: string; priceYen: number; purchaseUrl: string | null; previewUrl: string | null; fileName: string; contentType: string; sizeBytes: number; downloadUrl: string | null };

const copy = {
  ja: {
    nav: ["EJU対策", "録画授業", "英語対策", "校内考過去問", "大学情報", "AIツール"], consult: "無料相談",
    eyebrow: "EBI STUDY RESOURCE LIBRARY", heroA: "日本留学の勉強を、", heroB: "ここから始めよう。",
    lead: "EJU対策、録画授業、英語試験の準備をひとつの場所に。今の目標に必要な教材へ、すぐに進めます。",
    free: "無料EJU動画を見る", proof: ["分野別に整理", "スマホ対応", "継続更新"],
    areas: "目的から選ぶ、3つの学習エリア。", areaLead: "試験対策・授業・英語の順に整理し、次に見るべき教材をすぐに見つけられます。",
    cards: [
      ["01", "EJU対策資料", "無料動画、日本語、総合科目、数学、理科", "科目別ガイドを見る"],
      ["02", "録画授業", "基礎から演習まで繰り返し学べる講義", "授業一覧を見る"],
      ["03", "英語対策", "TOEFL・TOEIC・大学別の出願要件", "英語対策を見る"],
    ],
    freeTitle: "EJU日本語 精聴・精読のはじめ方", freeBody: "まずは短い無料授業で、問題を解くだけで終わらない復習方法を体験してください。",
    freeList: ["精聴・精読の基本ステップ", "間違いを得点につなげる方法", "実践しやすい復習ルーティン"], join: "学習グループに参加",
    dataKicker: "UNIVERSITY DATA", dataA: "感覚ではなく、", dataB: "データで大学を選ぶ。",
    dataBody: "募集要項、学部・学科、EJU・英語要件、出願日程を整理し、実行しやすい受験計画へつなげます。",
    publicTitle: "誰でも閲覧できる情報", publicItems: ["募集要項・出願日程", "学部・専攻・試験科目", "公表された合格率・倍率"],
    memberTitle: "受講生限定の分析", memberItems: ["大学別の得点ポジション", "過去問の出題傾向", "個別の併願・日程戦略"],
    aiKicker: "SHIBO RIYUSHO AI DETECTOR", aiTitle: "志望理由書 AI検出ツール", aiBody: "志望理由書に特化し、文体・定型表現・具体性・本人らしさからAI作成の可能性を分析します。文章はブラウザ内で処理され、保存されません。",
    statement: "チェックする志望理由書", statementPh: "志望理由書を貼り付けてください", reference: "比較する参考文章（任意）", referencePh: "テンプレートや参考文章を貼り付けてください",
    aiBtn: "AIリスクを分析", simBtn: "類似度をチェック", sample: "サンプルを入力", inputNeeded: "入力内容を確認してください", empty: "先に志望理由書を入力してください。", referenceRequired: "類似度を確認するには、比較する参考文章も入力してください。", confidence: "判定の信頼度", tooShort: "精度を上げるため、120文字以上の文章を入力してください。", privacy: "入力内容は送信・保存されません", detectorNote: "日本語・中国語・英語に対応", textStats: ["検出言語", "文字数", "文の数"], languageNames: ["日本語", "中国語", "英語", "混在・不明"], sentencesUnit: "文",
    aiLabel: "AI作成の可能性", simLabel: "文章の類似度", low: "低い", mid: "中程度", high: "高い",
    aiReason: "文章の均一さ、定型表現、具体的な経験の量から推定しました。", simReason: "文章内の長い表現と、貼り付けた参考文章を比較しました。",
    disclaimer: "結果は参考情報です。AI作成や盗用を断定するものではなく、インターネット全体を検索する全庫型判定ではありません。",
    chars: "文字", clear: "入力をクリア", signals: "検出したポイント", suggestions: "改善のヒント", noSignals: "目立つ問題は見つかりませんでした。",
    metricNames: ["文体の均一さ", "定型表現", "具体的な情報", "本人らしさ", "語彙の多様性", "反復表現", "参考文との一致"],
    flagTexts: ["文の長さとリズムが非常に均一です。", "よく使われる定型表現・接続表現が多く見られます。", "経験・数字・授業名などの具体的な情報が少なめです。", "同じ長い表現が文章内で繰り返されています。", "参考文と共通する長い表現があります。", "自分の行動や感情を示す一人称表現が少なめです。", "語彙の種類が少なく、似た言葉が続いています。"],
    advice: ["自分だけの出来事を、状況・行動・結果の順で具体的に書きましょう。", "大学名だけでなく、授業・ゼミ・教授・制度と目標のつながりを説明しましょう。", "同じ長さの文が続く部分を見直し、短文と長文にリズムをつけましょう。", "定型表現を、自分が実際に感じた言葉へ置き換えましょう。", "参考文と似た箇所は引用せず、自分の経験から書き直しましょう。", "「私は何を見て、どう考え、何をしたか」を自分の言葉で加えましょう。", "繰り返している名詞や形容詞を、より具体的な表現に置き換えましょう。"],
    uploadKicker: "NEW RESOURCES", uploadTitle: "最新の学習資料", uploadLead: "管理者が追加した教材は、公開後すぐにここへ表示されます。", download: "ダウンロード", groupOnly: "学習グループで受け取る", noUploads: "新しい公開資料は準備中です。", admin: "管理者ログイン",
    examKicker: "PAST EXAM SHOP", examTitle: "大学別・校内考の過去問", examLead: "大学・学部・年度・科目から必要な過去問を選べます。購入前に商品情報とサンプルをご確認ください。", examEmpty: "校内考の過去問商品は準備中です。", preview: "サンプルを見る", buy: "購入する", inquire: "購入について問い合わせる", yen: "円", protected: "購入後に完全版をご案内します。",
    services: "学習と進学を、一つの流れで支える。", serviceCards: [["EJU月額講座", "精聴・精読、学習計画、質問対応"], ["マンツーマン指導", "苦手科目と大学独自試験の準備"], ["大学受験総合プラン", "大学選び、出願書類、志望理由書、面接"]],
    contactTitle: "日本への一歩、ここから。", contactBody: "まだ何も決まっていなくても大丈夫。まずは、あなたの話を聞かせてください。", name: "お名前", email: "メールアドレス", message: "相談したい内容", send: "無料相談を予約する", sending: "送信中…", sent: "お問い合わせを受け付けました。担当者からご連絡します。", sendError: "送信できませんでした。時間をおいてもう一度お試しください。", freeRequest: "無料EJU動画の視聴を希望します。",
  },
  en: {
    nav: ["EJU Resources", "Recorded Classes", "English Prep", "Past Exams", "University Data", "AI Tools"], consult: "Free consultation",
    eyebrow: "EBI STUDY RESOURCE LIBRARY", heroA: "Prepare for study in Japan,", heroB: "all in one place.",
    lead: "EJU resources, recorded classes, and English-test preparation in one clear library. Go straight to what you need next.",
    free: "Watch the free EJU lesson", proof: ["Organized by subject", "Mobile friendly", "Continuously updated"],
    areas: "Three clear learning paths.", areaLead: "Move from test resources to recorded lessons and English preparation without losing your place.",
    cards: [["01", "EJU Resources", "Free videos, Japanese, Japan & the World, math, and science", "View subject guides"], ["02", "Recorded Classes", "Repeatable lessons from foundations to practice", "View all classes"], ["03", "English Preparation", "TOEFL, TOEIC, and university requirements", "View English prep"]],
    freeTitle: "Getting started with intensive EJU listening and reading", freeBody: "Try a short free lesson and learn a review method that goes beyond simply answering questions.",
    freeList: ["Core listening and reading steps", "Turn mistakes into points", "A practical review routine"], join: "Join the study group",
    dataKicker: "UNIVERSITY DATA", dataA: "Choose with evidence,", dataB: "not guesswork.", dataBody: "We organize admissions guides, programs, EJU and English requirements, and application dates into an actionable plan.",
    publicTitle: "Public information", publicItems: ["Admissions guides and dates", "Programs and exam subjects", "Published acceptance rates"], memberTitle: "Class-member analysis", memberItems: ["Score-position analysis", "Past-exam trends", "Personal application strategy"],
    aiKicker: "SHIBO RIYUSHO AI DETECTOR", aiTitle: "Statement of Purpose AI Detector", aiBody: "Designed for Japanese university statements. It assesses writing rhythm, formulaic language, specificity, and personal voice. Text is analyzed in your browser and is not stored.",
    statement: "Statement to check", statementPh: "Paste your statement here", reference: "Reference text (optional)", referencePh: "Paste a template or reference text", aiBtn: "Analyze AI risk", simBtn: "Check similarity", sample: "Use sample", inputNeeded: "Check your input", empty: "Enter a statement first.", referenceRequired: "Add a reference text before running the similarity check.", confidence: "Detection confidence", tooShort: "Enter at least 120 characters for a more reliable result.", privacy: "Your text is not sent or stored", detectorNote: "Supports Japanese, Chinese, and English", textStats: ["Language", "Characters", "Sentences"], languageNames: ["Japanese", "Chinese", "English", "Mixed / unknown"], sentencesUnit: "sentences",
    aiLabel: "AI-written likelihood", simLabel: "Text similarity", low: "Low", mid: "Moderate", high: "High", aiReason: "Estimated from writing consistency, formulaic phrasing, and the amount of specific personal detail.", simReason: "Compared long phrases within the statement and against the reference text you supplied.", disclaimer: "This is a reference signal, not proof of AI use or plagiarism, and it does not search the entire internet.",
    chars: "characters", clear: "Clear text", signals: "Signals found", suggestions: "How to improve", noSignals: "No prominent issues were found.",
    metricNames: ["Style uniformity", "Formulaic language", "Concrete details", "Personal voice", "Vocabulary diversity", "Repetition", "Reference overlap"],
    flagTexts: ["Sentence lengths and rhythm are unusually uniform.", "The statement uses many common template or transition phrases.", "There are few personal events, numbers, class names, or other concrete details.", "Long phrases repeat within the statement.", "Long phrases overlap with the supplied reference.", "There is little first-person language showing your own actions or feelings.", "Vocabulary is limited and similar words recur frequently."],
    advice: ["Describe one personal event through its situation, your action, and the result.", "Connect specific classes, seminars, faculty, or programs to your goal, not only the university name.", "Vary the rhythm by reviewing sections where sentences have nearly identical lengths.", "Replace template phrases with words that reflect what you actually experienced.", "Rewrite overlapping passages from your own experience instead of borrowing the reference wording.", "Add what you saw, thought, and did in your own words.", "Replace repeated nouns and adjectives with more precise details."],
    uploadKicker: "NEW RESOURCES", uploadTitle: "Latest study materials", uploadLead: "Materials added by the administrator appear here as soon as they are published.", download: "Download", groupOnly: "Get it in the study group", noUploads: "New public resources are being prepared.", admin: "Administrator login",
    examKicker: "PAST EXAM SHOP", examTitle: "University entrance past exams", examLead: "Browse by university, faculty, year, and subject. Review the item details and sample before purchasing.", examEmpty: "Past-exam products are being prepared.", preview: "View sample", buy: "Buy now", inquire: "Ask to purchase", yen: "JPY", protected: "The complete file is provided after purchase.",
    services: "Learning and admissions support in one clear path.", serviceCards: [["Monthly EJU Course", "Listening, reading, planning, and Q&A"], ["One-to-one Tutoring", "Weak subjects and university-specific exams"], ["Complete Admissions Plan", "University choice, documents, statement, and interview"]],
    contactTitle: "Your first step toward Japan starts here.", contactBody: "It is okay if nothing is decided yet. Tell us where you are and what you need.", name: "Name", email: "Email", message: "How can we help?", send: "Book a free consultation", sending: "Sending…", sent: "Thank you. Your request has been received and our team will contact you.", sendError: "Your request could not be sent. Please try again shortly.", freeRequest: "I would like access to the free EJU lesson.",
  },
  zh: {
    nav: ["EJU资料", "录播课程", "英语备考", "校内考真题", "大学信息", "AI工具"], consult: "免费咨询",
    eyebrow: "EBI 日本留学学习资料库", heroA: "日本留学备考，", heroB: "从这里开始。", lead: "EJU资料、录播课程与英语考试准备，都集中在一个清晰的网站中。根据目标，快速找到需要的内容。",
    free: "观看免费EJU课程", proof: ["按科目整理", "手机适配", "持续更新"], areas: "三大学习专区。", areaLead: "按照考试资料、录播课程、英语备考的顺序整理，让下一步一目了然。",
    cards: [["01", "EJU资料", "免费视频、日语、文综、数学、理科", "查看科目资料"], ["02", "录播课程", "从基础到练习，可反复观看", "查看全部课程"], ["03", "英语备考", "TOEFL、TOEIC与大学要求", "查看英语备考"]],
    freeTitle: "EJU日语精听精读入门", freeBody: "先体验一节短小的免费课程，学习不止于做题的复习方法。", freeList: ["精听精读基本步骤", "把错误转化为得分", "容易执行的复习流程"], join: "加入学习群",
    dataKicker: "大学数据", dataA: "不凭感觉，", dataB: "用数据选择大学。", dataBody: "整理募集要项、专业、EJU与英语要求和出愿时间，形成可执行的申请计划。",
    publicTitle: "所有人可查看", publicItems: ["募集要项与出愿时间", "专业与考试科目", "公开的合格率与倍率"], memberTitle: "课程学员限定", memberItems: ["大学分数定位分析", "过去问出题趋势", "个人选校与时间策略"],
    aiKicker: "志望理由书 AI DETECTOR", aiTitle: "志望理由书 AI 检测器", aiBody: "针对日本大学志望理由书，从文风、模板表达、具体程度和个人经历等维度检测AI生成风险。文章仅在浏览器中分析，不会保存。",
    statement: "需要检查的志望理由书", statementPh: "请粘贴志望理由书", reference: "参考文章（选填）", referencePh: "请粘贴模板或参考文章", aiBtn: "分析 AI 风险", simBtn: "相似度检查", sample: "填入示例", inputNeeded: "请检查输入内容", empty: "请先输入志望理由书。", referenceRequired: "进行相似度检查前，请先填写参考文章。", confidence: "判定可信度", tooShort: "为提高准确度，请输入至少120字。", privacy: "输入内容不会上传或保存", detectorNote: "支持日语、中文和英语", textStats: ["文本语言", "字符数", "句子数"], languageNames: ["日语", "中文", "英语", "混合 / 未知"], sentencesUnit: "句",
    aiLabel: "AI生成的可能性", simLabel: "文章相似度", low: "较低", mid: "中等", high: "较高", aiReason: "根据行文一致性、模板表达和具体个人经历的数量估算。", simReason: "比较文章内部的长表达，并与您提供的参考文章进行对比。", disclaimer: "结果仅供参考，不能证明AI生成或抄袭，也不会搜索整个互联网。",
    chars: "字", clear: "清空内容", signals: "检测到的问题", suggestions: "修改建议", noSignals: "没有发现明显问题。",
    metricNames: ["文风一致性", "模板化表达", "具体信息", "个人表达", "词汇多样性", "文内重复", "参考文重合"],
    flagTexts: ["句子长度和行文节奏过于均匀。", "文章中出现了较多模板或连接表达。", "个人经历、数字、课程名等具体信息较少。", "文章内部存在重复的长表达。", "部分长表达与参考文章重合。", "体现本人行动或感受的第一人称表达较少。", "词汇种类较少，相似用词反复出现。"],
    advice: ["加入只有你本人才能写出的经历，并按情况、行动、结果展开。", "不要只写大学名称，要说明具体课程、研究室、教授或制度与目标的关系。", "检查长度相近的连续句子，适当搭配长句和短句。", "把模板化表达改成你真实体验后的语言。", "不要照搬参考文，请从自己的经历重新组织相似段落。", "加入“我看到了什么、怎么想、做了什么”等本人视角。", "把重复的名词或形容词换成更准确、具体的描述。"],
    uploadKicker: "最新资料", uploadTitle: "最新学习资料", uploadLead: "管理员上传并发布后，资料会立即显示在这里，不需要重新部署网站。", download: "下载资料", groupOnly: "加入学习群获取", noUploads: "新的公开资料正在准备中。", admin: "管理员登录",
    examKicker: "校内考真题商城", examTitle: "大学校内考往年真题", examLead: "可按大学、学部、年度和科目查看真题。购买前请确认商品信息，并可先查看试看文件。", examEmpty: "校内考真题商品正在准备中。", preview: "查看试看", buy: "立即购买", inquire: "咨询购买", yen: "日元", protected: "购买后获取完整真题文件。",
    services: "把学习与升学支持连成一条清晰路径。", serviceCards: [["EJU月课", "精听精读、学习规划、答疑"], ["一对一辅导", "薄弱科目与校内考准备"], ["大学升学全程规划", "选校、出愿材料、志望理由书、面试"]],
    contactTitle: "迈向日本的第一步，从这里开始。", contactBody: "即使还没有决定也没关系。先告诉我们你的情况和目标。", name: "姓名", email: "邮箱", message: "希望咨询的内容", send: "预约免费咨询", sending: "正在发送…", sent: "已收到您的咨询，工作人员会尽快与您联系。", sendError: "发送失败，请稍后重试。", freeRequest: "我想领取免费的EJU课程。",
  },
  "zh-TW": {
    nav: ["EJU 資料", "錄播課程", "英語備考", "校內考歷屆試題", "大學資訊", "AI 工具"], consult: "免費諮詢",
    eyebrow: "EBI 日本留學學習資料庫", heroA: "日本留學備考，", heroB: "從這裡開始。", lead: "EJU 資料、錄播課程與英語考試準備，都集中在一個清晰的網站中。根據目標，快速找到需要的內容。",
    free: "觀看免費 EJU 課程", proof: ["按科目整理", "手機適用", "持續更新"], areas: "三大學習專區。", areaLead: "按照考試資料、錄播課程、英語備考的順序整理，讓下一步一目了然。",
    cards: [["01", "EJU 資料", "免費影片、日語、文綜、數學、理科", "查看科目資料"], ["02", "錄播課程", "從基礎到練習，可反覆觀看", "查看全部課程"], ["03", "英語備考", "TOEFL、TOEIC 與大學要求", "查看英語備考"]],
    freeTitle: "EJU 日語精聽精讀入門", freeBody: "先體驗一堂簡短的免費課程，學習不止於做題的複習方法。", freeList: ["精聽精讀基本步驟", "把錯誤轉化為得分", "容易執行的複習流程"], join: "加入學習群",
    dataKicker: "大學資料", dataA: "不憑感覺，", dataB: "用資料選擇大學。", dataBody: "整理招生簡章、科系、EJU 與英語要求及申請時間，形成可執行的申請計畫。",
    publicTitle: "所有人皆可查看", publicItems: ["招生簡章與申請時間", "科系與考試科目", "公開的錄取率與報考倍率"], memberTitle: "課程學員限定", memberItems: ["大學分數定位分析", "歷屆試題出題趨勢", "個人選校與時間規劃"],
    aiKicker: "志望理由書 AI DETECTOR", aiTitle: "志望理由書 AI 偵測器", aiBody: "針對日本大學志望理由書，從文風、模板化表達、具體程度和個人經歷等面向評估 AI 生成風險。文章僅在瀏覽器中分析，不會儲存。",
    statement: "需要檢查的志望理由書", statementPh: "請貼上志望理由書", reference: "參考文章（選填）", referencePh: "請貼上範本或參考文章", aiBtn: "分析 AI 風險", simBtn: "檢查相似度", sample: "填入範例", inputNeeded: "請檢查輸入內容", empty: "請先輸入志望理由書。", referenceRequired: "進行相似度檢查前，請先填寫參考文章。", confidence: "判定可信度", tooShort: "為提高準確度，請輸入至少 120 字。", privacy: "輸入內容不會上傳或儲存", detectorNote: "支援日語、中文和英語", textStats: ["文章語言", "字數", "句數"], languageNames: ["日語", "中文", "英語", "混合／未知"], sentencesUnit: "句",
    aiLabel: "AI 生成的可能性", simLabel: "文章相似度", low: "較低", mid: "中等", high: "較高", aiReason: "根據行文一致性、模板化表達和具體個人經歷的數量估算。", simReason: "比較文章內部的較長片段，並與您提供的參考文章進行比對。", disclaimer: "結果僅供參考，不能證明文章由 AI 生成或涉及抄襲，也不會搜尋整個網際網路。",
    chars: "字", clear: "清除內容", signals: "偵測到的特徵", suggestions: "修改建議", noSignals: "沒有發現明顯問題。",
    metricNames: ["文風一致性", "模板化表達", "具體資訊", "個人表達", "詞彙多樣性", "文內重複", "參考文重合度"],
    flagTexts: ["句子長度和行文節奏過於一致。", "文章中出現較多模板或連接用語。", "個人經歷、數字、課程名稱等具體資訊較少。", "文章內部有較長的重複片段。", "部分較長片段與參考文章重合。", "呈現本人行動或感受的第一人稱表達較少。", "詞彙種類較少，相似用詞反覆出現。"],
    advice: ["加入只有您本人才能寫出的經歷，並依情境、行動、結果展開。", "不要只寫大學名稱，請說明具體課程、研究室、教授或制度與目標的關係。", "檢查長度相近的連續句子，適當搭配長句和短句。", "把模板化表達改成反映您真實體驗的語言。", "不要照搬參考文章，請依自己的經歷重新組織相似段落。", "加入『我看到了什麼、怎麼想、做了什麼』等本人視角。", "把重複的名詞或形容詞換成更準確、具體的描述。"],
    uploadKicker: "最新資料", uploadTitle: "最新學習資料", uploadLead: "管理員上傳並發布後，資料會立即顯示在這裡，不需重新部署網站。", download: "下載資料", groupOnly: "加入學習群取得", noUploads: "新的公開資料正在準備中。", admin: "管理員登入",
    examKicker: "校內考歷屆試題商店", examTitle: "大學校內考歷屆試題", examLead: "可依大學、學部、年度和科目查看試題。購買前請確認商品資訊，並可先查看試閱檔案。", examEmpty: "校內考歷屆試題商品正在準備中。", preview: "查看試閱", buy: "立即購買", inquire: "諮詢購買", yen: "日圓", protected: "購買後取得完整試題檔案。",
    services: "讓學習與升學支援形成清晰的路徑。", serviceCards: [["EJU 月課", "精聽精讀、學習規劃、答疑"], ["一對一輔導", "弱項科目與校內考準備"], ["大學升學全程規劃", "選校、申請資料、志望理由書、面試"]],
    contactTitle: "邁向日本的第一步，從這裡開始。", contactBody: "即使還沒有決定也沒關係。先告訴我們您的情況和目標。", name: "姓名", email: "電子郵件", message: "希望諮詢的內容", send: "預約免費諮詢", sending: "正在傳送…", sent: "已收到您的諮詢，工作人員會盡快與您聯絡。", sendError: "傳送失敗，請稍後重試。", freeRequest: "我想領取免費的 EJU 課程。",
  },
} as const;

function normalizeText(value: string) { return value.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, ""); }
function shingles(value: string, size = 9) { const clean = normalizeText(value); return Array.from({ length: Math.max(0, clean.length - size + 1) }, (_, i) => clean.slice(i, i + size)); }
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }
function detectLanguage(value: string) {
  const japanese = (value.match(/[\p{Script=Hiragana}\p{Script=Katakana}]/gu) || []).length;
  const han = (value.match(/\p{Script=Han}/gu) || []).length;
  const latin = (value.match(/[a-z]/gi) || []).length;
  if (japanese >= 3 && japanese >= latin * .2) return 0;
  if (han >= 3 && han > latin) return 1;
  if (latin >= 5 && latin > han) return 2;
  return 3;
}
function tokens(value: string) {
  const latin = value.toLowerCase().match(/[a-z][a-z'-]*/g) || [];
  const cjk = (value.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]+/gu) || []).flatMap(chunk => Array.from({ length: Math.max(1, chunk.length - 1) }, (_, index) => chunk.slice(index, index + 2)));
  return [...latin, ...cjk];
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [statement, setStatement] = useState("");
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [toolError, setToolError] = useState("");
  const [uploads, setUploads] = useState<UploadedResource[]>([]);
  const [contactMessage, setContactMessage] = useState("");
  const [contactState, setContactState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const t = copy[lang];
  const level = (score: number) => score >= 60 ? t.high : score >= 35 ? t.mid : t.low;
  const sampleStatements: Record<Lang, string> = {
    ja: "私は高校二年生のとき、地元商店街の空き店舗調査に参加しました。店主十五人に話を聞く中で、売上だけでは地域の価値を説明できないと気づきました。そこで来店理由と滞在時間を記録するアンケートを提案し、三人の仲間と二か月間調査しました。この経験から、人の行動をデータで捉え、地域政策につなげる経済学を学びたいと考えました。貴学の地域経済論とフィールドワークを通じて、地域の小規模事業者が継続できる仕組みを研究したいです。",
    en: "During my second year of high school, I joined a survey of vacant shops in my local shopping district. After interviewing fifteen shop owners, I realized that sales figures alone could not explain the district's value. I proposed tracking visitors' reasons and time spent in the area, then conducted a two-month survey with three classmates. That experience made me want to study how behavioral data can inform regional economic policy. Through your fieldwork program, I hope to research practical ways for small local businesses to remain sustainable.",
    zh: "高中二年级时，我参加了家乡商店街的空置店铺调查。在采访十五位店主的过程中，我发现只看销售额无法说明一个地区真正的价值。于是我提出记录顾客来访原因和停留时间，并和三位同学连续调查了两个月。这段经历让我希望学习如何用行为数据分析地区经济，并把研究结果用于实际政策。进入贵校后，我想通过地区经济课程和实地调查，研究帮助小型商户持续经营的方法。",
    "zh-TW": "高中二年級時，我參加了家鄉商店街的閒置店面調查。在訪問十五位店主的過程中，我發現只看營業額無法說明一個地區真正的價值。於是我提出記錄顧客來訪原因和停留時間，並和三位同學連續調查了兩個月。這段經歷讓我希望學習如何用行為資料分析地方經濟，並將研究結果運用於實際政策。進入貴校後，我想透過地方經濟課程和實地調查，研究協助小型商家持續經營的方法。",
  };

  useEffect(() => {
    fetch("/api/resources").then(response => response.ok ? response.json() : { resources: [] }).then((data: { resources?: UploadedResource[] }) => setUploads(data.resources || [])).catch(() => setUploads([]));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  }, [lang]);

  function checkAI() {
    if (!statement.trim()) { setResult(null); setToolError(t.empty); return; }
    setToolError("");
    const cleanLength = normalizeText(statement).length;
    const sentences = statement.split(/[。！？!?.]+/).map(sentence => sentence.trim()).filter(Boolean);
    const lengths = sentences.map(s => s.trim().length);
    const avg = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length);
    const variation = avg ? Math.sqrt(lengths.reduce((a, b) => a + (b - avg) ** 2, 0) / Math.max(1, lengths.length)) / avg : 0;
    const generic = (statement.match(/昔から|魅力を感じ|将来は|貢献したい|学びたいと考え|志望いたします|また|さらに|したがって|从小就|一直以来|贵校|为社会做贡献|综上所述|此外|因此|I have always|make a contribution|passionate about|furthermore|moreover|in conclusion/gi) || []).length;
    const details = (statement.match(/[0-9０-９]|教授|ゼミ|授業|研究室|大会|アルバイト|高校|部活|ボランティア|project|professor|course|internship|club|competition|课程|项目|实习|比赛|高中|社团|志愿/g) || []).length;
    const personal = (statement.match(/私[はがの]|自分|私自身|感じた|気づいた|経験した|取り組んだ|我|我的|亲自|感到|意识到|经历|I\b|my\b|me\b|myself|I’ve|I have/gi) || []).length;
    const allTokens = tokens(statement);
    const diversity = allTokens.length ? new Set(allTokens).size / allTokens.length : 0;
    const sentenceUniformity = clamp((1 - Math.min(variation, .75) / .75) * 100);
    const formulaRisk = clamp((generic / Math.max(1, sentences.length)) * 45);
    const detailStrength = clamp(details * 11 + Math.min(cleanLength / 18, 25));
    const personalVoice = clamp(personal * 10 + Math.min(variation * 45, 20));
    const vocabularyStrength = clamp((diversity - .35) * 155);
    const source = shingles(statement); const repeated = source.length ? 1 - new Set(source).size / source.length : 0;
    const repetitionRisk = clamp(repeated * 180);
    const confidence = clamp(Math.min(cleanLength / 4, 78) + Math.min(sentences.length * 2, 17));
    const evidenceScore = 12 + sentenceUniformity * .17 + formulaRisk * .22 + repetitionRisk * .1 + Math.max(0, 45 - detailStrength) * .25 + Math.max(0, 40 - personalVoice) * .2 + Math.max(0, 35 - vocabularyStrength) * .12;
    const score = clamp(50 + (evidenceScore - 50) * (0.35 + confidence / 155));
    const flags = [cleanLength < 120 ? t.tooShort : "", sentenceUniformity > 76 && sentences.length >= 4 ? t.flagTexts[0] : "", formulaRisk > 38 ? t.flagTexts[1] : "", detailStrength < 32 ? t.flagTexts[2] : "", repetitionRisk > 24 ? t.flagTexts[3] : "", personalVoice < 28 ? t.flagTexts[5] : "", vocabularyStrength < 25 && allTokens.length > 35 ? t.flagTexts[6] : ""].filter(Boolean);
    const suggestions = [detailStrength < 55 ? t.advice[0] : "", detailStrength < 45 ? t.advice[1] : "", sentenceUniformity > 72 ? t.advice[2] : "", formulaRisk > 30 ? t.advice[3] : "", personalVoice < 40 ? t.advice[5] : "", vocabularyStrength < 30 ? t.advice[6] : ""].filter(Boolean).slice(0, 4);
    setResult({ label: t.aiLabel, score, level: level(score), confidence, confidenceLabel: t.confidence, language: t.languageNames[detectLanguage(statement)], characters: cleanLength, sentenceCount: sentences.length, reason: cleanLength < 120 ? t.tooShort : t.aiReason, metrics: [{ label: t.metricNames[0], value: sentenceUniformity }, { label: t.metricNames[1], value: formulaRisk }, { label: t.metricNames[2], value: detailStrength, positive: true }, { label: t.metricNames[3], value: personalVoice, positive: true }, { label: t.metricNames[4], value: vocabularyStrength, positive: true }, { label: t.metricNames[5], value: repetitionRisk }], flags, suggestions });
  }

  function checkSimilarity() {
    if (!statement.trim()) { setResult(null); setToolError(t.empty); return; }
    if (!reference.trim()) { setResult(null); setToolError(t.referenceRequired); return; }
    setToolError("");
    const source = shingles(statement); const unique = new Set(source);
    const repeated = source.length ? 1 - unique.size / source.length : 0;
    const internalScore = clamp(repeated * 180);
    let referenceScore = 0;
    if (reference.trim()) { const other = new Set(shingles(reference)); const matches = [...unique].filter(x => other.has(x)).length; referenceScore = clamp(matches / Math.max(1, Math.min(unique.size, other.size)) * 100); }
    const score = referenceScore;
    const flags = [internalScore > 24 ? t.flagTexts[3] : "", referenceScore > 18 ? t.flagTexts[4] : ""].filter(Boolean);
    const suggestions = [internalScore > 24 ? t.advice[3] : "", referenceScore > 18 ? t.advice[4] : ""].filter(Boolean);
    const cleanLength = normalizeText(statement).length;
    const sentenceCount = statement.split(/[。！？!?.]+/).filter(Boolean).length;
    const confidence = clamp(Math.min(cleanLength / 4, 80) + 20);
    setResult({ label: t.simLabel, score, level: level(score), confidence, confidenceLabel: t.confidence, language: t.languageNames[detectLanguage(statement)], characters: cleanLength, sentenceCount, reason: t.simReason, metrics: [{ label: t.metricNames[5], value: internalScore }, { label: t.metricNames[6], value: referenceScore }], flags, suggestions });
  }

  function clearTool() { setStatement(""); setReference(""); setResult(null); setToolError(""); }
  function useSample() { setStatement(sampleStatements[lang]); setReference(""); setResult(null); setToolError(""); }

  const cards = useMemo(() => t.cards, [t]);
  const exams = uploads.filter(item => item.resourceKind === "exam");
  const studyUploads = uploads.filter(item => item.resourceKind !== "exam");

  function inquireAbout(item: UploadedResource) {
    const message = lang === "ja" ? `「${item.title}」（${item.schoolName}・${item.examYear}・${item.subject}）の購入を希望します。` : lang === "en" ? `I would like to purchase “${item.title}” (${item.schoolName}, ${item.examYear}, ${item.subject}).` : lang === "zh-TW" ? `我想購買《${item.title}》（${item.schoolName}・${item.examYear}・${item.subject}）。` : `我想购买《${item.title}》（${item.schoolName}・${item.examYear}・${item.subject}）。`;
    setContactMessage(message);
    requestAnimationFrame(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }));
  }

  function requestFreeLesson() {
    setContactMessage(t.freeRequest);
    setContactState("idle");
    requestAnimationFrame(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }));
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactState("sending");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/contact", { method: "POST", body: new FormData(form) });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || t.sendError);
      form.reset();
      setContactMessage("");
      setContactState("sent");
    } catch {
      setContactState("error");
    }
  }

  return <main>
    <header className="topbar"><a className="brand" href="#top"><img src="/ebi-icon.png" alt="EBI" width="44" height="44"/><span><b>EBI Studying in Japan</b><small>{lang === "zh" ? "日本留学支持" : lang === "zh-TW" ? "日本留學支援" : lang === "en" ? "Japan Study Support" : "日本留学サポート"}</small></span></a><nav>{t.nav.map((x, i) => <a key={x} href={["#resources", "#resources", "#resources", "#past-exams", "#data", "#ai"][i]}>{x}</a>)}</nav><div className="actions"><select aria-label="Language" value={lang} onChange={e => { setLang(e.target.value as Lang); setResult(null); setToolError(""); }}><option value="ja">日本語</option><option value="en">English</option><option value="zh">简体中文</option><option value="zh-TW">繁體中文</option></select><a className="button small" href="#contact">{t.consult}</a></div></header>

    <section className="hero" id="top"><div><p className="kicker">{t.eyebrow}</p><h1>{t.heroA}<em>{t.heroB}</em></h1><p className="lead">{t.lead}</p><a className="button" href="#free">{t.free} ↓</a><div className="proof">{t.proof.map(x => <span key={x}>✓ {x}</span>)}</div></div><div className="hero-stack">{cards.map(card => <a href="#resources" key={card[0]}><span>{card[0]}</span><div><small>EBI RESOURCE</small><h2>{card[1]}</h2><p>{card[2]}</p></div><b>→</b></a>)}</div></section>

    <section className="paper section" id="resources"><div className="section-head"><h2>{t.areas}</h2><p>{t.areaLead}</p></div><article className="free-card" id="free"><div className="free-art"><small>FREE LESSON</small><strong>聴<br/>読</strong><img src="/ebi-icon.png" alt="" width="130" height="130"/></div><div className="free-copy"><span>FREE EJU RESOURCE</span><h2>{t.freeTitle}</h2><p>{t.freeBody}</p><ul>{t.freeList.map(x => <li key={x}>✓ {x}</li>)}</ul><div><button type="button" className="button" onClick={requestFreeLesson}>{t.free} →</button><a href="#contact">{t.join} ↗</a></div></div></article><div className="resource-grid">{cards.map(card => <article key={card[0]}><span>{card[0]}</span><h3>{card[1]}</h3><p>{card[2]}</p><a href="#contact">{card[3]} →</a></article>)}</div></section>

    <section className="exam-shop section" id="past-exams"><div className="section-head"><div><p className="kicker">{t.examKicker}</p><h2>{t.examTitle}</h2></div><p>{t.examLead}</p></div>{exams.length ? <div className="exam-grid">{exams.map(item => <article key={item.id}><div className="exam-card-top"><span>{item.examYear}</span><small>{item.subject}</small></div><p className="exam-school">{item.schoolName}</p><h3>{item.title}</h3><p className="exam-meta">{[item.faculty, item.category].filter(Boolean).join(" · ")}</p><p className="exam-description">{item.description || t.protected}</p><div className="exam-price"><strong>¥{item.priceYen.toLocaleString()}</strong><small>{t.yen}</small></div><p className="protected-note">🔒 {t.protected}</p><div className="exam-actions">{item.previewUrl && <a href={item.previewUrl} target="_blank" rel="noreferrer">{t.preview} ↗</a>}{item.purchaseUrl ? <a className="button copper" href={item.purchaseUrl} target="_blank" rel="noreferrer">{t.buy} →</a> : <button className="button copper" onClick={() => inquireAbout(item)}>{t.inquire} →</button>}</div></article>)}</div> : <div className="exam-empty"><span>過去問</span><p>{t.examEmpty}</p></div>}</section>

    <section className="dark section" id="data"><div className="section-head"><div><p className="kicker">{t.dataKicker}</p><h2>{t.dataA}<em>{t.dataB}</em></h2></div><p>{t.dataBody}</p></div><div className="metrics"><div><b>132+</b><span>UNIVERSITIES</span></div><div><b>148+</b><span>PROGRAMS</span></div><div><b>2026</b><span>DATA VERSION</span></div></div><div className="data-grid"><article><small>PUBLIC</small><h3>{t.publicTitle}</h3><ul>{t.publicItems.map(x => <li key={x}>✓ {x}</li>)}</ul></article><article className="member"><small>CLASS MEMBERS</small><h3>{t.memberTitle}</h3><ul>{t.memberItems.map(x => <li key={x}>◇ {x}</li>)}</ul><a href="#contact" className="button">{t.consult} ↗</a></article></div></section>

    <section className="lab section" id="ai"><div className="section-head"><div><p className="kicker">{t.aiKicker}</p><h2>{t.aiTitle}</h2></div><p>{t.aiBody}</p></div><div className="detector-badges"><span>✓ {t.privacy}</span><span>✓ {t.detectorNote}</span></div><div className="tool"><div className="tool-form"><label>{t.statement}<span className="char-count">{statement.length} / 8,000 {t.chars}</span><textarea maxLength={8000} value={statement} onChange={e => { setStatement(e.target.value); setResult(null); setToolError(""); }} placeholder={t.statementPh}/></label><label>{t.reference}<textarea maxLength={8000} className="reference" value={reference} onChange={e => { setReference(e.target.value); setResult(null); setToolError(""); }} placeholder={t.referencePh}/></label><div className="tool-actions"><button onClick={checkAI}>{t.aiBtn}</button><button onClick={checkSimilarity}>{t.simBtn}</button><button className="secondary" onClick={useSample}>{t.sample}</button><button className="clear" onClick={clearTool}>{t.clear}</button></div></div><div className="tool-result" role="status" aria-live="polite">{result ? <div className="analysis"><div className={`score risk-${result.score >= 60 ? "high" : result.score >= 35 ? "medium" : "low"}`}><span>{result.label}</span><strong>{result.score}%</strong><b>{result.level}</b></div><div className="result-facts"><div><span>{t.textStats[0]}</span><strong>{result.language}</strong></div><div><span>{t.textStats[1]}</span><strong>{result.characters}</strong></div><div><span>{t.textStats[2]}</span><strong>{result.sentenceCount} {t.sentencesUnit}</strong></div></div><div className="confidence"><span>{result.confidenceLabel}</span><i role="progressbar" aria-label={result.confidenceLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={result.confidence}><b style={{width: `${result.confidence}%`}}/></i><strong>{result.confidence}%</strong></div><p>{result.reason}</p>{result.metrics.length > 0 && <div className="metric-list">{result.metrics.map(metric => <div className={metric.positive ? "positive" : ""} key={metric.label}><span>{metric.label}</span><i role="progressbar" aria-label={metric.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={metric.value}><b style={{width: `${metric.value}%`}}/></i><em>{metric.value}%</em></div>)}</div>}<div className="finding-grid"><div><h3>{t.signals}</h3>{result.flags.length ? <ul>{result.flags.map(x => <li key={x}>◆ {x}</li>)}</ul> : <p>{t.noSignals}</p>}</div><div><h3>{t.suggestions}</h3>{result.suggestions.length ? <ul>{result.suggestions.map(x => <li key={x}>→ {x}</li>)}</ul> : <p>{t.noSignals}</p>}</div></div><small>{t.disclaimer}</small></div> : toolError ? <div className="tool-error"><b>!</b><h3>{t.inputNeeded}</h3><p>{toolError}</p></div> : <div className="placeholder"><b>AI?</b><p>{t.aiBody}</p><div className="placeholder-lines" aria-hidden="true"><span/><span/><span/></div></div>}</div></div></section>

    <section className="uploads section" id="downloads"><div className="section-head"><div><p className="kicker">{t.uploadKicker}</p><h2>{t.uploadTitle}</h2></div><p>{t.uploadLead}</p></div>{studyUploads.length ? <div className="upload-grid">{studyUploads.map(item => <article key={item.id}><div className="upload-type">{item.fileName.split(".").pop()?.toUpperCase()}</div><small>{item.category} · {(item.sizeBytes / 1024 / 1024).toFixed(1)} MB</small><h3>{item.title}</h3><p>{item.description || item.fileName}</p>{item.downloadUrl ? <a className="button" href={item.downloadUrl}>{t.download} ↓</a> : <a className="button copper" href="#contact">{t.groupOnly} ↗</a>}</article>)}</div> : <div className="upload-empty">{t.noUploads}</div>}</section>

    <section className="paper section services"><div className="section-head"><h2>{t.services}</h2></div><div className="service-grid">{t.serviceCards.map((x, i) => <article key={x[0]}><span>0{i + 1}</span><h3>{x[0]}</h3><p>{x[1]}</p><a href="#contact">{t.consult} →</a></article>)}</div></section>

    <section className="contact section" id="contact"><div><p className="kicker">YOUR STORY STARTS HERE</p><h2>{t.contactTitle}</h2><p>{t.contactBody}</p></div><form onSubmit={submitContact}><label>{t.name}<input name="name" autoComplete="name" maxLength={100} required/></label><label>{t.email}<input name="email" type="email" autoComplete="email" maxLength={254} required/></label><label>{t.message}<textarea name="message" maxLength={3000} required value={contactMessage} onChange={e => { setContactMessage(e.target.value); setContactState("idle"); }}/></label><input className="contact-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/><button className="button" disabled={contactState === "sending"}>{contactState === "sending" ? t.sending : `${t.send} ↗`}</button>{contactState !== "idle" && contactState !== "sending" && <p className={`contact-feedback ${contactState}`} role={contactState === "error" ? "alert" : "status"}>{contactState === "sent" ? t.sent : t.sendError}</p>}</form></section>
    <footer><div className="brand"><img src="/ebi-icon.png" alt="EBI" width="44" height="44"/><span><b>EBI Studying in Japan</b><small>Study resources · University data · Admissions tools</small></span></div><span>© 2026 EBI STUDYING IN JAPAN · <Link href="/admin">{t.admin}</Link></span></footer>
  </main>;
}
