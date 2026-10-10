import {Row} from "../../lib/post/Post";
import {FEATURES} from "../../lib/features";
import {Button, Icon} from "@blueprintjs/core";
import React, {useState} from "react";

type OS = "Windows" | "MacOS" | "Linux"

export const INSTALL = "curl -fsSL https://ether.orbitmines.com/install.sh | bash";
export const WINDOWS_EXECUTABLE = "https://github.com/orbitmines/ray/releases/latest/download/ether-x86_64-pc-windows-msvc.exe";

export const os = (): OS | undefined => {
  if (typeof navigator === 'undefined') return undefined;
  const agent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod|android/.test(agent)) return undefined;
  if (agent.includes("macintosh") && navigator.maxTouchPoints > 1) return undefined;
  if (agent.includes("windows")) return "Windows";
  if (agent.includes("mac")) return "MacOS";
  if (agent.includes("linux") && !agent.includes("cros")) return "Linux";

  return undefined;
}

export const download = () => { window.location.href = WINDOWS_EXECUTABLE; }

const Install = ({detected}: { detected: OS }) => {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(INSTALL).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  });

  return <span onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <Button icon={hovered ? (copied ? "tick" : "duplicate") : "console"} text={<Row middle="xs" style={{minHeight: '50px'}}>
      {hovered
        ? <span style={{fontFamily: 'monospace', whiteSpace: 'nowrap'}}>$ {INSTALL}</span>
        : <>Install<img src="/Ether.svg" alt="Ether's Almanac" style={{maxWidth: '100%', maxHeight: '50px'}}/><span className="hidden-xs">for {detected}</span></>}
    </Row>} minimal style={{fontSize: '18px', borderBottom: '1px solid #5F6B7C99'}} onClick={copy}/>
  </span>
}

export const DownloadButton = () => {
  const detected = os();
  if (!FEATURES.ETHER || !detected) return null;
  if (detected !== "Windows") return <Install detected={detected}/>;

  return <Button icon="download" text={<Row middle="xs">
    Download
    <img src="/Ether.svg" alt="Ether's Almanac" style={{maxWidth: '100%', maxHeight: '50px'}}/>
    <span className="hidden-xs">for {detected}</span>
  </Row>} minimal style={{fontSize: '18px', borderBottom: '1px solid #5F6B7C99'}} onClick={download}/>;
}

export const LoginButton = () => {

  return <Button icon={<Icon icon="link" color="#EAB832" size={20} />} minimal outlined/>
}