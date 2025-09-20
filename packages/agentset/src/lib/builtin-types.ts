/**
 * A copy of the builtin `EndingType` type as it isn't fully supported in certain
 * environments and attempting to reference the global version will error.
 *
 * https://github.com/microsoft/TypeScript/blob/49ad1a3917a0ea57f5ff248159256e12bb1cb705/src/lib/dom.generated.d.ts#L27941
 */
type EndingType = "native" | "transparent";

/**
 * A copy of the builtin `BlobPropertyBag` type as it isn't fully supported in certain
 * environments and attempting to reference the global version will error.
 *
 * https://github.com/microsoft/TypeScript/blob/49ad1a3917a0ea57f5ff248159256e12bb1cb705/src/lib/dom.generated.d.ts#L154
 * https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob#options
 */
export interface BlobPropertyBag {
  endings?: EndingType;
  type?: string;
}

/**
 * A copy of the builtin `FilePropertyBag` type as it isn't fully supported in certain
 * environments and attempting to reference the global version will error.
 *
 * https://github.com/microsoft/TypeScript/blob/49ad1a3917a0ea57f5ff248159256e12bb1cb705/src/lib/dom.generated.d.ts#L503
 * https://developer.mozilla.org/en-US/docs/Web/API/File/File#options
 */
export interface FilePropertyBag extends BlobPropertyBag {
  lastModified?: number;
}
