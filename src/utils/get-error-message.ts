type ErrorWithMessage = {
    message: string;
};

function isErrorWithMessage(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== undefined &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError as ErrorWithMessage;

    try {
        if (typeof maybeError === 'string') return new Error(maybeError);
        return new Error(JSON.stringify(maybeError));
    } catch {
        return new Error(String(maybeError));
    }
}

export function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message;
}
