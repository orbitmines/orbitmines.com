export interface ModuleField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'toggle';
  options?: [string, string][];
  placeholder?: string;
}

export interface ModuleType {
  id: string;
  name: string;
  description: string;
  fields: ModuleField[];
  /** Display template — `{fieldKey}` placeholders become inline editors;
   *  everything else is rendered as chrome (dimmed, non-editable). */
  display?: string;
  acceptsModifiers: string[];
  mustFollow: string[];
  repeatable: boolean;
}

export interface ModuleInstance {
  id: string;
  typeId: string;
  config: Record<string, any>;
  children: ModuleInstance[];
  /** True for instances seeded from defaults; rendered muted until edited. */
  isDefault: boolean;
  expanded: boolean;
}

export interface LangConfig {
  extension: string;
  program: ModuleInstance[];
}

export interface ProgramError {
  instanceId: string;
  message: string;
}
