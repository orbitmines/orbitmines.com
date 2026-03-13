import {Row} from "../../lib/post/Post";
import {Button, Icon} from "@blueprintjs/core";
import React from "react";

type OS = "Windows" | "MacOS" | "Linux"// | "iOS" | "Android"

const OS_ASSET_MATCH: Record<OS, RegExp> = {
  "Windows": /\.exe$/,
  "MacOS": /\.dmg$/,
  "Linux": /\.deb$/,
  // "Android": /\.apk$/,
  // "iOS": /\.ipa$/,
};

export const os = (): OS | undefined => {
  const platform = navigator.userAgent.toLowerCase();

  // if (platform.includes("iphone") || platform.includes("ipad") || platform.includes("ipod")) return "iOS";
  // if (platform.includes("android")) return "Android";
  if (platform.includes("win")) return "Windows";
  if (platform.includes("mac")) return "MacOS";
  if (platform.includes("linux")) return "Linux";

  return undefined;
}

export const download = async () => {
  const detected = os();
  if (!detected) return;

  const response = await fetch("https://api.github.com/repos/orbitmines/ray/releases/latest");
  const release = await response.json();
  const asset = release.assets?.find((a: any) => OS_ASSET_MATCH[detected].test(a.name));

  if (asset) {
    window.open(asset.browser_download_url, "_blank");
  } else {
    window.open("https://github.com/orbitmines/ray/releases/latest", "_blank");
  }
}

export const DownloadButton = () => os() ? <Button icon="download" text={<Row middle="xs">
  Download
  <img src="/Ether.svg" alt="Ether's Almanac" style={{maxWidth: '100%', maxHeight: '50px'}}/>
  <span className="hidden-xs">for {os()}</span>
</Row>} minimal style={{fontSize: '18px', borderBottom: '1px solid #5F6B7C99'}} onClick={download}/> : null

export const LoginButton = () => {

  return <Button icon={<Icon icon="link" color="#EAB832" size={20} />} minimal outlined/>
}