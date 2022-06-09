import { FastifyPluginAsync } from 'fastify';
import { RouteGenericInterface } from 'fastify/types/route';
import { CommentPayload, RatingPayload, UserID } from '../models/models';
import { Database } from './database';

declare module 'fastify' {
    interface Session {
        initialized: boolean;
        userId: UserID;
    }
}

interface RatingRequest extends RouteGenericInterface {
    Body: RatingPayload;
}

interface ParameterizedRatingRequest extends RatingRequest {
    Params: {
        ratingId: string;
    };
}

interface CommentRequest extends RouteGenericInterface {
    Body: CommentPayload;
}

interface ParameterizedCommentRequest extends CommentRequest {
    Params: {
        commentId: string;
    };
}

const getBody = <T extends unknown>(body: T) => JSON.parse(body as string) as T;

const routes: FastifyPluginAsync<{ database: Database }> = async (
    fastify,
    opts
) => {
    const db = opts.database;
    await db.init();

    fastify.get('/me', async (req, reply) => {
        try {
            const me = db.getCurrentUserData(req.session.userId);
            return me;
        } catch (e) {
            reply.status(404).send(e);
        }
    });

    fastify.get('/comments', async () => {
        return { comments: db.getCommentList() };
    });

    fastify.post<CommentRequest>('/comments', async (req, reply) => {
        try {
            const { message } = getBody(req.body);
            return db.createComment(message, req.session.userId);
        } catch (e) {
            reply.status(404).send(e);
        }
    });

    fastify.post<ParameterizedCommentRequest>(
        '/comments/:commentId',
        async (req, reply) => {
            try {
                const { message } = getBody(req.body);
                const { commentId: parentId } = req.params;
                return db.createChildComment(
                    message,
                    parentId,
                    req.session.userId
                );
            } catch (e) {
                reply.status(404).send(e);
            }
        }
    );

    fastify.put<ParameterizedCommentRequest>(
        '/comments/:commentId',
        async (req, reply) => {
            try {
                const { message } = getBody(req.body);
                const { commentId } = req.params;
                return db.modifyComment(message, commentId, req.session.userId);
            } catch (e) {
                reply.status(404).send(e);
            }
        }
    );

    fastify.delete<ParameterizedCommentRequest>(
        '/comments/:commentId',
        async (req, reply) => {
            try {
                const { commentId } = req.params;
                return db.deleteComment(commentId, req.session.userId);
            } catch (e) {
                reply.status(404).send(e);
            }
        }
    );

    fastify.post<RatingRequest>('/ratings', async (req, reply) => {
        try {
            const { rating, commentId } = getBody(req.body);
            return db.addRating(rating, commentId, req.session.userId);
        } catch (e) {
            reply.status(404).send(e);
        }
    });

    fastify.put<ParameterizedRatingRequest>(
        '/ratings/:ratingId',
        async (req, reply) => {
            try {
                const { rating } = getBody(req.body);
                const { ratingId } = req.params;
                return db.modifyRating(rating, ratingId, req.session.userId);
            } catch (e) {
                reply.status(404).send(e);
            }
        }
    );
};

export default routes;
