export const readImageMeta = (url: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();

    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Couldn't read this image."));
    image.src = url;
  });

export const readVideoMeta = (url: string) =>
  new Promise<{ width: number; height: number; duration: number }>(
    (resolve, reject) => {
      const video = document.createElement("video");
      const fail = () => {
        window.clearTimeout(timer);
        reject(new Error("Couldn't read this video."));
      };
      const timer = window.setTimeout(fail, 8_000);

      video.preload = "metadata";
      video.muted = true;
      video.onloadedmetadata = () => {
        window.clearTimeout(timer);
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        });
      };
      video.onerror = fail;
      video.src = url;
    },
  );
