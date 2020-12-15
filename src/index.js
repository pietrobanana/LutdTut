import cors from 'cors';
import 'dotenv/config';
import express, { text } from 'express';
import jwt from 'jsonwebtoken';
import { ApolloServer, AuthenticationError, gql } from 'apollo-server-express'; /* Graphql server */
import http from 'http';
import DataLoader from 'dataloader';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const app = express();
app.use(cors());

const getMe = async req => {
    const token = req.headers['x-token'];

    if (token) {
        try {
            return await jwt.verify(token, process.env.SECRET);
        } catch (e) {
            throw new AuthenticationError(
                'Your session expired. Sign in again.',
            );
        }
    }
};

const batchUsers = async (keys, models) => {
    const users = await models.User.findAll({
        where: {
            id: {
                $in: keys,
            },
        },
    });

    return keys.map(key => users.find(user => user.id === key));
};

const userLoader = new DataLoader(keys => batchUsers(keys, models));

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    formatError: error => {
        // remove the internal sequelize error message
        // leave only the important validation error
        const message = error.message
            .replace('SequelizeValidationError: ', '')
            .replace('Validation error: ', '');

        return {
            ...error,
            message,
        };
    },
    context: async ({ req, connection }) => {
        if (connection) {
            return {
                models,
            };
        }

        if (req) {
            const me = await getMe(req);

            return {
                models,
                me,
                secret: process.env.SECRET,
                loaders: {
                    user: new DataLoader(keys => batchUsers(keys, models)),
                },
            };
        }
    },
});

/* Applying the middleware to the appollos server
* Applying express to apollos*/
server.applyMiddleware({ app, path: '/graphql' })

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const eraseDatabaseOnSync = true;

const isTest = !!process.env.TEST_DATABASE;

sequelize.sync({ force: isTest }).then(async () => {
    if (isTest) {
        createUsersWithMessages(new Date());
    }

    httpServer.listen({ port: 8000 }, () => {
        console.log('Apollo Server on http://localhost:8000/graphql');
    });
});

const createUserWithMessages = async date => {
    await models.User.create(
        {
            username: 'jpietrogiovanna',
            email: 'jrg.ptrgvnn@gmail.com',
            password: 'pass123',
            role: 'ADMIN',
            messages: [
                {
                    text: 'Published the Road to learn React',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        {
            include: [models.Message],
        },
    );

    await models.User.create(
        {
            username: 'lula',
            email: 'lula@gmail.com',
            password: 'pass123',
            messages: [
                {
                    text: 'Happy to release...',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
                {
                    text: 'Published a complete...',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        {
            include: [models.Message],
        },
    );
};