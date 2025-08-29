import { describe, expect, it, vi } from 'vitest';

import { changeFrameRate } from './stream';

describe('changeFrameRate', () => {
  it('does nothing if stream is undefined', () => {
    expect(() =>
      changeFrameRate({ stream: undefined as unknown as MediaStream, fps: 30 }),
    ).not.toThrow();
  });

  it('sets frameRate on video tracks', () => {
    const applyConstraints = vi.fn();
    const videoTrack = { kind: 'video', applyConstraints };
    const stream = {
      getVideoTracks: () => [videoTrack],
    } as unknown as MediaStream;
    changeFrameRate({ stream, fps: 15 });
    expect(applyConstraints).toHaveBeenCalledWith({
      frameRate: { ideal: 15, max: 15 },
    });
  });

  it('does not set frameRate if no video tracks', () => {
    const applyConstraints = vi.fn();
    // getVideoTracks returns empty array, so no track to call
    const stream = { getVideoTracks: () => [] } as unknown as MediaStream;
    expect(() => changeFrameRate({ stream, fps: 10 })).not.toThrow();
    expect(applyConstraints).not.toHaveBeenCalled();
  });
});
