interface MenuEntry {
    title: string;
    disabled?: boolean;
    breakAfter?: boolean;
    action: () => void;
    discardAction?: () => void;
}

export { type MenuEntry };
