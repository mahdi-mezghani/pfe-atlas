export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>PFE Atlas - Something went wrong</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f5f1ea; color: #24313a; }
      * { box-sizing: border-box; }
      body { display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 24px; background: radial-gradient(circle at 12% 10%, #fffaf2 0 22%, transparent 46%), linear-gradient(135deg, #f5f1ea, #e9f0ee); }
      .shell { width: min(100%, 520px); }
      .brand { display: flex; align-items: center; gap: 10px; margin: 0 0 18px 4px; color: #52645d; font-size: 14px; font-weight: 600; letter-spacing: .02em; }
      .mark { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: #d47d59; color: #fffaf2; font-family: Georgia, serif; font-size: 18px; }
      .panel { padding: 42px 40px; border: 1px solid rgba(82, 100, 93, .18); border-radius: 18px; background: rgba(255, 252, 246, .86); box-shadow: 0 24px 70px rgba(55, 65, 64, .12); }
      .eyebrow { margin: 0 0 12px; color: #d47d59; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      h1 { margin: 0; color: #24313a; font-family: Georgia, serif; font-size: clamp(30px, 7vw, 42px); font-weight: 500; line-height: 1.08; }
      p { max-width: 30rem; margin: 16px 0 28px; color: #66736f; font-size: 15px; line-height: 1.65; }
      .actions { display: flex; gap: 10px; flex-wrap: wrap; }
      a, button { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 0 16px; border-radius: 8px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }
      button { border: 0; background: #d47d59; color: #fff; }
      button:hover { background: #bd6746; }
      a { border: 1px solid rgba(82, 100, 93, .25); color: #52645d; background: transparent; }
      a:hover { background: #eef3ef; }
      @media (max-width: 480px) { .panel { padding: 32px 26px; } .actions > * { width: 100%; } }
    </style>
  </head>
  <body>
    <main class="shell">
      <div class="brand"><span class="mark">P</span><span>PFE Atlas</span></div>
      <section class="panel">
        <p class="eyebrow">Temporary interruption</p>
        <h1>This page didn't load</h1>
        <p>Something went wrong while handling that request. Try again, or return to your library.</p>
      <div class="actions">
        <button onclick="location.reload()">Try again</button>
        <a href="/dashboard">Back to library</a>
      </div>
      </section>
    </main>
  </body>
</html>`;
}
