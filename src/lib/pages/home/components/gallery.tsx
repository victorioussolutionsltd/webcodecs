import React from 'react';

type GalleryProps = {
  images: Array<string>;
  galleryRef: React.RefObject<HTMLDivElement | null>;
};

export const Gallery = ({ images, galleryRef }: GalleryProps) => {
  const [previewIdx, setPreviewIdx] = React.useState<number | null>(null);

  return (
    <>
      {images.length > 0 && (
        <div ref={galleryRef} className="flex flex-wrap gap-2 mt-4 w-[80vh]">
          {images.map((src, idx) => (
            <button
              type="button"
              key={src}
              className="p-0 border-none bg-none cursor-pointer"
              onClick={() => setPreviewIdx(idx)}
              tabIndex={0}
              aria-label={`Preview frame ${idx + 1}`}
            >
              <h2 className="text-white text-2xl font-bold">Frame {idx + 1}</h2>
              <img
                src={src}
                alt={`Frame ${idx + 1}`}
                className="max-w-[15vh] min-h-[20vh] aspect-auto border border-gray-400 block"
              />
            </button>
          ))}
        </div>
      )}
      {previewIdx !== null && images.length > 0 && (
        <dialog
          open
          className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex items-center justify-center z-[1000] border-none p-0 m-0"
        >
          <button
            type="button"
            onClick={() => setPreviewIdx(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setPreviewIdx(null);
              }
            }}
            className="absolute top-6 right-6 bg-white text-gray-800 border-none rounded px-4 py-2 cursor-pointer text-lg z-[1001]"
            aria-label="Close preview"
          >
            Close
          </button>
          <img
            src={images[previewIdx]}
            alt={`Frame ${previewIdx + 1}`}
            className="max-w-[54vh] min-h-[72vh] aspect-auto border-4 border-white shadow-2xl bg-gray-900 block"
          />
        </dialog>
      )}
    </>
  );
};
