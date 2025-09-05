import { tg } from "../telegram-web-app";

export default function NotSupportedPage() {
  try {
    tg.MainButton?.hide?.().disable?.();
    tg.SecondaryButton?.hide?.().disable?.();
    tg.BackButton?.hide?.();
  } catch (_) {}
}
