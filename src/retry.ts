import { RetryFunction } from 'async-retry'
import retry from 'async-retry'

import d from 'debug'
const debug = d('mtk:retry');

interface NewRetryOptions extends retry.Options {
    retryLimitMessage: string,
}

/// This function wraps the `async-retry` library
///
/// We do this so that we can add some custom functionality:
/// - Automatically print debug logs on retry
/// - Throw a Error with a customisable messages when the max
///   number of retries has been hit
const internalRetry = (fn: RetryFunction<any>, opts: NewRetryOptions): Promise<any> => {
    // Default retries to 3
    if (opts.retries === undefined) {
        opts.retries = 3;
    }
    opts.retries += 1;

    const origOnRetry = opts.onRetry;
    // On retry, print debug
    opts.onRetry = (err, attempt) => {
        if (origOnRetry !== undefined) {
            origOnRetry(err, attempt);
        }
        debug("Attempt %d, got error %s", attempt, err);
    };

    // TODO: Potentially re-write so that the Error keeps the stack of
    //       the original error
    return retry(async (bail, attempt) => {
        // If the last retry fails, bail with a nice error
        // `attempt` starts on 1 and increases for each attempt
        // With the above setup the last attempt will be `retries + 1`
        if (opts.retries !== undefined && attempt === opts.retries + 1) {
            bail(new Error(opts.retryLimitMessage))
            return
        }

        return fn(bail, attempt)
    }, opts)
}

export default internalRetry;
