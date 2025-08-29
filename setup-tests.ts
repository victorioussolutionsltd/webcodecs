// Global test setup for Vitest: mock window.VideoDecoder
import { vi } from 'vitest';

(globalThis as unknown as { window: unknown }).window = globalThis;
(
  globalThis as unknown as { window: { VideoDecoder: unknown } }
).window.VideoDecoder = function (opts: {
  output: (frame: unknown) => void;
  error: (err: unknown) => void;
}) {
  const outputCallback = opts.output;
  return {
    configure: vi.fn(),
    decode: vi.fn(() => {
      outputCallback?.({ close: vi.fn() });
    }),
    flush: vi.fn(() => Promise.resolve()),
    close: vi.fn(),
  };
};
