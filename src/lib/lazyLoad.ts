export const lazyLoad = (el: HTMLDivElement, opacityInsteadOfClass = false) => {
    el.onload = () => {
        if (opacityInsteadOfClass) el.style.opacity = '1';
        else el.classList.add('loaded');
    };
};
