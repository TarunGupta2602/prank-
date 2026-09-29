export const PHONE = "+1-877-592-0389";
export const PHONE_TEL = "+18775920389";

/** Screen pe jo dikhta hai — wahi voice padhegi */
export const VOICE_LINES = [
  "Microsoft Windows Security Center.",
  "Virus slash Malware infections have been recognized on your device.",
  "Microsoft Windows is infected with Trojan S Locker.",
  "Spyware alert. Your firewall has been disabled. Remote access was detected.",
  "Your personal data, banking information and web login credentials saved on this PC are at risk due to a major security breach.",
  "Please read the information on your screen carefully.",
  "Do not close this window. Do not restart your PC.",
  `Call Microsoft Windows Support: ${PHONE}. Helpline.`,
  `Call Microsoft Windows Support ${PHONE}. Head Office.`,
  "A critical error has occurred due to the outdated version of the browser. Contact Microsoft Windows Support for immediate assistance.",
];

export const ALERT_MSG =
  "⚠ VIRUS DETECTED!\n\nMicrosoft Windows Security found Trojan:SLocker.\n\nREAD the information on screen.\n\nCall Microsoft Support:\n" +
  PHONE +
  "\n\nDo NOT close this window!";

export const ALERT_MSG_2 =
  "⚠ WARNING!\n\nLeaving this page may permanently delete your files.\n\nCall Microsoft NOW:\n" +
  PHONE;

export const BLUE_THREATS = [
  { name: "Trojan:SLocker", status: "ACTIVE", risk: "Critical" },
  { name: "Spyware:Win32/KeyLogger", status: "RUNNING", risk: "High" },
  { name: "Backdoor:RemoteAccess", status: "CONNECTED", risk: "Critical" },
  { name: "Adware:BrowserHijack", status: "INJECTED", risk: "Medium" },
];

export const BLUE_DETAILS = [
  "Firewall status: DISABLED by unauthorized process",
  "Windows Defender: Tampered / Offline",
  "Suspicious outbound connection to unknown host",
  "Browser credentials vault: ACCESS ATTEMPTED",
  "Camera & microphone: PERMISSION OVERRIDE DETECTED",
];
