/// <reference types="nativewind/types" />

declare const __DEV__: boolean;

declare module '*.css';

declare module '*.svg' {
  const source: number;
  export default source;
}
