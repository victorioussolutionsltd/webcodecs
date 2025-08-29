// Utility functions for video frame capture, encoding, and decoding

export async function captureAndEncodeFrames(
  videoTrack: MediaStreamTrack,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  encoder: VideoEncoder,
  recordingFlag: React.RefObject<boolean>,
  maxFrames: number,
) {
  // Use unknown for type safety
  const ProcessorCtor = (
    window as unknown as {
      MediaStreamTrackProcessor: new (
        track: MediaStreamTrack,
      ) => { readable: ReadableStream<VideoFrame> };
    }
  ).MediaStreamTrackProcessor;
  const processor = new ProcessorCtor(videoTrack);
  const reader = processor.readable.getReader();
  let frameCount = 0;
  while (frameCount < maxFrames && recordingFlag.current) {
    const { value: videoFrame, done } = await reader.read();
    if (done || !videoFrame) {
      break;
    }
    ctx.drawImage(videoFrame, 0, 0, canvas.width, canvas.height);
    encoder?.encode(
      new window.VideoFrame(canvas, { timestamp: videoFrame.timestamp }),
      { keyFrame: frameCount === 0 },
    );
    videoFrame.close();
    frameCount++;
  }
  recordingFlag.current = false;
}

export async function decodeFramesToImages(
  frames: Array<EncodedVideoChunk>,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
): Promise<Array<string>> {
  const decoded: Array<string> = [];
  const decoder = new window.VideoDecoder({
    output: (videoFrame: VideoFrame) => {
      ctx.drawImage(videoFrame, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      decoded.push(dataUrl);
      videoFrame.close();
    },
    error: (error: unknown) => {
      console.error('decode error', error);
    },
  });
  decoder.configure({ codec: 'vp8' });
  for (const chunk of frames) {
    decoder.decode(chunk);
  }
  await decoder.flush();
  decoder.close();
  return decoded;
}
