export const changeFrameRate = async ({
  stream,
  fps,
}: {
  stream: MediaStream | undefined;
  fps: number;
}) => {
  if (!stream) {
    return;
  }
  const tracks = stream.getVideoTracks?.();
  if (!tracks || tracks.length === 0) {
    return;
  }
  const track = tracks[0];
  if (!track?.applyConstraints) {
    return;
  }
  try {
    await track.applyConstraints({
      frameRate: { ideal: fps, max: fps },
    });
    // Removed console.log statements for Biome compliance
  } catch (err) {
    // Keeping error logging for debugging
    console.error('Could not change frame rate:', err);
  }
};
