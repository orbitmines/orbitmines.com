import {enumeration, MemberType, none, TaggedUnion} from "./match";

/**
 * Rust-like Option
 *
 * <3 https://github.com/suchipi/safety-match/issues/15#issuecomment-1384721329
 */
export type OptionObj<T> = {
  Some: (some: T) => T;
  None: typeof none;
}
export type OptionImpl<T> = {
  force: () => T,
  none_or: <Result>(or: (obj: T) => Result) => Option<Result>,
  default: (fn: () => T) => T,
  is_some: () => boolean,
  is_none: () => boolean,
}
export type Option<T = any> = MemberType<TaggedUnion<OptionObj<T>, OptionImpl<T>>>;

export const Option = enumeration<OptionObj<any>, OptionImpl<any>>({
    Some: (some: any) => some,
    None: none,
}, self => class {
    force = (): any => self.match({
        Some: (a) => a,
        None: () => { throw new Error('aaa') }
    });

    default = (fn: () => any): any => self.match({
        Some: (a) => a,
        None: () => fn()
    })

    none_or = (or: (obj: any) => any): Option<any> => self.match({
        Some: (some: any) => Option.Some(or(some)),
        None: () => Option.None
    })

    is_some = (): boolean => self.match({
        Some: (_) => true,
        None: () => false
    })

    is_none = (): boolean => self.match({
        Some: (_) => false,
        None: () => true
    })

});