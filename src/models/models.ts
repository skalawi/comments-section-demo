export interface RatingPayload {
    rating: number;
    commentId: string;
}

export interface CommentPayload {
    message: string;
}

export type CommentID = string;
export type UserID = string;
export type RatingID = string;

export interface UserRatingData {
    commentId: CommentID;
    ratingId: RatingID;
    rating: number;
}

export interface UserData {
    userId: UserID;
    image: string;
    name: string;
    userName: string;
}

export interface CurrentUserData extends UserData {
    ratings: UserRatingData[];
}

export interface ChildComment {
    commentId: string;
    rating: number;
    user: UserData;
    message: string;
    date: string;
}

export interface CommentData extends ChildComment {
    children: ChildComment[];
}
