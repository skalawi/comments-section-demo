import { randUser, randUuid, User } from '@ngneat/falso';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
    RatingID,
    UserID,
    CommentID,
    CommentData,
    ChildComment,
    CurrentUserData,
    UserData,
} from '../models/models';
interface Rating {
    ratingId: RatingID;
    userId: UserID;
    commentId: CommentID;
    rating: number;
}

interface Comment {
    commentId: CommentID;
    parentId?: CommentID;
    userId: UserID;
    message: string;
    date: string;
}

const resourceNotFoundMessage =
    (resource: string) =>
    (id: string): never => {
        throw new Error(`${resource} with id ${id} not found.`);
    };

const commentNotFound = resourceNotFoundMessage('Comment');
const ratingNotFound = resourceNotFoundMessage('Rating');
const userNotFound = resourceNotFoundMessage('User');

export class Database {
    private COMMENTS: Comment[] = [];
    private USERS: User[] = [];
    private RATINGS: Rating[] = [];

    private preparedComments: CommentData[] = [];
    private modifiedComments: Map<CommentID, CommentData | ChildComment> =
        new Map();

    constructor(private readonly ROOT: string) {}

    async init(): Promise<void> {
        await Promise.all([
            this.loadComments(),
            this.loadUsers(),
            this.loadRatings(),
        ]);
        this.prepareComments();
    }

    getCommentList(): CommentData[] {
        return this.preparedComments;
    }

    createUser(): UserID {
        const user = randUser();
        user.img = `${user.img}?u=${user.id}`;
        this.USERS.push(user);
        return user.id;
    }

    createComment(message: string, userId: UserID): CommentID {
        const newComment: CommentData = {
            ...this.generatePartialComment(message, userId),
            children: [],
        };
        this.modifiedComments.set(newComment.commentId, newComment);
        this.preparedComments.push(newComment);
        return newComment.commentId;
    }

    createChildComment(
        message: string,
        parentId: CommentID,
        userId: UserID
    ): CommentID {
        const childComment = this.generatePartialComment(message, userId);
        this.modifiedComments.set(childComment.commentId, childComment);
        const parent = this.preparedComments.find(
            (c) => c.commentId === parentId
        );
        if (!parent) {
            return commentNotFound(parentId);
        }
        parent.children.push(childComment);
        return childComment.commentId;
    }

    modifyComment(
        message: string,
        commentId: CommentID,
        userId: UserID
    ): CommentID {
        const comment = this.modifiedComments.get(commentId);
        if (!comment) {
            return commentNotFound(commentId);
        }
        if (comment.user.userId !== userId) {
            throw new Error(`Unauthorized access to comment ${commentId}`);
        }
        comment.message = message;
        return comment.commentId;
    }

    deleteComment(commentId: CommentID, userId: UserID): CommentID {
        const comment = this.modifiedComments.get(commentId);
        if (!comment) {
            return commentNotFound(commentId);
        }
        if (comment.user.userId !== userId) {
            throw new Error(`Unauthorized access to comment ${commentId}`);
        }
        this.preparedComments = this.preparedComments.filter(
            (c) => c.commentId !== commentId
        );
        this.modifiedComments.delete(commentId);
        return commentId;
    }

    getCurrentUserData(userId: UserID): CurrentUserData {
        return {
            ...this.getUser(userId),
            ratings: this.RATINGS.filter((r) => r.userId === userId).map(
                (r) => ({
                    ratingId: r.ratingId,
                    commentId: r.commentId,
                    rating: r.rating,
                })
            ),
        };
    }

    addRating(rating: number, commentId: CommentID, userId: UserID): RatingID {
        const existingRating = this.RATINGS.find(
            (r) => r.commentId === commentId && r.userId === userId
        );
        if (existingRating) {
            throw new Error('Invalid rating create operation');
        }
        const newRating: Rating = {
            ratingId: randUuid(),
            rating,
            userId,
            commentId,
        };
        this.RATINGS.push(newRating);
        const comment = this.modifiedComments.get(commentId);
        if (!comment) {
            return commentNotFound(commentId);
        }
        comment.rating += rating;
        return newRating.ratingId;
    }

    modifyRating(
        newRating: number,
        ratingId: RatingID,
        userId: UserID
    ): RatingID {
        const rating = this.RATINGS.find((r) => r.ratingId === ratingId);
        if (!rating) {
            return ratingNotFound(ratingId);
        }
        if (rating.userId !== userId) {
            throw new Error(`Unauthorized access to rating ${ratingId}`);
        }
        const comment = this.modifiedComments.get(rating.commentId);
        if (!comment) {
            return commentNotFound(rating.commentId);
        }
        comment.rating += newRating - rating.rating;
        rating.rating = newRating;
        return rating.ratingId;
    }

    private generatePartialComment(
        message: string,
        userId: UserID
    ): ChildComment {
        return {
            commentId: randUuid(),
            user: this.getCurrentUserData(userId),
            rating: 0,
            message: message,
            date: new Date().toISOString(),
        };
    }

    private async loadComments(): Promise<void> {
        const commentsData = await this.loadFile('comments.json');
        this.COMMENTS = JSON.parse(commentsData);
        this.COMMENTS = this.COMMENTS.sort((a, b) => {
            const first = new Date(a.date);
            const second = new Date(b.date);
            return first.getTime() - second.getTime();
        });
    }

    private async loadUsers(): Promise<void> {
        const usersData = await this.loadFile('users.json');
        this.USERS = JSON.parse(usersData);
    }

    private async loadRatings(): Promise<void> {
        const ratingData = await this.loadFile('ratings.json');
        this.RATINGS = JSON.parse(ratingData);
    }

    private prepareComments(): void {
        this.preparedComments = this.COMMENTS.filter((c) => !c.parentId).map(
            (comment) => {
                const newComment = {
                    commentId: comment.commentId,
                    rating: 0,
                    user: this.getUser(comment.userId),
                    message: comment.message,
                    date: comment.date,
                    children: [],
                };
                this.modifiedComments.set(newComment.commentId, newComment);
                return newComment;
            }
        );

        this.COMMENTS.filter((c) => !!c.parentId).forEach((comment) => {
            const parent = this.modifiedComments.get(
                comment.parentId!
            ) as CommentData;
            const newComment = {
                commentId: comment.commentId,
                rating: 0,
                user: this.getUser(comment.userId),
                message: comment.message,
                date: comment.date,
            };
            parent.children.push(newComment);
            this.modifiedComments.set(newComment.commentId, newComment);
        });

        this.RATINGS.forEach((rating) => {
            const comment = this.modifiedComments.get(rating.commentId);
            if (!comment) {
                return commentNotFound(rating.commentId);
            }
            comment.rating += Number(rating.rating);
        });
    }

    private getUser(userId: string): UserData {
        const user = this.USERS.find((u) => u.id === userId);
        if (!user) {
            return userNotFound(userId);
        }
        return {
            userId: user.id,
            image: user.img,
            name: `${user.firstName} ${user.lastName}`,
            userName: user.username,
        };
    }

    private loadFile(name: string) {
        return readFile(join(this.ROOT, 'data', name), { encoding: 'utf-8' });
    }
}
