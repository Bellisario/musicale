interface MenuEntry {
    title: string;
    disabled?: boolean;
    breakAfter?: boolean;
    action: () => void;
}

export default MenuEntry;
