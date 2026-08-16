"use client";

import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password") }) });
    if (response.ok) window.location.href = "/admin";
    else { const data = await response.json() as { error?: string }; setError(data.error || "登录失败"); setBusy(false); }
  }
  return <main className="admin-login"><section><a className="brand" href="/"><img src="/ebi-icon.png" alt=""/><span><b>EBI Resource Admin</b><small>资料管理后台</small></span></a><p className="kicker">ADMINISTRATOR ACCESS</p><h1>管理员登录</h1><p>请输入管理员密码，登录后即可上传和管理网站资料。</p><form onSubmit={submit}><label>管理员密码<input name="password" type="password" autoComplete="current-password" required autoFocus/></label><button disabled={busy}>{busy ? "正在验证……" : "登录后台"}</button>{error && <div className="login-error" role="alert">{error}</div>}</form><a className="back-site" href="/">← 返回公开网站</a></section></main>;
}
