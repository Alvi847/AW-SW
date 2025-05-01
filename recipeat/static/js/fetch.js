// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://www.builder.io/blog/safe-data-fetching

async function safeFetch(...options) {
    const response = await fetch(...options)
    if (!response.ok) {
        throw new ResponseError('Bad fetch response', response)
    }
    return response
}

class ResponseError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
        this.name = 'ResponseError';
    }
}

async function postData(url = '', data = {}, options = {}) {
    if (!(data instanceof FormData) || !(data instanceof URLSearchParams)) {
        data = new URLSearchParams(data);
    }

    try {
        // Opciones por defecto marcadas con *
        const defaultOptions = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        };

        const actualOptions = Object.assign({}, defaultOptions, options, {
            body: data // body data type must match "Content-Type" header
        });

        actualOptions.headers = mergeHeaders({
            'X-Requested-With': 'XMLHttpRequest', // Usado habitualmente para identificar una petición con XMLHttpRequest / fetch
            //'Content-Type': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        }, options.headers || {});

        const response = safeFetch(url, actualOptions);
        return response;
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 404 :
                    // Gestionar de manera especial este error
                    ;
                    return;
                    break;
            }
        }
        defaultErrorHandler(err);
    }
}

function mergeHeaders(target, source) {
    const mergedHeaders = new Headers(target);
    const toMerge = new Headers(source);
    toMerge.forEach((value, key) => {
        mergedHeaders.append(key, value);
    });
    return mergedHeaders
}

async function postJson(url = '', data = {}, options = {}) {
    try {
        // Opciones por defecto marcadas con *
        const defaultOptions = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        };

        const actualOptions = Object.assign({}, defaultOptions, options, {
            // body: new URLSearchParams(data) // body data type must match "Content-Type" header
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
    
        actualOptions.headers = mergeHeaders({
            'X-Requested-With': 'XMLHttpRequest', // Usado habitualmente para identificar una petición con XMLHttpRequest / fetch
            'Content-Type': 'application/json',
            //'Content-Type': 'application/x-www-form-urlencoded',
        }, options.headers || {});

        const response = safeFetch(url, actualOptions);
        return response;
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 404 :
                    // Gestionar de manera especial este error
                    ;
                    return;
                    break;
            }
        }
        defaultErrorHandler(err);
    }
}

async function post(url = '', data = new FormData(), options = {}) {
    try {
        const defaultOptions = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        };

        const actualOptions = Object.assign({}, defaultOptions, options, {
            // body: new URLSearchParams(data) // body data type must match "Content-Type" header
            body: data // body data type must match "Content-Type" header
        });
    
        actualOptions.headers = mergeHeaders({
            'X-Requested-With': 'XMLHttpRequest', // Usado habitualmente para identificar una petición con XMLHttpRequest / fetch
            //'Content-Type': 'application/json',
            //'Content-Type': 'application/x-www-form-urlencoded',
        }, options.headers || {});

        const response = safeFetch(url, actualOptions);
        return response;
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 404 :
                    // Gestionar de manera especial este error
                    ;
                    return;
                    break;
            }
        }
        defaultErrorHandler(err);
    }
}

async function getData(url = '', options = {}) {
    try {
        const defaultOptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        };
    
        const actualOptions = Object.assign({}, defaultOptions, options);

        actualOptions.headers = mergeHeaders({
            'X-Requested-With': 'XMLHttpRequest', // Usado habitualmente para identificar una petición con XMLHttpRequest / fetch
        }, options.headers || {});

        const response = safeFetch(url, actualOptions);
        return response;
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 404 :
                    // Gestionar de manera especial este error
                    ;
                    return;
                    break;
            }
        }
        defaultErrorHandler(err);
    }
}

function defaultErrorHandler(err) {
    if (err instanceof ResponseError) {
        switch (err.response.status) {
            case 401:
                // Usuario no logado
                ;
                break;
            case 500:
                // Mostrar un diálogo piendo disculpas
                ;
                break;
            default:
                // Show 
                throw new Error('Unhandled fetch response', { cause: err })
        }
    }
    throw new Error('Unknown fetch error', { cause: err })
}