export enum AppMode {
    tool = 'tool',
    showcase = 'showcase',
}

export const isToolMode = (): boolean => process.env.NEXT_PUBLIC_MODE === AppMode.tool;