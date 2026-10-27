import { createHash } from "node:crypto";

const styles = `*{box-sizing:border-box}body{margin:0;background:#FAF9F6;color:#181A1B;font:1rem/1.6 system-ui,sans-serif}main{width:100%;max-width:38rem;margin:8vh auto;padding:1.5rem;overflow-wrap:anywhere}.brand{display:flex;align-items:center;gap:.75rem;color:#183B3F;font-size:1.25rem;font-weight:650;letter-spacing:-.03em}.brand img{width:44px;height:44px}h1{font:400 clamp(2rem,7vw,3rem)/1.15 Georgia,"Times New Roman",serif;letter-spacing:-.03em;margin:2rem 0 1rem}p{margin:1rem 0}button,select{font:inherit;max-width:100%;min-height:48px}button{display:block;background:#183B3F;color:#fff;border:0;border-radius:.4rem;padding:.75rem 1.25rem;cursor:pointer;margin:1rem 0}button:hover{background:#102A2D}a{color:#246066;text-underline-offset:.2em}label{display:block;font-weight:600;margin-top:1.5rem}select{display:block;width:100%;background:#fff;color:#181A1B;border:1px solid #63666A;border-radius:.4rem;padding:.6rem}small{display:block;color:#63666A}a:focus-visible,button:focus-visible,select:focus-visible{outline:3px solid #246066;outline-offset:4px}footer{margin-top:2.5rem;border-top:1px solid #E5E2DB;padding-top:1rem}`;

const pollStyles = `.answer-label{color:#63666A;font-size:.85rem;margin-bottom:.5rem}.selected-answer{background:#fff;border:1px solid #D2DFDA;border-radius:.75rem;padding:1.25rem;font-size:1.15rem;font-weight:600;color:#183B3F;margin:.5rem 0 1.5rem}.poll-form button{width:100%;min-height:56px;border-radius:.6rem;font-weight:600}.poll-form+p{margin-bottom:1.75rem}`;

export function preferencePage(heading: string, content: string, status = 200): Response {
  const pageStyles = styles + pollStyles;
  const hash = createHash("sha256").update(pageStyles).digest("base64");
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Email preferences | PharmaGuide</title><style>${pageStyles}</style></head><body><main><div class="brand"><img src="/brand/logo-pulse.png" alt="" width="44" height="44">PharmaGuide</div><h1>${heading}</h1>${content}<footer><small>Need help? Contact info@pharmaguide.io.</small></footer></main></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow",
        "Content-Security-Policy": `default-src 'none'; img-src 'self'; style-src 'sha256-${hash}'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'`,
      },
    }
  );
}
