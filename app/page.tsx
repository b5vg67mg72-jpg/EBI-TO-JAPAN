"use client";

import { useMemo, useState } from "react";

type Lang = "ja" | "en" | "zh";

const copy = {
  ja: {
    nav: ["EJU対策", "録画授業", "英語対策", "大学情報", "AIツール"], consult: "無料相談",
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
    aiKicker: "ADMISSIONS LAB", aiTitle: "志望理由書 AI判定・類似度チェック", aiBody: "AI作成の可能性、文章内の繰り返し、参考文章との類似度を確認できます。",
    statement: "チェックする志望理由書", statementPh: "志望理由書を貼り付けてください", reference: "比較する参考文章（任意）", referencePh: "テンプレートや参考文章を貼り付けてください",
    aiBtn: "AI作成可能性を判定", simBtn: "類似度をチェック", empty: "先に志望理由書を入力してください。",
    aiLabel: "AI作成の可能性", simLabel: "文章の類似度", low: "低い", mid: "中程度", high: "高い",
    aiReason: "文章の均一さ、定型表現、具体的な経験の量から推定しました。", simReason: "文章内の長い表現と、貼り付けた参考文章を比較しました。",
    disclaimer: "結果は参考情報です。AI作成や盗用を断定するものではなく、インターネット全体を検索する全庫型判定ではありません。",
    services: "学習と進学を、一つの流れで支える。", serviceCards: [["EJU月額講座", "精聴・精読、学習計画、質問対応"], ["マンツーマン指導", "苦手科目と大学独自試験の準備"], ["大学受験総合プラン", "大学選び、出願書類、志望理由書、面接"]],
    contactTitle: "日本への一歩、ここから。", contactBody: "まだ何も決まっていなくても大丈夫。まずは、あなたの話を聞かせてください。", name: "お名前", email: "メールアドレス", message: "相談したい内容", send: "無料相談を予約する",
  },
  en: {
    nav: ["EJU Resources", "Recorded Classes", "English Prep", "University Data", "AI Tools"], consult: "Free consultation",
    eyebrow: "EBI STUDY RESOURCE LIBRARY", heroA: "Prepare for study in Japan,", heroB: "all in one place.",
    lead: "EJU resources, recorded classes, and English-test preparation in one clear library. Go straight to what you need next.",
    free: "Watch the free EJU lesson", proof: ["Organized by subject", "Mobile friendly", "Continuously updated"],
    areas: "Three clear learning paths.", areaLead: "Move from test resources to recorded lessons and English preparation without losing your place.",
    cards: [["01", "EJU Resources", "Free videos, Japanese, Japan & the World, math, and science", "View subject guides"], ["02", "Recorded Classes", "Repeatable lessons from foundations to practice", "View all classes"], ["03", "English Preparation", "TOEFL, TOEIC, and university requirements", "View English prep"]],
    freeTitle: "Getting started with intensive EJU listening and reading", freeBody: "Try a short free lesson and learn a review method that goes beyond simply answering questions.",
    freeList: ["Core listening and reading steps", "Turn mistakes into points", "A practical review routine"], join: "Join the study group",
    dataKicker: "UNIVERSITY DATA", dataA: "Choose with evidence,", dataB: "not guesswork.", dataBody: "We organize admissions guides, programs, EJU and English requirements, and application dates into an actionable plan.",
    publicTitle: "Public information", publicItems: ["Admissions guides and dates", "Programs and exam subjects", "Published acceptance rates"], memberTitle: "Class-member analysis", memberItems: ["Score-position analysis", "Past-exam trends", "Personal application strategy"],
    aiKicker: "ADMISSIONS LAB", aiTitle: "Statement AI & Similarity Check", aiBody: "Estimate AI-written likelihood, internal repetition, and similarity to a reference text.",
    statement: "Statement to check", statementPh: "Paste your statement here", reference: "Reference text (optional)", referencePh: "Paste a template or reference text", aiBtn: "Check AI likelihood", simBtn: "Check similarity", empty: "Enter a statement first.",
    aiLabel: "AI-written likelihood", simLabel: "Text similarity", low: "Low", mid: "Moderate", high: "High", aiReason: "Estimated from writing consistency, formulaic phrasing, and the amount of specific personal detail.", simReason: "Compared long phrases within the statement and against the reference text you supplied.", disclaimer: "This is a reference signal, not proof of AI use or plagiarism, and it does not search the entire internet.",
    services: "Learning and admissions support in one clear path.", serviceCards: [["Monthly EJU Course", "Listening, reading, planning, and Q&A"], ["One-to-one Tutoring", "Weak subjects and university-specific exams"], ["Complete Admissions Plan", "University choice, documents, statement, and interview"]],
    contactTitle: "Your first step toward Japan starts here.", contactBody: "It is okay if nothing is decided yet. Tell us where you are and what you need.", name: "Name", email: "Email", message: "How can we help?", send: "Book a free consultation",
  },
  zh: {
    nav: ["EJU资料", "录播课程", "英语备考", "大学信息", "AI工具"], consult: "免费咨询",
    eyebrow: "EBI 日本留学学习资料库", heroA: "日本留学备考，", heroB: "从这里开始。", lead: "EJU资料、录播课程与英语考试准备，都集中在一个清晰的网站中。根据目标，快速找到需要的内容。",
    free: "观看免费EJU课程", proof: ["按科目整理", "手机适配", "持续更新"], areas: "三大学习专区。", areaLead: "按照考试资料、录播课程、英语备考的顺序整理，让下一步一目了然。",
    cards: [["01", "EJU资料", "免费视频、日语、文综、数学、理科", "查看科目资料"], ["02", "录播课程", "从基础到练习，可反复观看", "查看全部课程"], ["03", "英语备考", "TOEFL、TOEIC与大学要求", "查看英语备考"]],
    freeTitle: "EJU日语精听精读入门", freeBody: "先体验一节短小的免费课程，学习不止于做题的复习方法。", freeList: ["精听精读基本步骤", "把错误转化为得分", "容易执行的复习流程"], join: "加入学习群",
    dataKicker: "大学数据", dataA: "不凭感觉，", dataB: "用数据选择大学。", dataBody: "整理募集要项、专业、EJU与英语要求和出愿时间，形成可执行的申请计划。",
    publicTitle: "所有人可查看", publicItems: ["募集要项与出愿时间", "专业与考试科目", "公开的合格率与倍率"], memberTitle: "课程学员限定", memberItems: ["大学分数定位分析", "过去问出题趋势", "个人选校与时间策略"],
    aiKicker: "升学工具", aiTitle: "志望理由书 AI判定・查重", aiBody: "检查AI生成可能性、文章内部重复，并与粘贴的参考文章比较相似度。",
    statement: "需要检查的志望理由书", statementPh: "请粘贴志望理由书", reference: "参考文章（选填）", referencePh: "请粘贴模板或参考文章", aiBtn: "检测AI生成可能性", simBtn: "AI查重", empty: "请先输入志望理由书。",
    aiLabel: "AI生成的可能性", simLabel: "文章相似度", low: "较低", mid: "中等", high: "较高", aiReason: "根据行文一致性、模板表达和具体个人经历的数量估算。", simReason: "比较文章内部的长表达，并与您提供的参考文章进行对比。", disclaimer: "结果仅供参考，不能证明AI生成或抄袭，也不会搜索整个互联网。",
    services: "把学习与升学支持连成一条清晰路径。", serviceCards: [["EJU月课", "精听精读、学习规划、答疑"], ["一对一辅导", "薄弱科目与校内考准备"], ["大学升学全程规划", "选校、出愿材料、志望理由书、面试"]],
    contactTitle: "迈向日本的第一步，从这里开始。", contactBody: "即使还没有决定也没关系。先告诉我们你的情况和目标。", name: "姓名", email: "邮箱", message: "希望咨询的内容", send: "预约免费咨询",
  },
} as const;

