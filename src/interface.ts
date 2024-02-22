export interface UDoc {
    id: number;
    username: string;
    password: string;
    email: string;
    permission: number;
    avatar?: string;
}

export enum PERM {
    PERM_VIEW_BLOG,
    PERM_POST_BLOG,
    PERM_EDIT_OWN_BLOG,
    PERM_EDIT_BLOG,
    PERM_UPLOAD_FILE,
    PERM_DELETE_FILE,
    PERM_MANAGE_USER,
    PERM_VIEW_HIDDEN_BLOG,
}

export interface BlogDoc {
    _id: number;
    owner: number;
    title: string;
    content: string;
    publishedAt: number;
    rating: number;
    hidden?: boolean;
}

export interface FileMetadata {
    originalName: string;
    user: number;
    size: number;
    sha256: string;
    date: number;
    filelink: string;
}
