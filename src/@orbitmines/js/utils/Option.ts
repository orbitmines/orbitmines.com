import {makeTaggedUnion, MemberType, none, TaggedUnion} from "./match";
import {Arbitrary} from "../../explorer/Ray";

/**
 * Rust-like Option
 *
 * <3 https://github.com/suchipi/safety-match/issues/15#issuecomment-1384721329
 */
export type Option<T = any> = MemberType<
    TaggedUnion<{
        Some: (some: T) => T;
        None: typeof none;
    }, {
        force: () => T,
        none_or: <Result>(or: (obj: T) => Result) => Option<Result>,
        default: (fn: () => T) => T,
        is_some: () => boolean,
        is_none: () => boolean,
    }>
>;
export const Option = makeTaggedUnion<{
    Some: (some: any) => any;
    None: typeof none;
}, {
    force: () => any,
    none_or: (or: (obj: any) => any) => any,
    default: (fn: () => any) => any,
    is_some: () => boolean,
    is_none: () => boolean
}>({
    Some: (some: any) => some,
    None: none,
}, {
    force: (obj: Option<any>): any => obj.match({
        Some: (a) => a,
        None: () => { throw new Error('aaa') }
    }),
    default: (obj: Option<any>, fn: () => any): any => obj.match({
        Some: (a) => a,
        None: () => fn()
    }),
    none_or: (obj: Option<any>, or: (obj: any) => any): Option<any> => obj.match({
        Some: (some: any) => Option.Some(or(some)),
        None: () => Option.None
    }),
    is_some: (obj: Option<any>): boolean => obj.match({
        Some: (_) => true,
        None: () => false
    }),
    is_none: (obj: Option<any>): boolean => obj.match({
        Some: (_) => false,
        None: () => true
    }),
});