function normalizeText(value: string) { return value.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, ""); }
function shingles(value: string, size = 9) { const clean = normalizeText(value); return Array.from({ length: Math.max(0, clean.length - size + 1) }, (_, i) => clean.slice(i, i + size)); }

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [statement, setStatement] = useState("");
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<{ label: string; score: number; level: string; reason: string } | null>(null);
  const t = copy[lang];
  const level = (score: number) => score >= 60 ? t.high : score >= 28 ? t.mid : t.low;

  function checkAI() {
    if (!statement.trim()) return setResult({ label: t.aiLabel, score: 0, level: t.low, reason: t.empty });
    const sentences = statement.split(/[。！？!?\.]+/).filter(Boolean);
    const lengths = sentences.map(s => s.trim().length);
    const avg = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length);
    const variation = avg ? Math.sqrt(lengths.reduce((a, b) => a + (b - avg) ** 2, 0) / Math.max(1, lengths.length)) / avg : 0;
    const generic = (statement.match(/昔から|魅力を感じ|将来は|从小就|一直以来|贵校|I have always|make a contribution/gi) || []).length;
    const details = (statement.match(/[0-9０-９]|教授|ゼミ|授業|研究|project|professor|课程|项目|实习/g) || []).length;
    const score = Math.max(5, Math.min(95, Math.round(45 + (variation < .3 ? 22 : -8) + generic * 7 - details * 4)));
    setResult({ label: t.aiLabel, score, level: level(score), reason: t.aiReason });
  }

  function checkSimilarity() {
    if (!statement.trim()) return setResult({ label: t.simLabel, score: 0, level: t.low, reason: t.empty });
    const source = shingles(statement); const unique = new Set(source);
    const repeated = source.length ? 1 - unique.size / source.length : 0;
    let score = Math.round(repeated * 100);
    if (reference.trim()) { const other = new Set(shingles(reference)); const matches = [...unique].filter(x => other.has(x)).length; score = Math.round(matches / Math.max(1, Math.min(unique.size, other.size)) * 100); }
    score = Math.max(0, Math.min(100, score));
    setResult({ label: t.simLabel, score, level: level(score), reason: t.simReason });
  }

  const cards = useMemo(() => t.cards, [t]);

  return <main>
    <header className="topbar"><a className="brand" href="#top"><img src="/ebi-icon.png" alt=""/><span><b>EBI Studying in Japan</b><small>{lang === "zh" ? "日本留学支持" : lang === "en" ? "Japan Study Support" : "日本留学サポート"}</small></span></a><nav>{t.nav.map((x, i) => <a key={x} href={["#resources", "#resources", "#resources", "#data", "#ai"][i]}>{x}</a>)}</nav><div className="actions"><select aria-label="Language" value={lang} onChange={e => setLang(e.target.value as Lang)}><option value="ja">日本語</option><option value="en">English</option><option value="zh">简体中文</option></select><a className="button small" href="#contact">{t.consult}</a></div></header>

    <section className="hero" id="top"><div><p className="kicker">{t.eyebrow}</p><h1>{t.heroA}<em>{t.heroB}</em></h1><p className="lead">{t.lead}</p><a className="button" href="#free">{t.free} ↓</a><div className="proof">{t.proof.map(x => <span key={x}>✓ {x}</span>)}</div></div><div className="hero-stack">{cards.map(card => <a href="#resources" key={card[0]}><span>{card[0]}</span><div><small>EBI RESOURCE</small><h2>{card[1]}</h2><p>{card[2]}</p></div><b>→</b></a>)}</div></section>

    <section className="paper section" id="resources"><div className="section-head"><h2>{t.areas}</h2><p>{t.areaLead}</p></div><article className="free-card" id="free"><div className="free-art"><small>FREE LESSON</small><strong>聴<br/>読</strong><img src="/ebi-icon.png" alt=""/></div><div className="free-copy"><span>FREE EJU RESOURCE</span><h2>{t.freeTitle}</h2><p>{t.freeBody}</p><ul>{t.freeList.map(x => <li key={x}>✓ {x}</li>)}</ul><div><button className="button">{t.free} ▶</button><a href="#contact">{t.join} ↗</a></div></div></article><div className="resource-grid">{cards.map(card => <article key={card[0]}><span>{card[0]}</span><h3>{card[1]}</h3><p>{card[2]}</p><a href="#contact">{card[3]} →</a></article>)}</div></section>

    <section className="dark section" id="data"><div className="section-head"><div><p className="kicker">{t.dataKicker}</p><h2>{t.dataA}<em>{t.dataB}</em></h2></div><p>{t.dataBody}</p></div><div className="metrics"><div><b>132+</b><span>UNIVERSITIES</span></div><div><b>148+</b><span>PROGRAMS</span></div><div><b>2026</b><span>DATA VERSION</span></div></div><div className="data-grid"><article><small>PUBLIC</small><h3>{t.publicTitle}</h3><ul>{t.publicItems.map(x => <li key={x}>✓ {x}</li>)}</ul></article><article className="member"><small>CLASS MEMBERS</small><h3>{t.memberTitle}</h3><ul>{t.memberItems.map(x => <li key={x}>◇ {x}</li>)}</ul><a href="#contact" className="button">{t.consult} ↗</a></article></div></section>

    <section className="lab section" id="ai"><div className="section-head"><div><p className="kicker">{t.aiKicker}</p><h2>{t.aiTitle}</h2></div><p>{t.aiBody}</p></div><div className="tool"><div className="tool-form"><label>{t.statement}<textarea value={statement} onChange={e => setStatement(e.target.value)} placeholder={t.statementPh}/></label><label>{t.reference}<textarea className="reference" value={reference} onChange={e => setReference(e.target.value)} placeholder={t.referencePh}/></label><div className="tool-actions"><button onClick={checkAI}>{t.aiBtn}</button><button onClick={checkSimilarity}>{t.simBtn}</button></div></div><div className="tool-result">{result ? <><div className="score"><span>{result.label}</span><strong>{result.score}%</strong><b>{result.level}</b></div><p>{result.reason}</p><small>{t.disclaimer}</small></> : <div className="placeholder"><b>AI?</b><p>{t.aiBody}</p></div>}</div></div></section>

    <section className="paper section services"><div className="section-head"><h2>{t.services}</h2></div><div className="service-grid">{t.serviceCards.map((x, i) => <article key={x[0]}><span>0{i + 1}</span><h3>{x[0]}</h3><p>{x[1]}</p><a href="#contact">{t.consult} →</a></article>)}</div></section>

    <section className="contact section" id="contact"><div><p className="kicker">YOUR STORY STARTS HERE</p><h2>{t.contactTitle}</h2><p>{t.contactBody}</p></div><form onSubmit={e => e.preventDefault()}><label>{t.name}<input required/></label><label>{t.email}<input type="email" required/></label><label>{t.message}<textarea/></label><button className="button">{t.send} ↗</button></form></section>
    <footer><div className="brand"><img src="/ebi-icon.png" alt=""/><span><b>EBI Studying in Japan</b><small>Study resources · University data · Admissions tools</small></span></div><span>© 2026 EBI STUDYING IN JAPAN</span></footer>
  </main>;
}
