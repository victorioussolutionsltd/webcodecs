export const changeFrameRate = async ({
  stream,
  fps,
}: {
  stream: MediaStream;
  fps: number;
}) => {
  const track = stream.getVideoTracks()[0];
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
