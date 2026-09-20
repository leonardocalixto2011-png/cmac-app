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
}: {
  images: string[];
  name: string;
  tags?: string[];
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (images[0]) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <Image src={images[0]} alt={name} fill priority={priority} className="object-cover" sizes={sizes} />
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
