"use client";
/* eslint-disable @next/next/no-img-element -- vinext's next/image shim causes client hook errors. */

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password") }) });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "登录失败，请稍后重试");
      window.location.href = "/admin";
    } catch (error) {
      setError(error instanceof Error ? error.message : "登录失败，请稍后重试");
      setBusy(false);
    }
  }
  return <main className="admin-login"><section><Link className="brand" href="/"><img src="/ebi-icon.png" alt="EBI" width="44" height="44"/><span><b>EBI Resource Admin</b><small>资料管理后台</small></span></Link><p className="kicker">ADMINISTRATOR ACCESS</p><h1>管理员登录</h1><p>请输入管理员密码，登录后即可上传和管理网站资料。</p><form onSubmit={submit}><label>管理员密码<input name="password" type="password" autoComplete="current-password" required/></label><button disabled={busy}>{busy ? "正在验证……" : "登录后台"}</button>{error && <div className="login-error" role="alert">{error}</div>}</form><Link className="back-site" href="/">← 返回公开网站</Link></section></main>;
}
