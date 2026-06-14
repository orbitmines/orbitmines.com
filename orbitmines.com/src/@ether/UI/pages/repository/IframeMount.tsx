import React, {useEffect, useRef} from 'react';
import {getCurrentPlayer} from './storage';

interface IframeMountProps {
  jsContent: string;
  canonicalPath: string;
}

// Sandboxed iframe used to run a repo's index.ray.js. The host exposes a
// small message bridge (storage / fetch) that the iframe's runtime calls
// over postMessage.
const IframeMount: React.FC<IframeMountProps> = ({jsContent, canonicalPath}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.src = '/sandbox.html';
    iframe.style.cssText =
      'width: 100%; border: none; border-radius: 6px; background: #0a0a0a; min-height: 300px; flex-grow: 1;';

    let iframeReady = false;

    const sendInit = (includeScript: boolean) => {
      if (!iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        {
          type: 'ether:init',
          user: getCurrentPlayer(),
          repo: canonicalPath,
          ...(includeScript ? {script: jsContent} : {}),
        },
        '*',
      );
    };

    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow) return;
      const data = e.data;
      if (!data || !data.type) return;

      if (data.type === 'ether:ready') {
        iframeReady = true;
        sendInit(true);
      } else if (data.type === 'ether:storage') {
        const nsKey = `ray:${canonicalPath}:${data.key}`;
        let value: string | null = null;
        if (data.action === 'get') value = localStorage.getItem(nsKey);
        else if (data.action === 'set') localStorage.setItem(nsKey, data.value);
        else if (data.action === 'remove') localStorage.removeItem(nsKey);
        iframe.contentWindow!.postMessage(
          {type: 'ether:storage:response', id: data.id, value},
          '*',
        );
      } else if (data.type === 'ether:fetch') {
        fetch(data.url, data.options || {})
          .then((resp) =>
            resp.text().then((body) => {
              iframe.contentWindow!.postMessage(
                {
                  type: 'ether:fetch:response',
                  id: data.id,
                  ok: resp.ok,
                  status: resp.status,
                  statusText: resp.statusText,
                  body,
                },
                '*',
              );
            }),
          )
          .catch((err) => {
            iframe.contentWindow!.postMessage(
              {
                type: 'ether:fetch:response',
                id: data.id,
                error: err.message || String(err),
              },
              '*',
            );
          });
      }
    };

    const onCharacter = () => {
      if (iframeReady) sendInit(false);
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('ether:character', onCharacter);
    container.appendChild(iframe);

    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('ether:character', onCharacter);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };
  }, [jsContent, canonicalPath]);

  return <div ref={containerRef} style={{display: 'flex', flexGrow: 1}} />;
};

export default IframeMount;
