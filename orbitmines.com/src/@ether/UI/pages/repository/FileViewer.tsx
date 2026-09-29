import React, {useEffect, useMemo, useRef, useState} from 'react';
import classnames from 'classnames';
import type {FileEntry} from '../../data';

const LINE_HEIGHT = 20;
const VIRTUAL_THRESHOLD = 500;
const BUFFER_LINES = 50;

interface FileViewerProps {
  files: FileEntry[];
}

const FileViewer: React.FC<FileViewerProps> = ({files}) => {
  const [active, setActive] = useState(0);

  // Tabs only render when there are multiple files (superposed entries).
  const tabLabels = useMemo(() => {
    const sameName = files.every((f) => f.name === files[0]?.name);
    return files.map((f, i) => (sameName ? `${f.name} (${i + 1})` : f.name));
  }, [files]);

  return (
    <div className="file-view-content">
      {files.length > 1 && (
        <div className="file-view-tabs">
          {tabLabels.map((label, i) => (
            <button
              type="button"
              key={i}
              className={classnames('file-view-tab', {active: i === active})}
              onClick={() => setActive(i)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {files.map((file, i) => (
        <div
          key={i}
          className={classnames('file-view-body', {hidden: i !== active})}
        >
          <FileBody file={file} visible={i === active} />
        </div>
      ))}
    </div>
  );
};

interface FileBodyProps {
  file: FileEntry;
  visible: boolean;
}

const FileBody: React.FC<FileBodyProps> = ({file, visible}) => {
  if (!file.content) {
    return (
      <>
        <div className="file-view-header">
          <span>{file.name}</span>
        </div>
        <div className="file-no-content">No content available</div>
      </>
    );
  }

  // Count lines cheaply
  let lineCount = 1;
  for (let ci = 0; ci < file.content.length; ci++) {
    if (file.content.charCodeAt(ci) === 10) lineCount++;
  }

  return (
    <>
      <div className="file-view-header">
        <span>{file.name}</span>
        <span className="line-count">{lineCount} lines</span>
      </div>
      {lineCount <= VIRTUAL_THRESHOLD ? (
        <SmallFile content={file.content} />
      ) : (
        <VirtualFile content={file.content} lineCount={lineCount} visible={visible} />
      )}
    </>
  );
};

const SmallFile: React.FC<{content: string}> = ({content}) => {
  const lines = useMemo(() => content.split('\n'), [content]);
  return (
    <div className="file-view-scroll-container">
      <div className="file-view-lines">
        {lines.map((line, i) => (
          <Line key={i} num={i + 1} text={line} />
        ))}
      </div>
    </div>
  );
};

interface VirtualFileProps {
  content: string;
  lineCount: number;
  visible: boolean;
}

const VirtualFile: React.FC<VirtualFileProps> = ({content, lineCount, visible}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);

  // Offsets index — built incrementally so very large files don't block
  // first paint. `offsetsRef` is mutated in place to avoid re-renders.
  const offsetsRef = useRef<number[]>([0]);
  const indexCompleteRef = useRef(false);

  useEffect(() => {
    // Reset whenever content changes
    offsetsRef.current = [0];
    indexCompleteRef.current = false;
    let cancelled = false;
    let pos = 0;

    const INITIAL_INDEX = BUFFER_LINES * 2 + 100;
    for (let n = 0; n < INITIAL_INDEX && pos < content.length; n++) {
      const nl = content.indexOf('\n', pos);
      if (nl === -1) {
        pos = content.length;
        break;
      }
      offsetsRef.current.push(nl + 1);
      pos = nl + 1;
    }
    if (pos >= content.length) {
      indexCompleteRef.current = true;
    } else {
      const buildChunk = () => {
        if (cancelled) return;
        const deadline = performance.now() + 8;
        while (pos < content.length && performance.now() < deadline) {
          const nl = content.indexOf('\n', pos);
          if (nl === -1) {
            pos = content.length;
            break;
          }
          offsetsRef.current.push(nl + 1);
          pos = nl + 1;
        }
        if (pos >= content.length) indexCompleteRef.current = true;
        else requestAnimationFrame(buildChunk);
      };
      requestAnimationFrame(buildChunk);
    }
    return () => {
      cancelled = true;
    };
  }, [content]);

  const getLine = (i: number): string => {
    const offsets = offsetsRef.current;
    if (i < 0 || i >= offsets.length) return '';
    const start = offsets[i];
    const end = i + 1 < offsets.length ? offsets[i + 1] - 1 : content.length;
    return content.substring(start, end);
  };

  const [visibleRange, setVisibleRange] = useState<{start: number; end: number}>({
    start: 0,
    end: Math.min(lineCount, BUFFER_LINES * 2),
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let ticking = false;
    let lastScrollParent: HTMLElement | null = null;

    const findScrollParent = (node: HTMLElement): HTMLElement | null => {
      let p = node.parentElement;
      while (p && p !== document.documentElement) {
        const {overflowY} = getComputedStyle(p);
        if (overflowY === 'auto' || overflowY === 'scroll') return p;
        p = p.parentElement;
      }
      return null;
    };

    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const sp = findScrollParent(containerRef.current);
      if (sp !== lastScrollParent) {
        if (lastScrollParent) lastScrollParent.removeEventListener('scroll', schedule);
        if (sp) sp.addEventListener('scroll', schedule, {passive: true});
        lastScrollParent = sp;
      }
      let scrollTop: number;
      let viewHeight: number;
      if (sp) {
        const spRect = sp.getBoundingClientRect();
        scrollTop = Math.max(0, spRect.top - rect.top);
        viewHeight = sp.clientHeight;
      } else {
        scrollTop = Math.max(0, -rect.top);
        viewHeight = window.innerHeight;
      }
      const startLine = Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - BUFFER_LINES);
      const maxLine = indexCompleteRef.current ? lineCount : offsetsRef.current.length;
      const endLine = Math.min(
        maxLine,
        Math.ceil((scrollTop + viewHeight) / LINE_HEIGHT) + BUFFER_LINES,
      );
      setVisibleRange({start: startLine, end: endLine});
    };

    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', schedule, {passive: true});
    const initialSP = findScrollParent(el);
    if (initialSP) {
      initialSP.addEventListener('scroll', schedule, {passive: true});
      lastScrollParent = initialSP;
    }
    update();

    return () => {
      window.removeEventListener('scroll', schedule);
      if (lastScrollParent) lastScrollParent.removeEventListener('scroll', schedule);
    };
  }, [content, lineCount, visible]);

  const visibleLines = [];
  for (let i = visibleRange.start; i < visibleRange.end; i++) {
    visibleLines.push(<Line key={i} num={i + 1} text={getLine(i)} />);
  }

  const totalHeight = lineCount * LINE_HEIGHT;

  return (
    <div ref={containerRef} className="file-view-scroll-container">
      <div className="file-view-virtual-spacer" style={{height: totalHeight}} />
      <div
        ref={linesRef}
        className="file-view-lines virtual"
        style={{top: visibleRange.start * LINE_HEIGHT}}
      >
        {visibleLines}
      </div>
    </div>
  );
};

const Line: React.FC<{num: number; text: string}> = ({num, text}) => (
  <div className="file-line">
    <span className="file-line-number">{num}</span>
    <span className="file-line-text">{text === '' ? ' ' : text}</span>
  </div>
);

export default FileViewer;
