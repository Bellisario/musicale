import type AudioStreamResponse from 'src/types/AudioStreamResponse';

export default async function audioStreamGetter(id: string): Promise<AudioStreamResponse> {
    // fetch https://pipedapi.kavin.rocks/streams/:id
    const res = await fetch(`https://pipedapi.kavin.rocks/streams/${id}`);
    return await res.json();
}