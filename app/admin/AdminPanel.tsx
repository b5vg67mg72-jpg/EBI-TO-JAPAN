"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Resource = {
  id: string; title: string; description: string; category: string; language: string;
  access_level: "public" | "group"; status: "draft" | "published"; file_name: string;
  content_type: string; size_bytes: number; created_at: number;
};

const formatBytes = (value: number) => value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(value / 1024)} KB`;

export default function AdminPanel({ adminName, signOutUrl }: { adminName: string; signOutUrl: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadResources = useCallback(async () => {
    const response = await fetch("/api/admin/resources", { cache: "no-store" });
    if (!response.ok) throw new Error("无法读取资料列表");
    const data = await response.json() as { resources: Resource[] };
    setResources(data.resources); setLoading(false);
  }, []);

  useEffect(() => { loadResources().catch(error => { setMessage(error.message); setLoading(false); }); }, [loadResources]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("正在上传，请不要关闭页面……");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/admin/resources", { method: "POST", body: new FormData(form) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "上传失败");
      form.reset(); setMessage("上传成功。资料已经保存到网站后台。"); await loadResources();
    } catch (error) { setMessage(error instanceof Error ? error.message : "上传失败"); }
    finally { setBusy(false); }
  }

  async function update(resource: Resource, changes: Partial<Pick<Resource, "status" | "access_level">>) {
    setBusy(true); setMessage("正在更新……");
    const response = await fetch("/api/admin/resources", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: resource.id, status: changes.status ?? resource.status, accessLevel: changes.access_level ?? resource.access_level }) });
    if (response.ok) { setMessage("已更新。"); await loadResources(); } else setMessage("更新失败。");
    setBusy(false);
  }

  async function remove(resource: Resource) {
    if (!confirm(`确定删除「${resource.title}」吗？文件也会永久删除。`)) return;
    setBusy(true); setMessage("正在删除……");
    const response = await fetch("/api/admin/resources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: resource.id }) });
    if (response.ok) { setMessage("已删除。"); await loadResources(); } else setMessage("删除失败。");
    setBusy(false);
  }

  return <main className="admin-shell">
    <header className="admin-header"><a className="brand" href="/"><img src="/ebi-icon.png" alt=""/><span><b>EBI Resource Admin</b><small>资料管理后台</small></span></a><div><span>{adminName}</span><a href="/">查看网站</a><a href={signOutUrl}>退出登录</a></div></header>
    <section className="admin-hero"><p>EBI ADMIN MODE</p><h1>网站上线后，也可以随时上传资料。</h1><p>PDF、Word、Excel 和视频会永久保存。设置为“已发布”后，访客无需重新部署网站即可看到。</p></section>
    <section className="admin-grid">
      <form className="upload-card" onSubmit={upload}>
        <div className="admin-title"><span>01</span><div><h2>上传新资料</h2><p>单个文件最大 100 MB</p></div></div>
        <label>资料标题<input name="title" required placeholder="例如：2026 EJU 日语听力讲义"/></label>
        <label>简介<textarea name="description" placeholder="简单说明资料内容"/></label>
        <div className="admin-fields"><label>分类<select name="category"><option>EJU</option><option>录播课程</option><option>英语备考</option><option>大学信息</option><option>申请材料</option></select></label><label>语言<select name="language"><option value="ja">日语</option><option value="zh">中文</option><option value="en">英语</option></select></label></div>
        <div className="admin-fields"><label>访问方式<select name="accessLevel"><option value="public">公开下载</option><option value="group">加入学习群后获取</option></select></label><label>状态<select name="status"><option value="draft">草稿</option><option value="published">立即发布</option></select></label></div>
        <label className="file-drop">选择文件<input name="file" type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx,.mp4,.mov,.m4v"/><span>支持 PDF · DOCX · XLSX · MP4</span></label>
        <button disabled={busy}>{busy ? "处理中……" : "上传并保存"}</button>{message && <p className="admin-message" role="status">{message}</p>}
      </form>
      <div className="library-card"><div className="admin-title"><span>02</span><div><h2>资料库</h2><p>{resources.length} 个文件</p></div></div>{loading ? <p>正在读取……</p> : resources.length === 0 ? <div className="empty-library">还没有上传资料。</div> : <div className="admin-list">{resources.map(resource => <article key={resource.id}><div className="file-badge">{resource.file_name.split(".").pop()?.toUpperCase()}</div><div className="file-info"><small>{resource.category} · {formatBytes(resource.size_bytes)}</small><h3>{resource.title}</h3><p>{resource.file_name}</p><div><span className={resource.status}>{resource.status === "published" ? "已发布" : "草稿"}</span><span>{resource.access_level === "public" ? "公开下载" : "学习群限定"}</span></div></div><div className="file-actions"><button disabled={busy} onClick={() => update(resource, { status: resource.status === "published" ? "draft" : "published" })}>{resource.status === "published" ? "撤下" : "发布"}</button><button disabled={busy} onClick={() => update(resource, { access_level: resource.access_level === "public" ? "group" : "public" })}>切换权限</button><button className="danger" disabled={busy} onClick={() => remove(resource)}>删除</button></div></article>)}</div>}</div>
    </section>
  </main>;
}
