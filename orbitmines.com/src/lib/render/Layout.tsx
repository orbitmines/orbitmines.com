import React from "react";
import classNames from "classnames";
import _ from "lodash";

// export const getClass = (className: string) => (styles && styles[className]) ? styles[className] : className;

export type ColumnSize = number | boolean;
export type ViewportSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Alignment = 'start' | 'center' | 'end' | 'top' | 'middle' | 'bottom' | 'around' | 'between';

// TODO: ts-transformer-keys
export const ViewportSizes: ViewportSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
export const Alignments: Alignment[] = ['start', 'center', 'end', 'top', 'middle', 'bottom', 'around', 'between'];

export const Grid = (props: React.HTMLAttributes<HTMLElement> & {
    fluid?: boolean
    tagName?: string
}) => {
    return React.createElement(props.tagName ?? 'div', {
        ...props,
        className: classNames(
            props.fluid ? 'container-fluid' : 'container',
            props.className,
        )
    });
}

export type ColumnProps = {
    [T in ViewportSize]?: ColumnSize
} & {
    [T in `${ViewportSize}Offset`]?: number
} & {
    first?: ViewportSize
    last?: ViewportSize
    tagName?: string
};

export const Col = (props: React.HTMLAttributes<HTMLElement> & ColumnProps) => {
    const {
        tagName = 'div',

        first,
        last,

        className
    } = props;

    return React.createElement(tagName, {
        ...props,
        className: classNames(
            first ? `first-${first}` : null,
            last ? `last-${first}` : null,

            ...ViewportSizes.map(size => {
                let value = props[size];
                let offset = props[`${size}Offset`];

                return ({
                    [`col-${size}${_.isInteger(value) ? `-${value}` : ''}`]: !!value,
                    [`col-${size}-offset${_.isInteger(offset) ? `-${offset}` : ''}`]: !!offset,
                })
            }),

            className
        )
    });
}

export type RowProps = {
    [T in Alignment]?: ViewportSize
} & {
    reverse?: boolean,
    tagName?: string
};

export const Row = (props: React.HTMLAttributes<HTMLElement> & RowProps) => {
    const {
        tagName = 'div',
        reverse,

        className
    } = props;

    return React.createElement(tagName, {
        ...props,
        className: classNames(
            'row',
            {
                reverse,
            },
            ...Alignments.map(alignment => props[alignment] ? `${alignment}-${props[alignment]}` : null),
            className
        )
    });
}