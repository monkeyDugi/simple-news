import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn 표준 헬퍼. 동적 클래스명 + 충돌 해소를 한 번에.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
