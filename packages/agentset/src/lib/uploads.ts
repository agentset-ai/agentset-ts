import type { FilePropertyBag } from "./builtin-types";
import { ReadableStreamFrom } from "./shims";

export type BlobPart = string | ArrayBuffer | ArrayBufferView | Blob | DataView;
type FsReadStream = AsyncIterable<Uint8Array> & {
  path: string | { toString(): string };
};

// https://github.com/oven-sh/bun/issues/5980
interface BunFile extends Blob {
  readonly name?: string | undefined;
}

export const checkFileSupport = () => {
  if (typeof File === "undefined") {
    const { process } = globalThis as any;
    const isOldNode =
      typeof process?.versions?.node === "string" &&
      parseInt(process.versions.node.split(".")) < 20;
    throw new Error(
      "`File` is not defined as a global, which is required for file uploads." +
        (isOldNode
          ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`."
          : ""),
    );
  }
};

export type Uploadable = {
  /**
   * Typically, this is a native "File" class.
   *
   * For convenience, you can also pass a fetch Response, or in Node,
   * the result of fs.createReadStream().
   */
  file: File | FsReadStream | BunFile;

  /**
   * Content type of the file
   * @example "text/plain"
   * @example "application/pdf"
   * @example "image/png"
   * @example "image/jpeg"
   * @example "image/jpg"
   * @example "image/gif"
   */
  contentType: string;
};

/**
 * Construct a `File` instance. This is used to ensure a helpful error is thrown
 * for environments that don't define a global `File` yet.
 */
function makeFile(
  fileBits: BlobPart[],
  fileName: string | undefined,
  options?: FilePropertyBag,
): File {
  checkFileSupport();
  return new File(fileBits as any, fileName ?? "unknown_file", options);
}

function getName(value: any): string | undefined {
  return (
    (
      (typeof value === "object" &&
        value !== null &&
        (("name" in value && value.name && String(value.name)) ||
          ("url" in value && value.url && String(value.url)) ||
          ("filename" in value && value.filename && String(value.filename)) ||
          ("path" in value && value.path && String(value.path)))) ||
      ""
    )
      .split(/[\\/]/)
      .pop() || undefined
  );
}

const isAsyncIterable = (value: any): value is AsyncIterable<any> =>
  value != null &&
  typeof value === "object" &&
  typeof value[Symbol.asyncIterator] === "function";

// We check for Blob not File because Bun.File doesn't inherit from File,
// but they both inherit from Blob and have a `name` property at runtime.
const isNamedBlob = (value: unknown) =>
  value instanceof Blob && "name" in value;

export const getFilePayload = async ({
  file: value,
  contentType,
}: Uploadable): Promise<{
  name: string;
  size: number; // bytes
  data: unknown;
  type: string; // mime type
}> => {
  let file: File | undefined;
  if (isAsyncIterable(value)) {
    file = makeFile(
      [await new Response(ReadableStreamFrom(value)).blob()],
      getName(value),
      {
        type: contentType,
      },
    );
  }

  if (isNamedBlob(value)) {
    file = makeFile([value], getName(value), {
      type: value.type || contentType,
    });
  }

  if (file) {
    return {
      name: file.name,
      size: file.size,
      data: file,
      type: file.type,
    };
  }

  throw new TypeError(
    `Invalid value given to form, expected a File or Blob but got ${value} instead`,
  );
};
