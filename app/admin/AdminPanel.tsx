"use client";
/* eslint-disable @next/next/no-img-element -- vinext's next/image shim causes client hook errors. */

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Resource = {
  id: string; title: string; description: string; category: string; language: string;
  access_level: "public" | "group" | "paid"; status: "draft" | "published"; file_name: string;
  resource_kind: "study" | "exam"; school_name: string; faculty: string; exam_year: string;
  subject: string; price_yen: number; purchase_url: string; preview_name: string | null;
  content_type: string; size_bytes: number; created_at: number;
};
type Contact = { id: string; name: string; email: string; message: string; created_at: number };

const formatBytes = (value: number) => value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(value / 1024)} KB`;

export default function AdminPanel() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resourceKind, setResourceKind] = useState<"study" | "exam">("study");

  const loadResources = useCallback(async () => {
    const [resourceResponse, contactResponse] = await Promise.all([
      fetch("/api/admin/resources", { cache: "no-store" }),
      fetch("/api/admin/contacts", { cache: "no-store" }),
    ]);
    if (!resourceResponse.ok || !contactResponse.ok) throw new Error("无法读取后台数据");
    const [resourceData, contactData] = await Promise.all([
      resourceResponse.json() as Promise<{ resources: Resource[] }>,
      contactResponse.json() as Promise<{ contacts: Contact[] }>,
    ]);
    setResources(resourceData.resources); setContacts(contactData.contacts); setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadResources().catch(error => { setMessage(error.message); setLoading(false); });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadResources]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("正在上传，请不要关闭页面……");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/admin/resources", { method: "POST", body: new FormData(form) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "上传失败");
      form.reset(); setResourceKind("study"); setMessage("上传成功。资料已经保存到网站后台。"); await loadResources();
    } catch (error) { setMessage(error instanceof Error ? error.message : "上传失败"); }
    finally { setBusy(false); }
  }

  async function update(resource: Resource, changes: Partial<Pick<Resource, "status" | "access_level">>) {
    setBusy(true); setMessage("正在更新……");
    try {
      const response = await fetch("/api/admin/resources", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: resource.id, status: changes.status ?? resource.status, accessLevel: changes.access_level ?? resource.access_level }) });
      if (!response.ok) throw new Error("更新失败。");
      setMessage("已更新。"); await loadResources();
    } catch (error) { setMessage(error instanceof Error ? error.message : "更新失败。"); }
    finally { setBusy(false); }
  }

  async function remove(resource: Resource) {
    if (!confirm(`确定删除「${resource.title}」吗？文件也会永久删除。`)) return;
    setBusy(true); setMessage("正在删除……");
    try {
      const response = await fetch("/api/admin/resources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: resource.id }) });
      if (!response.ok) throw new Error("删除失败。");
      setMessage("已删除。"); await loadResources();
    } catch (error) { setMessage(error instanceof Error ? error.message : "删除失败。"); }
    finally { setBusy(false); }
  }

  async function logout() {
    try { await fetch("/api/admin/logout", { method: "POST" }); }
    finally { window.location.href = "/"; }
  }

  return <main className="admin-shell">
    <header className="admin-header"><Link className="brand" href="/"><img src="/ebi-icon.png" alt="EBI" width="44" height="44"/><span><b>EBI Resource Admin</b><small>资料管理后台</small></span></Link><div><span>管理员模式</span><Link href="/">查看网站</Link><button className="link-button" onClick={logout}>退出登录</button></div></header>
    <section className="admin-hero"><p>EBI ADMIN MODE</p><h1>学习资料与校内考真题，一站管理。</h1><p>上传普通学习资料，或创建带价格、试看文件和付款链接的校内考真题商品。设置为“已发布”后会立即显示在网站。</p></section>
    <section className="admin-grid">
      <form className="upload-card" onSubmit={upload}>
        <div className="admin-title"><span>01</span><div><h2>上传资料 / 真题商品</h2><p>原文件最大 100 MB</p></div></div>
        <label>内容类型<select name="resourceKind" value={resourceKind} onChange={event => setResourceKind(event.target.value as "study" | "exam")}><option value="study">普通学习资料</option><option value="exam">校内考往年真题（付费）</option></select></label>
        <label>资料标题<input name="title" required placeholder="例如：2026 EJU 日语听力讲义"/></label>
        <label>简介<textarea name="description" placeholder="简单说明资料内容"/></label>
        {resourceKind === "exam" && <div className="exam-fields"><p>商品信息</p><div className="admin-fields"><label>大学名称<input name="schoolName" required placeholder="例如：早稻田大学"/></label><label>学部 / 研究科<input name="faculty" placeholder="例如：商学部"/></label></div><div className="admin-fields"><label>考试年度<input name="examYear" required placeholder="例如：2025"/></label><label>科目<input name="subject" required placeholder="例如：小论文・数学"/></label></div><div className="admin-fields"><label>售价（日元）<input name="priceYen" type="number" min="1" step="1" required placeholder="2980"/></label><label>付款链接（选填）<input name="purchaseUrl" type="url" placeholder="https://..."/></label></div><label className="file-drop">试看文件（选填）<input name="previewFile" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"/><span>支持 PDF / 图片，最大 15 MB；请勿包含完整答案。</span></label></div>}
        <div className="admin-fields"><label>分类<select name="category"><option>{resourceKind === "exam" ? "校内考真题" : "EJU"}</option><option>录播课程</option><option>英语备考</option><option>大学信息</option><option>申请材料</option></select></label><label>语言<select name="language"><option value="ja">日语</option><option value="zh">中文</option><option value="en">英语</option></select></label></div>
        <div className="admin-fields">{resourceKind === "study" && <label>访问方式<select name="accessLevel"><option value="public">公开下载</option><option value="group">加入学习群后获取</option></select></label>}<label>状态<select name="status"><option value="draft">草稿</option><option value="published">立即发布</option></select></label></div>
        <label className="file-drop">{resourceKind === "exam" ? "上传完整真题文件（仅后台保存）" : "选择资料文件"}<input name="file" type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx,.mp4,.mov,.m4v"/><span>支持 PDF · DOCX · XLSX · MP4</span></label>
        <button disabled={busy}>{busy ? "处理中……" : "上传并保存"}</button>{message && <p className="admin-message" role="status">{message}</p>}
      </form>
      <div className="library-card"><div className="admin-title"><span>02</span><div><h2>资料与商品库</h2><p>{resources.length} 个文件</p></div></div>{loading ? <p>正在读取……</p> : resources.length === 0 ? <div className="empty-library">还没有上传资料。</div> : <div className="admin-list">{resources.map(resource => <article key={resource.id}><div className={`file-badge ${resource.resource_kind === "exam" ? "paid" : ""}`}>{resource.resource_kind === "exam" ? "真题" : resource.file_name.split(".").pop()?.toUpperCase()}</div><div className="file-info"><small>{resource.resource_kind === "exam" ? `${resource.school_name} · ${resource.exam_year} · ¥${resource.price_yen.toLocaleString()}` : `${resource.category} · ${formatBytes(resource.size_bytes)}`}</small><h3>{resource.title}</h3><p>{resource.resource_kind === "exam" ? `${resource.faculty || "学部未填写"} · ${resource.subject}${resource.preview_name ? " · 有试看" : ""}` : resource.file_name}</p><div><span className={resource.status}>{resource.status === "published" ? "已发布" : "草稿"}</span><span>{resource.resource_kind === "exam" ? "付费商品" : resource.access_level === "public" ? "公开下载" : "学习群限定"}</span></div></div><div className="file-actions"><button disabled={busy} onClick={() => update(resource, { status: resource.status === "published" ? "draft" : "published" })}>{resource.status === "published" ? "撤下" : "发布"}</button>{resource.resource_kind !== "exam" && <button disabled={busy} onClick={() => update(resource, { access_level: resource.access_level === "public" ? "group" : "public" })}>切换权限</button>}<button className="danger" disabled={busy} onClick={() => remove(resource)}>删除</button></div></article>)}</div>}</div>
      <div className="contact-card"><div className="admin-title"><span>03</span><div><h2>最新咨询</h2><p>{contacts.length} 条记录</p></div></div>{loading ? <p>正在读取……</p> : contacts.length === 0 ? <div className="empty-library">还没有收到咨询。</div> : <div className="contact-list">{contacts.map(contact => <article key={contact.id}><div><h3>{contact.name}</h3><a href={`mailto:${contact.email}`}>{contact.email}</a><time dateTime={new Date(contact.created_at).toISOString()}>{new Date(contact.created_at).toLocaleString("zh-CN")}</time></div><p>{contact.message}</p></article>)}</div>}</div>
    </section>
  </main>;
}
