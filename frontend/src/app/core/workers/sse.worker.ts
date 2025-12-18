/// <reference lib="webworker" />

export interface SseConfig {
    url: string;
    token: string | null;
}

let eventSource: ReadableStreamDefaultReader<Uint8Array> | null = null;
let controller: AbortController | null = null;

addEventListener('message', async ({ data }) => {
    const { type, payload } = data;

    if (type === 'CONNECT') {
        if (controller) {
            controller.abort();
        }
        await connectSSE(payload);
    } else if (type === 'STOP') {
        if (controller) {
            controller.abort();
            controller = null;
        }
    }
});

async function connectSSE(config: SseConfig) {
    controller = new AbortController();
    const signal = controller.signal;

    try {
        const headers: HeadersInit = {};
        if (config.token) {
            headers['Authorization'] = `Bearer ${config.token}`;
        }

        const response = await fetch(config.url, {
            headers,
            signal
        });

        if (!response.ok) {
            if (response.status === 401) {
                postMessage({ type: 'ERROR', error: { status: 401, message: 'Unauthorized' } });
                return;
            }
            throw new Error(`SSE connection failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }
        eventSource = reader;

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';

            for (const part of parts) {
                const lines = part.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const data = line.substring(5).trim();
                        if (data) {
                            postMessage({ type: 'EVENT', payload: data });
                        }
                    }
                }
            }
        }
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            postMessage({ type: 'ERROR', error: { message: error.message } });
        }
    }
}
