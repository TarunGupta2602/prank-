# Microsoft Security Alert Prank

Next.js + TypeScript prank page that looks like a Windows Security lock screen.

## Local run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Escape / unlock (for you & friends)

Kisi bhi **Microsoft 4-color logo** pe **8 baar click** — prank unlock.

## Stuck behavior

- Pehli click → voice warning (screen padhne ko bolti hai) + fullscreen + alert
- Har click / Deny / close / back / F5 → phir alert + naya popup
- Page **sabke liye** open hai (IP lock nahi)


## Vercel deploy (no custom domain)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Click **Deploy** (defaults are fine)
4. Share the free URL like `https://your-project.vercel.app` with friends

Or CLI:

```bash
npx vercel
```

## Notes

- Ye sirf visual prank hai — passwords / cards collect nahi hote
- Sirf doston ke saath use karo; strangers pe mat chalao
- Beep sound + fullscreen + back/refresh block se “stuck” feel aata hai
