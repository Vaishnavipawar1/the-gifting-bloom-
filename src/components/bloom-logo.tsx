export const bloomLogoUrl = "/the-gifting-bloom-logo.png";

export function BloomLogo({ src, className }: { src?: string | undefined; className?: string }) {
  return (
    <img
      className={className ? "bloom-logo " + className : "bloom-logo"}
      src={src || bloomLogoUrl}
      alt=""
      width={48}
      height={48}
    />
  );
}
