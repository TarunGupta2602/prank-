/** Target audience = Windows Chrome. Safari pe testing limited hoti hai. */

export function getBrowserInfo() {
  if (typeof navigator === "undefined") {
    return { isChrome: false, isSafari: false, isWindows: false, label: "unknown" };
  }
  const ua = navigator.userAgent;
  const isWindows = /Windows/i.test(ua);
  const isChrome = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
  const isEdge = /Edg\//.test(ua);
  const isSafari =
    /Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Chromium\//.test(ua);
  const label = isChrome
    ? "chrome"
    : isEdge
      ? "edge"
      : isSafari
        ? "safari"
        : "other";
  return { isChrome: isChrome || isEdge, isSafari, isWindows, label };
}

/** Windows Chrome pe Microsoft voices best lagti hain */
export function pickEnglishVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const score = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    if (/zira|david|mark|eva|susan|hazel/.test(n)) return 100;
    if (/microsoft/.test(n)) return 90;
    if (/google us english|google uk/.test(n)) return 80;
    if (/samantha|karen|moira/.test(n)) return 40; // mac — ok but not target
    if (v.localService) return 60;
    return 10;
  };
  return [...en].sort((a, b) => score(b) - score(a))[0] || en[0];
}

export function waitForVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const ready = window.speechSynthesis.getVoices();
    if (ready.length) {
      resolve(ready);
      return;
    }
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    window.setTimeout(done, timeoutMs);
  });
}
