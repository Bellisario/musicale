interface MenuEntry {
    title: string;
    disabled?: boolean;
    breakAfter?: boolean;
    action: (e?: any) => void;
    discardAction?: () => void;
}

export { type MenuEntry };
