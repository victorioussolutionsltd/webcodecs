import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { captureAndEncodeFrames, decodeFramesToImages } from './codec';

// Setup window and mock VideoDecoder before all tests
beforeAll(() => {
  (globalThis as unknown as { window: unknown }).window = globalThis;
  (
    globalThis as unknown as { window: { VideoDecoder: unknown } }
  ).window.VideoDecoder = (opts: {
    output: (frame: unknown) => void;
    error: (err: unknown) => void;
  }) => {
    const outputCallback = opts.output;
    return {
      configure: vi.fn(),
      decode: vi.fn(() => {
        // Simulate one frame per chunk
        outputCallback?.({ close: vi.fn() });
      }),
      flush: vi.fn(() => Promise.resolve()),
      close: vi.fn(),
    };
  };
});

afterAll(() => {
  delete (globalThis as unknown as { window: { VideoDecoder: unknown } }).window
    .VideoDecoder;
  delete (globalThis as unknown as { window: unknown }).window;
});

describe('codec utils', () => {
  it('decodeFramesToImages returns image data URLs for encoded chunks', async () => {
    // Mocks for canvas/context
    const dataUrl = 'data:image/png;base64,mock';
    const ctx = { drawImage: vi.fn() } as unknown as CanvasRenderingContext2D;
    const canvas = {
      width: 320,
      height: 240,
      toDataURL: vi.fn(() => dataUrl),
    } as unknown as HTMLCanvasElement;

    // Mock encoded chunk with required properties
    const chunk = {
      byteLength: 1,
      duration: 1,
      timestamp: 1,
      type: 'key',
      copyTo: vi.fn(),
    } as EncodedVideoChunk;

    // Run test
    const result = await decodeFramesToImages([chunk, chunk], ctx, canvas);
    expect(result).toEqual([dataUrl, dataUrl]);
  });

  it('captureAndEncodeFrames throws if no videoTrack', async () => {
    await expect(
      captureAndEncodeFrames(
        undefined as unknown as MediaStreamTrack,
        {} as unknown as CanvasRenderingContext2D,
        {} as unknown as HTMLCanvasElement,
        {} as unknown as VideoEncoder,
        { current: true },
        1,
      ),
    ).rejects.toThrow();
  });

  // Add more tests for edge cases and error handling as needed
});
