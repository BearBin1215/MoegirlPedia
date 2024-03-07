import type { Options } from 'html2canvas';

declare global {
  interface Window {
    html2canvas: (element: HTMLElement, options?: Options) => Promise<HTMLCanvasElement>;
  }
}
