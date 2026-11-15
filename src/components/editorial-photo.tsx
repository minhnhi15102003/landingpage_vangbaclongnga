import Image from "next/image";
import type { Photo } from "@/lib/content-schema";
import { photoVariables } from "@/lib/photo-layout";

export default function EditorialPhoto({ photo, mobilePhoto, className = "", sizes, priority = false }: {
  photo: Photo; mobilePhoto?: Photo; className?: string; sizes: string; priority?: boolean;
}) {
  // Native WebP sources retain sufficient height for tall cover crops.
  return <div className={`ln-photo ${mobilePhoto ? "ln-photo-responsive" : ""} ${className}`} style={{ ...photoVariables(photo), ...(mobilePhoto ? photoVariables(mobilePhoto, "mobile-photo") : {}) }}><picture>
    {mobilePhoto && <source media="(max-width: 600px)" srcSet={mobilePhoto.src} />}
    <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} unoptimized />
  </picture></div>;
}
