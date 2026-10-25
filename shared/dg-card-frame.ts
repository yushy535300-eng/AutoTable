export type DgCardTable = {
  tableId: number;
  shoeId?: number;
  playId?: number;
  state?: number;
  poker?: string;
};

export type DgCardFrame = {
  cmd: number;
  codeId: number;
  table: DgCardTable[];
};

/**
 * Decodes only the safe subset of DG's PublicBean protobuf:
 * PublicBean.cmd (1), codeId (3), and Table[] (17); Table.tableId (1),
 * shoeId (2), playId (3), state (4), poker (7).
 *
 * This intentionally has no external dependencies: its runtime .toString()
 * is embedded in the same-origin page bridge.
 */
export function decodeDgCardFrame(value: ArrayBuffer | ArrayBufferView): DgCardFrame | null {
  const MAX_SAFE = Number.MAX_SAFE_INTEGER;
  const MAX_UINT32 = 0xffffffff;
  const INT32_SIGN = 0x80000000;
  const INT32_MODULO = 0x100000000;

  type Cursor = { pos: number };
  type PartialTable = Partial<DgCardTable>;

  function own(object: object, key: string) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function readVarint(bytes: Uint8Array, cursor: Cursor, end: number): number | null {
    let result = 0;
    let multiplier = 1;
    for (let index = 0; index < 8; index += 1) {
      if (cursor.pos >= end) return null;
      const byte = bytes[cursor.pos++];
      const payload = byte & 0x7f;
      // A JavaScript safe integer has at most 53 significant bits. The eighth
      // protobuf byte may therefore use only its low five bits.
      if (index === 7 && payload > 0x1f) return null;
      const addend = payload * multiplier;
      if (addend > MAX_SAFE - result) return null;
      result += addend;
      if ((byte & 0x80) === 0) return result;
      multiplier *= 128;
    }
    // More than eight bytes cannot be a canonical, safe JavaScript integer.
    return null;
  }

  function readLength(bytes: Uint8Array, cursor: Cursor, end: number): Uint8Array | null {
    const length = readVarint(bytes, cursor, end);
    if (length === null || length > end - cursor.pos) return null;
    const start = cursor.pos;
    cursor.pos += length;
    return bytes.subarray(start, cursor.pos);
  }

  function skipField(bytes: Uint8Array, cursor: Cursor, end: number, wire: number): boolean {
    if (wire === 0) return readVarint(bytes, cursor, end) !== null;
    if (wire === 1) {
      if (end - cursor.pos < 8) return false;
      cursor.pos += 8;
      return true;
    }
    if (wire === 2) return readLength(bytes, cursor, end) !== null;
    if (wire === 5) {
      if (end - cursor.pos < 4) return false;
      cursor.pos += 4;
      return true;
    }
    // Groups (3/4) are deliberately rejected: they are not used by this proto
    // and cannot be skipped without maintaining nested group state.
    return false;
  }

  function int32(raw: number): number | null {
    if (raw > MAX_UINT32) return null;
    return raw >= INT32_SIGN ? raw - INT32_MODULO : raw;
  }

  function utf8(bytes: Uint8Array): string | null {
    try {
      if (typeof TextDecoder !== "function") return null;
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      return null;
    }
  }

  function sanitizedSide(value: unknown): string | null {
    if (typeof value !== "string" || value.length === 0 || value.length > 96) return null;
    const parts = value.split("-");
    if (parts.length < 2 || parts.length > 3) return null;

    const numeric = parts.every((part) => /^(?:0|[1-9]\d*)$/.test(part));
    if (numeric) {
      let cards = 0;
      let sawPadding = false;
      for (const part of parts) {
        const card = Number(part);
        if (!Number.isSafeInteger(card)) return null;
        if (card === 0) {
          sawPadding = true;
          continue;
        }
        if (sawPadding || card < 1 || card > 52) return null;
        cards += 1;
      }
      // Numeric DG card ids are two or three cards; zero only pads a three-slot
      // native representation such as 12-22-0.
      if (cards < 2 || cards > 3) return null;
      return parts.join("-");
    }

    // The rest of the application also consumes DG-compatible rank labels.
    // They have no padding and must represent two or three actual cards.
    if (!parts.every((part) => /^(?:A|[2-9]|10|J|Q|K)$/.test(part))) return null;
    return parts.join("-");
  }

  function sanitizePoker(raw: string): string | undefined {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
      const record = parsed as Record<string, unknown>;
      if (!own(record, "player") || !own(record, "banker")) return undefined;
      const player = sanitizedSide(record.player);
      const banker = sanitizedSide(record.banker);
      if (!player || !banker) return undefined;
      // Rebuild the JSON from the two approved fields, dropping all unknown data.
      return JSON.stringify({ player, banker });
    } catch {
      return undefined;
    }
  }

  function parseTable(bytes: Uint8Array, start: number, end: number): PartialTable | null {
    const cursor: Cursor = { pos: start };
    const table: PartialTable = {};
    while (cursor.pos < end) {
      const tag = readVarint(bytes, cursor, end);
      if (tag === null) return null;
      const field = Math.floor(tag / 8);
      const wire = tag % 8;
      if (field === 0) return null;

      if (field === 1 || field === 2 || field === 3 || field === 4) {
        if (wire !== 0) return null;
        const raw = readVarint(bytes, cursor, end);
        if (raw === null) return null;
        if (field === 1) {
          if (raw > MAX_UINT32) return null;
          table.tableId = raw;
        } else if (field === 2) {
          table.shoeId = raw;
        } else if (field === 3) {
          table.playId = raw;
        } else {
          const state = int32(raw);
          if (state === null) return null;
          table.state = state;
        }
        continue;
      }

      if (field === 7) {
        if (wire !== 2) return null;
        const pokerBytes = readLength(bytes, cursor, end);
        if (pokerBytes === null) return null;
        const pokerRaw = utf8(pokerBytes);
        if (pokerRaw === null) return null;
        const poker = sanitizePoker(pokerRaw);
        if (poker !== undefined) table.poker = poker;
        continue;
      }

      if (!skipField(bytes, cursor, end, wire)) return null;
    }
    return cursor.pos === end ? table : null;
  }

  try {
    let bytes: Uint8Array;
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
      bytes = new Uint8Array(value);
    } else if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value)) {
      const view = value as ArrayBufferView;
      bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    } else {
      return null;
    }

    const cursor: Cursor = { pos: 0 };
    let cmd: number | undefined;
    let codeId = 0;
    const table: DgCardTable[] = [];

    while (cursor.pos < bytes.length) {
      const tag = readVarint(bytes, cursor, bytes.length);
      if (tag === null) return null;
      const field = Math.floor(tag / 8);
      const wire = tag % 8;
      if (field === 0) return null;

      if (field === 1 || field === 3) {
        if (wire !== 0) return null;
        const raw = readVarint(bytes, cursor, bytes.length);
        const number = raw === null ? null : int32(raw);
        if (number === null) return null;
        if (field === 1) cmd = number;
        else codeId = number;
        continue;
      }

      if (field === 17) {
        if (wire !== 2) return null;
        const encodedTable = readLength(bytes, cursor, bytes.length);
        if (encodedTable === null) return null;
        const decodedTable = parseTable(encodedTable, 0, encodedTable.length);
        if (decodedTable === null) return null;
        // Table.tableId is optional on the wire, but a row without it cannot be
        // safely assigned to a room and is therefore not returned.
        if (decodedTable.tableId !== undefined) table.push(decodedTable as DgCardTable);
        continue;
      }

      if (!skipField(bytes, cursor, bytes.length, wire)) return null;
    }

    if (cmd === undefined) return null;
    return { cmd, codeId, table };
  } catch {
    return null;
  }
}
