import { useEffect, useRef } from "react";

export default function PhotoPreview({ file, alt }) {
  const imgRef = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    imgRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return <img ref={imgRef} alt={alt} />;
}
