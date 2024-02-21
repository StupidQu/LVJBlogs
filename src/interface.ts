export interface UDoc {
    id: number;
    username: string;
    password: string;
    email: string;
    permission: number;
    avatar?: string;
}

export type UDocKeys = keyof UDoc;

export enum PERM {
    PERM_VIEW_BLOG,
    PERM_POST_BLOG,
    PERM_EDIT_OWN_BLOG,
    PERM_EDIT_BLOG,
    PERM_UPLOAD_FILE,
};
