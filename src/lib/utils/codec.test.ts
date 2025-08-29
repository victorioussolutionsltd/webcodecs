import { describe, expect, it, vi } from 'vitest';

import { captureAndEncodeFrames, decodeFramesToImages } from './codec';

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

    // Mocks for VideoFrame and EncodedVideoChunk
    class MockVideoFrame {
      close() {
        /* mock close */
      }
    }
    // Mock encoded chunk with required properties
    const chunk = {
      byteLength: 1,
      duration: 1,
      timestamp: 1,
      type: 'key',
      copyTo: vi.fn(),
    } as EncodedVideoChunk;

    // Mock VideoDecoder
    const outputFrames: Array<MockVideoFrame> = [
      new MockVideoFrame(),
      new MockVideoFrame(),
    ];
    let outputCallback: ((frame: MockVideoFrame) => void) | null = null;
    const decoderMock = {
      configure: vi.fn(),
      decode: vi.fn(() => {
        if (outputCallback !== null) {
          outputFrames.forEach((frame) => outputCallback?.(frame));
        }
      }),
      flush: vi.fn(() => Promise.resolve()),
      close: vi.fn(),
    };
    (globalThis as { window: unknown }).window = {
      VideoDecoder: (opts: {
        output: (frame: MockVideoFrame) => void;
        error: (err: unknown) => void;
      }) => {
        outputCallback = opts.output;
        return decoderMock;
      },
    };

    // Run test
    const result = await decodeFramesToImages([chunk, chunk], ctx, canvas);
    expect(result).toEqual([dataUrl, dataUrl, dataUrl, dataUrl]);
    // Clean up
    delete (globalThis as { window: unknown }).window;
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
