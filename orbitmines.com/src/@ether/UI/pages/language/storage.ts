import {getAPI} from '../../data';
import {defaultProgram} from './modules';
import type {LangConfig} from './types';

// localStorage is the persistence backend until there's a real server. The
// ray prototype POSTed to `/**/@ether/.<lang>/.<lang>.json`; that endpoint
// doesn't exist in this environment yet.

function key(lang: string): string {
  return `ether:lang:${lang}`;
}

export async function loadConfig(lang: string): Promise<LangConfig> {
  try {
    const raw = localStorage.getItem(key(lang));
    if (raw) {
      const parsed = JSON.parse(raw) as LangConfig;
      if (Array.isArray(parsed.program) && parsed.program.length > 0) {
        return parsed;
      }
    }
  } catch {
    /* fall through */
  }

  // Try the dummy backend as a courtesy — it may return a stored file in
  // the future. For now it always returns null.
  try {
    const raw = await getAPI().readFile(`@ether/.${lang}/.${lang}.json`);
    if (raw) {
      const parsed = JSON.parse(raw) as LangConfig;
      if (Array.isArray(parsed.program) && parsed.program.length > 0) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }

  return {extension: lang, program: defaultProgram(lang)};
}

export function saveConfig(lang: string, config: LangConfig): void {
  try {
    localStorage.setItem(key(lang), JSON.stringify(config));
  } catch {
    /* ignore */
  }
}
