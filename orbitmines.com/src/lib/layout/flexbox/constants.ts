
// export const getClass = (className: string) => (styles && styles[className]) ? styles[className] : className;

export type ColumnSize = number | boolean;
export type ViewportSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Alignment = 'start' | 'center' | 'end' | 'top' | 'middle' | 'bottom' | 'around' | 'between';

// TODO: ts-transformer-keys
export const ViewportSizes: ViewportSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
export const Alignments: Alignment[] = ['start', 'center', 'end', 'top', 'middle', 'bottom', 'around', 'between'];