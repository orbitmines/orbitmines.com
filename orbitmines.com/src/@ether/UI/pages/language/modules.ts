import type {ModuleType, ModuleInstance} from './types';

export const MODULE_TYPES: ModuleType[] = [
  {
    id: 'reading', name: 'Reading', description: 'How source is loaded and read',
    fields: [{key: 'direction', label: 'Direction', type: 'select', options: [['ltr', 'Left-to-right'], ['rtl', 'Right-to-left']]}],
    display: 'Reading({direction})',
    acceptsModifiers: ['load-file', 'load-directory', 'read-rtl', 'read-ltr', 'bidirectional', 'per-construct-override'],
    mustFollow: [], repeatable: false,
  },
  {
    id: 'structure', name: 'Structure', description: 'How whitespace, indentation, and lines are meaningful',
    fields: [
      {key: 'indentation', label: 'Indentation', type: 'toggle'},
      {key: 'lines', label: 'Lines', type: 'toggle'},
      {key: 'separator', label: 'Separator', type: 'text', placeholder: 'newline'},
    ],
    display: 'Structure({separator})',
    acceptsModifiers: [], mustFollow: ['reading'], repeatable: false,
  },
  {
    id: 'delimiters', name: 'Delimiters', description: 'Matched pairs that group things',
    fields: [{key: 'pairs', label: 'Pairs', type: 'text', placeholder: '() [] {}'}],
    display: 'Delimiters({pairs})',
    acceptsModifiers: ['nesting'], mustFollow: ['structure'], repeatable: false,
  },
  {
    id: 'comments', name: 'Comments', description: 'What the parser ignores',
    fields: [
      {key: 'line', label: 'Line', type: 'text', placeholder: '//'},
      {key: 'blockOpen', label: 'Block open', type: 'text', placeholder: '/*'},
      {key: 'blockClose', label: 'Block close', type: 'text', placeholder: '*/'},
    ],
    display: 'Comments({line})',
    acceptsModifiers: [], mustFollow: [], repeatable: false,
  },
  {
    id: 'tokenization', name: 'Tokenization', description: 'How characters become tokens',
    fields: [
      {key: 'identifierChars', label: 'Identifier chars', type: 'text', placeholder: '\\S'},
      {key: 'tokenBreakers', label: 'Breakers', type: 'text', placeholder: 'space, newline'},
    ],
    display: 'Tokenization({identifierChars})',
    acceptsModifiers: ['compound-splitting'], mustFollow: ['structure'], repeatable: false,
  },
  {
    id: 'binding', name: 'Binding', description: 'How names get assigned to things',
    fields: [{key: 'syntax', label: 'Syntax', type: 'text', placeholder: '='}],
    display: 'Binding({syntax})',
    acceptsModifiers: ['aliasing', 'forward-references'], mustFollow: ['tokenization'], repeatable: false,
  },
  {
    id: 'scoping', name: 'Scoping', description: 'How name lookup works',
    fields: [
      {key: 'model', label: 'Model', type: 'select', options: [['lexical', 'Lexical'], ['dynamic', 'Dynamic'], ['hybrid', 'Hybrid']]},
      {key: 'self', label: 'Self', type: 'text', placeholder: 'this'},
      {key: 'unresolved', label: 'Unresolved', type: 'select', options: [['error', 'Error'], ['forward', 'Forward ref'], ['auto', 'Auto-create']]},
    ],
    display: 'Scoping({model}, self: {self})',
    acceptsModifiers: [], mustFollow: ['binding'], repeatable: false,
  },
  {
    id: 'evaluation', name: 'Evaluation', description: 'When things get computed',
    fields: [
      {key: 'strategy', label: 'Strategy', type: 'select', options: [['lazy', 'Lazy'], ['eager', 'Eager'], ['mixed', 'Mixed']]},
      {key: 'passes', label: 'Passes', type: 'text', placeholder: 'fixpoint'},
    ],
    display: 'Evaluation({strategy}, {passes})',
    acceptsModifiers: ['fixpoint'], mustFollow: ['scoping'], repeatable: false,
  },
  {
    id: 'associativity', name: 'Associativity', description: 'How chained operations group',
    fields: [
      {key: 'default', label: 'Default', type: 'select', options: [['left', 'Left'], ['right', 'Right'], ['none', 'None']]},
      {key: 'precedence', label: 'Precedence', type: 'select', options: [['numeric', 'Numeric'], ['positional', 'Positional'], ['none', 'None']]},
    ],
    display: 'Associativity({default})',
    acceptsModifiers: ['per-construct-override'], mustFollow: ['evaluation'], repeatable: false,
  },
  {
    id: 'patterns', name: 'Patterns', description: 'How syntax rules are expressed',
    fields: [
      {key: 'bindingSlots', label: 'Binding slots', type: 'text', placeholder: '{name: type}'},
      {key: 'alternation', label: 'Alternation', type: 'text', placeholder: '|'},
      {key: 'body', label: 'Body syntax', type: 'text', placeholder: '=>'},
    ],
    display: 'Patterns({alternation}, {body})',
    acceptsModifiers: [], mustFollow: ['tokenization'], repeatable: false,
  },
  {
    id: 'dispatch', name: 'Dispatch', description: 'How calls work',
    fields: [
      {key: 'call', label: 'Call syntax', type: 'text', placeholder: 'juxtaposition'},
      {key: 'notCallable', label: 'Not callable', type: 'text', placeholder: 'error'},
    ],
    display: 'Dispatch({call})',
    acceptsModifiers: ['fallback-chain'], mustFollow: ['binding'], repeatable: false,
  },
  {
    id: 'diagnostics', name: 'Diagnostics', description: 'Error reporting',
    fields: [
      {key: 'recovery', label: 'Recovery', type: 'select', options: [['stop', 'Stop'], ['collect', 'Collect all'], ['recover', 'Recover']]},
      {key: 'locationTracking', label: 'Track locations', type: 'toggle'},
    ],
    display: 'Diagnostics({recovery})',
    acceptsModifiers: [], mustFollow: [], repeatable: false,
  },
  {
    id: 'execution', name: 'Execution', description: 'REPL, debugger, AST browser',
    fields: [
      {key: 'repl', label: 'REPL', type: 'toggle'},
      {key: 'stepThrough', label: 'Step-through', type: 'toggle'},
      {key: 'astBrowser', label: 'AST browser', type: 'toggle'},
    ],
    display: 'Execution',
    acceptsModifiers: [], mustFollow: [], repeatable: false,
  },

  // Modifiers ---------------------------------------------------
  {id: 'load-file', name: 'Load File', description: 'Load a specific source file',
    fields: [{key: 'path', label: 'Path', type: 'text', placeholder: 'Node.ray'}],
    display: 'Load File({path})',
    acceptsModifiers: ['exclude'], mustFollow: [], repeatable: true},
  {id: 'load-directory', name: 'Load Directory', description: 'Load all matching files from a directory',
    fields: [
      {key: 'path', label: 'Path', type: 'text', placeholder: '.'},
      {key: 'extension', label: 'Extension', type: 'text', placeholder: '.ray'},
    ],
    display: 'Load Directory({path}, {extension})',
    acceptsModifiers: ['recursively', 'exclude'], mustFollow: ['load-file'], repeatable: true},
  {id: 'recursively', name: 'Recursively', description: 'Process subdirectories recursively',
    fields: [], display: 'Recursively',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'exclude', name: 'Exclude', description: 'Exclude files matching a pattern',
    fields: [{key: 'pattern', label: 'Pattern', type: 'text', placeholder: '*.test.ray'}],
    display: 'Exclude({pattern})',
    acceptsModifiers: [], mustFollow: [], repeatable: true},
  {id: 'read-rtl', name: 'Read RTL', description: 'Right-to-left reading for specific constructs',
    fields: [{key: 'constructs', label: 'Constructs', type: 'text', placeholder: 'assignment'}],
    display: 'Read RTL({constructs})',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'read-ltr', name: 'Read LTR', description: 'Left-to-right reading (explicit)',
    fields: [], display: 'Read LTR',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'bidirectional', name: 'Bidirectional', description: 'Both directions coexist',
    fields: [], display: 'Bidirectional',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'per-construct-override', name: 'Per-construct Override', description: 'Per-construct override',
    fields: [], display: 'Per-construct Override',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'nesting', name: 'Nesting', description: 'Delimiter nesting rules',
    fields: [{key: 'selfNest', label: 'Self-nesting', type: 'toggle'}],
    display: 'Nesting',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'compound-splitting', name: 'Compound Splitting', description: 'Split multi-character tokens',
    fields: [{key: 'strategy', label: 'Strategy', type: 'text', placeholder: 'split-candidate'}],
    display: 'Compound Splitting({strategy})',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'aliasing', name: 'Aliasing', description: 'Multiple names for one thing',
    fields: [{key: 'syntax', label: 'Syntax', type: 'text', placeholder: '|'}],
    display: 'Aliasing({syntax})',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'forward-references', name: 'Forward References', description: 'Use before definition',
    fields: [], display: 'Forward References',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'fixpoint', name: 'Fixpoint', description: 'Re-parse until grammar stabilizes',
    fields: [{key: 'maxRounds', label: 'Max rounds', type: 'text', placeholder: '10'}],
    display: 'Fixpoint({maxRounds})',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
  {id: 'fallback-chain', name: 'Fallback Chain', description: 'Prototype/fallback for method lookup',
    fields: [{key: 'model', label: 'Model', type: 'text', placeholder: 'prototype'}],
    display: 'Fallback Chain({model})',
    acceptsModifiers: [], mustFollow: [], repeatable: false},
];

export const MODULE_TYPE_MAP = new Map(MODULE_TYPES.map((t) => [t.id, t]));

export function defaultProgram(lang: string): ModuleInstance[] {
  let nextId = 1;
  const inst = (
    typeId: string,
    config: Record<string, any> = {},
    children: ModuleInstance[] = [],
  ): ModuleInstance => ({
    id: `m${nextId++}`,
    typeId, config, children,
    isDefault: true,
    expanded: true,
  });
  return [
    inst('reading', {direction: 'ltr'}, [
      inst('load-file', {path: `Node.${lang}`}),
      inst('load-directory', {path: '.', extension: `.${lang}`}, [
        inst('recursively'),
        inst('exclude', {pattern: `Node.${lang}`}),
      ]),
    ]),
    inst('structure', {indentation: true, lines: true, separator: 'newline'}),
    inst('delimiters', {pairs: '() [] {}'}, [inst('nesting', {selfNest: true})]),
    inst('comments', {line: '//'}),
    inst('tokenization', {identifierChars: '\\S', tokenBreakers: 'space, newline'}, [inst('compound-splitting', {strategy: 'split-candidate'})]),
    inst('binding', {syntax: '='}, [inst('aliasing', {syntax: '|'}), inst('forward-references')]),
    inst('scoping', {model: 'lexical', self: 'this', unresolved: 'forward'}),
    inst('evaluation', {strategy: 'lazy', passes: 'fixpoint'}, [inst('fixpoint', {maxRounds: '10'})]),
    inst('associativity', {default: 'left', precedence: 'positional'}, [inst('per-construct-override')]),
    inst('patterns', {bindingSlots: '{name: type}', alternation: '|', body: '=>'}),
    inst('dispatch', {call: 'juxtaposition', notCallable: 'error'}, [inst('fallback-chain', {model: 'prototype'})]),
    inst('diagnostics', {recovery: 'collect', locationTracking: true}),
    inst('execution', {repl: true, stepThrough: true, astBrowser: true}),
  ];
}

// ---- Tree helpers (pure) ----

export function findInstance(program: ModuleInstance[], id: string): ModuleInstance | null {
  for (const inst of program) {
    if (inst.id === id) return inst;
    const found = findInstance(inst.children, id);
    if (found) return found;
  }
  return null;
}

export function findParentList(
  program: ModuleInstance[],
  targetId: string,
): ModuleInstance[] | null {
  for (const inst of program) {
    if (inst.id === targetId) return program;
    if (inst.children.length > 0) {
      const f = findParentList(inst.children, targetId);
      if (f) return f;
    }
  }
  return null;
}

export function flattenProgram(
  program: ModuleInstance[],
  depth = 0,
): {inst: ModuleInstance; depth: number}[] {
  const out: {inst: ModuleInstance; depth: number}[] = [];
  for (const inst of program) {
    out.push({inst, depth});
    if (inst.expanded && inst.children.length > 0) {
      out.push(...flattenProgram(inst.children, depth + 1));
    }
  }
  return out;
}

export function expandParents(program: ModuleInstance[], targetId: string): boolean {
  for (const inst of program) {
    if (inst.id === targetId) return true;
    if (inst.children.length > 0 && expandParents(inst.children, targetId)) {
      inst.expanded = true;
      return true;
    }
  }
  return false;
}
