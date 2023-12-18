// Basic declarations as `any` until proper UXP types exist:
declare module "os";

// No declarations file exist for UXP elements
export {};
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'sp-button': any;
            'sp-button-group': any;
            'sp-dropdown': any;
            'sp-menu-divider': any;
            'sp-textfield': any;
            'sp-textarea': any;
            'sp-checkbox': any;
            'sp-menu': any;
            'sp-menu-item': any;
            'sp-slider': any;
            'sp-picker': any;
            'sp-popover': any;
            'sp-action-button': any;
            'sp-overlay': any;
            'sp-icon': any;
            'sp-body': any;
            'sp-detail': any;
            'sp-heading': any;
            'sp-label': any;
            'sp-divider': any;
            'sp-dialog': any;
            'sp-progressbar': any;
        }
    }
}
