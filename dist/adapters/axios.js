export function createAxiosExecutor(options) {
    const { axios, baseUrl, queryParam = 'q', axiosOptions = {} } = options;
    let cancelFn = null;
    return {
        execute: async (query, signal) => {
            if (signal) {
                signal.addEventListener('abort', () => {
                    if (cancelFn)
                        cancelFn('Request was canceled');
                });
            }
            let cancelToken;
            if (axios.CancelToken) {
                const source = axios.CancelToken.source();
                cancelToken = source.token;
                cancelFn = source.cancel;
            }
            const params = {};
            params[queryParam] = query;
            try {
                const response = await axios.get(baseUrl, {
                    ...axiosOptions,
                    params,
                    cancelToken,
                });
                return response.data;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error(String(error));
            }
        },
    };
}
