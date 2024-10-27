/*
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import { ProfilingIntegration } from '@sentry/profiling-node';

export const initializeSentry = () => {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        integrations: [
            // Rewrite paths in stacktraces
            new RewriteFrames({
                root: global.__dirname,
            }),
            // Enable profiling
            new ProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0,
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
    });
};*/
