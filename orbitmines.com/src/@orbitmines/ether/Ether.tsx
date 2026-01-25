import {Row} from "../../lib/post/Post";
import {Button, Icon} from "@blueprintjs/core";
import React from "react";

type OS = "Windows" | "MacOS" | "Linux";

export const os = (): OS | undefined => {
  const platform = navigator.userAgent.toLowerCase();

  if (platform.includes("win")) return "Windows";
  if (platform.includes("mac")) return "MacOS";
  if (platform.includes("linux")) return "Linux";

  return undefined;
}

export const download = () => {

}

export const DownloadButton = () => os() ? <Button icon="download" text={<Row middle="xs">
  Download
  <img src="/Ether.svg" alt="Ether's Almanac" style={{maxWidth: '100%', maxHeight: '50px'}}/>
  <span className="hidden-xs">for {os()}</span>
</Row>} minimal style={{fontSize: '18px', borderBottom: '1px solid #5F6B7C99'}} onClick={download}/> : null

export const LoginButton = () => {

  return <Button icon={<Icon icon="link" color="#EAB832" size={20} />} minimal outlined/>
}