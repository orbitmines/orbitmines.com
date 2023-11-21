// Rust-like enum pattern matching: <3 https://github.com/suchipi/safety-match
// ~ also added some additional functionality to define functions at the union level.

import _ from "lodash";

export const none = Symbol();

export type None = typeof none;

const MEMBER_TYPE = Symbol();

export type MemberType<
    TaggedUnionT extends {
        [MEMBER_TYPE]: any;
    }
> = TaggedUnionT[typeof MEMBER_TYPE];

type DefObjSuper = { [key: string]: None | ((...args: any[]) => any) };

type DataMap<DefObj extends DefObjSuper> = {
    [Property in keyof DefObj]: DefObj[Property] extends (...args: any) => any
        ? ReturnType<DefObj[Property]>
        : DefObj[Property] extends None
            ? undefined
            : DefObj[Property];
};

export type CasesObjFull<DefObj extends DefObjSuper> = {
    [Property in keyof DataMap<DefObj>]: DataMap<DefObj>[Property] extends None
        ? () => any
        : (data: DataMap<DefObj>[Property]) => any;
};

// Would call this CasesObjPartial if we didn't need to use the name for error reporting
type if_you_are_seeing_this_then_your_match_didnt_either_handle_all_cases_or_provide_a_default_handler_using_underscore<
    DefObj extends DefObjSuper
> = Partial<CasesObjFull<DefObj>> & {
    _: <Property extends keyof DataMap<DefObj>>(
        data: DataMap<DefObj>[Property]
    ) => any;
};

export type MatchConfiguration<DefObj extends DefObjSuper> =
    | CasesObjFull<DefObj>
    | if_you_are_seeing_this_then_your_match_didnt_either_handle_all_cases_or_provide_a_default_handler_using_underscore<DefObj>;

type MemberObject<
    DefObj extends DefObjSuper,
    DefImpl
> = MemberImpl<DefObj, DefImpl> & {
    match<C extends MatchConfiguration<DefObj>>(
      casesObj: C
    ): ReturnType<Exclude<C[keyof C], undefined>>;
    variant: keyof DefObj;
    data: DataMap<DefObj>[keyof DefObj];
};

export type TaggedUnion<DefObj extends DefObjSuper, DefImpl = {}> = {
    [Property in keyof DefObj]: DefObj[Property] extends (...args: any) => any
        ? (...args: Parameters<DefObj[Property]>) => MemberObject<DefObj, DefImpl>
        : MemberObject<DefObj, DefImpl>;
} & {
    [MEMBER_TYPE]: MemberObject<DefObj, DefImpl>;
};

export type MemberImpl<DefObj extends DefObjSuper, DefImpl> = {
    [Property in keyof DefImpl]: DefImpl[Property] extends (...args: infer TArgs) => infer TResult
        ? (...args: TArgs) => TResult
        : never;
}


const MemberObjectImpl = class MemberObjectImpl {
    variant: any;
    data: any;

    constructor(variant: any, data: any) {
        this.variant = variant;
        this.data = data;
    }

    match(casesObj: any): any {
        const data = this.data;
        const matchingHandler = casesObj[this.variant];

        if (matchingHandler) {
            return matchingHandler(data);
        } else if (casesObj._) {
            return casesObj._(data);
        } else {
            throw new Error(`Match did not handle variant: '${this.variant}'`);
        }
    }
}
Object.defineProperty(MemberObjectImpl, "name", { value: "MemberObject" });


export const enumeration = <
  DefObj extends DefObjSuper,
  DefImpl extends object
>(
  mapping: DefObj,
  constructor?: (self: MemberObject<DefObj, DefImpl>) => (new () => DefImpl),
): TaggedUnion<DefObj, DefImpl> => {

    const createImpl = (variant: keyof DefObj, data: any) => {
        const impl = new MemberObjectImpl(variant, data) as any;
        if (constructor === undefined)
            return impl;

        const defImpl = new (constructor(impl))();

        Object.keys(defImpl).forEach((methodName) => {
            // @ts-ignore
            const method: ((...args: any[]) => any) = defImpl[methodName];

            Object.defineProperty(impl, methodName, {
                value: (...args: any[]) => method(...args)
            })
        });

        return impl;
    }


    const enumeration: any = {};

    Object.keys(mapping).forEach((key) => {
        const value = mapping[key];

        if (_.isFunction(value)) {
            enumeration[key] = (...args: any) => {
                const data = value(...args);
                return createImpl(key, data);
            };
        } else {
            enumeration[key] = createImpl(key, undefined);
        }
    });

    return enumeration;
}
