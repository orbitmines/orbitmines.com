import {MODULE_TYPE_MAP} from './modules';
import type {ModuleInstance, ProgramError} from './types';

export function validateProgram(program: ModuleInstance[]): ProgramError[] {
  const errors: ProgramError[] = [];
  const seen = new Set<string>();

  for (const inst of program) {
    const mtype = MODULE_TYPE_MAP.get(inst.typeId);
    if (!mtype) {
      errors.push({instanceId: inst.id, message: `Unknown module type: ${inst.typeId}`});
      continue;
    }

    for (const req of mtype.mustFollow) {
      if (!seen.has(req)) {
        const reqType = MODULE_TYPE_MAP.get(req);
        errors.push({
          instanceId: inst.id,
          message: `${mtype.name} must come after ${reqType?.name ?? req}`,
        });
      }
    }

    for (const field of mtype.fields) {
      const val = inst.config[field.key];
      if (field.type !== 'toggle' && (!val || (typeof val === 'string' && !val.trim()))) {
        errors.push({
          instanceId: inst.id,
          message: `${mtype.name}: ${field.label} is not configured`,
        });
      }
    }

    for (const child of inst.children) {
      if (!mtype.acceptsModifiers.includes(child.typeId)) {
        const childType = MODULE_TYPE_MAP.get(child.typeId);
        errors.push({
          instanceId: child.id,
          message: `${childType?.name ?? child.typeId} cannot be a modifier of ${mtype.name}`,
        });
      }
    }

    seen.add(inst.typeId);
  }

  return errors;
}

export function instanceHasErrors(
  inst: ModuleInstance,
  errors: ProgramError[],
): boolean {
  if (errors.some((e) => e.instanceId === inst.id)) return true;
  return inst.children.some((c) => instanceHasErrors(c, errors));
}
