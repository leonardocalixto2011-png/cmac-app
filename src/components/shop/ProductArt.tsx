import Image from "next/image";
import { cn } from "@/lib/utils";

function tone(tags: string[]) {
  if (tags.includes("glow")) return "product-art--glow";
  if (tags.includes("sculpt")) return "product-art--sculpt";
  if (tags.includes("cool")) return "product-art--cool";
  return "product-art--default";
}

/**
 * Product image, or a branded gradient placeholder with the product name.
 * PLACEHOLDER: real photos come from the supplier listing — paste their URLs in
 * /admin/products › Images.
 */
export function ProductArt({
  images,
  name,
  tags = [],
  className = "",
  sizes = "(max-width: 700px) 100vw, 480px",
  priority = false,
  hoverImage,
  fit = "cover",
}: {
  images: string[];
  name: string;
  tags?: string[];
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Optional second photo, cross-faded in on card hover (see .product-art__hover). */
  hoverImage?: string;
  /** "contain" shows the whole photo (product page), "cover" fills the frame, "tile" = contain with a
   *  margin and multiply blending so a supplier's white background melts into the tile colour (grids). */
  fit?: "cover" | "contain" | "tile";
}) {
  if (images[0]) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <Image
          src={images[0]}
          alt={name}
          fill
          priority={priority}
          className={fit === "contain" ? "object-contain" : fit === "tile" ? "product-art__tile" : "object-cover"}
          sizes={sizes}
        />
        {hoverImage && hoverImage !== images[0] && (
          <Image src={hoverImage} alt="" aria-hidden="true" fill className={fit === "tile" ? "product-art__hover product-art__tile" : "product-art__hover object-cover"} sizes={sizes} />
        )}
      </div>
    );
  }
  return (
    <div className={cn("product-art", tone(tags), className)} role="img" aria-label={name}>
      <span className="product-art__shape" aria-hidden="true" />
      <span className="product-art__name">{name}</span>
      <span className="product-art__mark" aria-hidden="true">
        CMAC Beauty
      </span>
    </div>
  );
}
