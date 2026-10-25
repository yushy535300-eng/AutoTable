// @vitest-environment node
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { DG_CARD_BRIDGE_SCRIPT } from "../server/dg-card-bridge";
import { decodeDgCardFrame } from "../shared/dg-card-frame";

const require = createRequire(import.meta.url);
const protobuf: any = require("../public/dg-vendor/protobuf.js");
const proto = protobuf.parse(readFileSync(join(process.cwd(), "public/dg-vendor/PublicBeanProto.proto"), "utf8")).root;
const PublicBean = proto.lookupType("PublicBean");

function frame(value: Record<string, unknown>) {
  return PublicBean.encode(PublicBean.create(value)).finish();
}

function buffer(value: Uint8Array) {
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
}

function bridge() {
  let now = 1_000;
  class ClockDate extends Date {
    static now() { return now; }
  }
  const window: Record<string, unknown> = {};
  const context: Record<string, unknown> = {
    window,
    ArrayBuffer,
    Uint8Array,
    TextDecoder,
    Date: ClockDate,
    Map,
    Object,
    Number,
    Array,
    JSON,
  };
  runInNewContext(`${DG_CARD_BRIDGE_SCRIPT}\nglobalThis.__receive=__dgCardReceive;`, context);
  return {
    feed: window.__AUTOBAC_DG_CARD_FEED__ as {
      subscribe: (fn: (value: any) => void) => () => void;
      snapshot: () => any;
    },
    receive: context.__receive as (value: ArrayBuffer) => unknown,
    advance: (milliseconds: number) => { now += milliseconds; },
  };
}

const verifiedPoker = JSON.stringify({
  player: "12-22-0",
  banker: "27-24-0",
  token: "EMBEDDED-SECRET",
  cookie: "EMBEDDED-COOKIE",
  gameNo: "must-not-escape",
});

describe("DG PublicBean card frame decoder", () => {
  it("decodes the evidenced native state-5 record and strips token/cookie and all unrelated proto fields", () => {
    const encoded = frame({
      cmd: 207,
      codeId: 0,
      token: "TOP-LEVEL-TOKEN",
      userName: "not-returned",
      object: "not-returned",
      list: ["not-returned"],
      table: [{
        tableId: 60104,
        shoeId: 13,
        playId: 45,
        state: 5,
        poker: verifiedPoker,
        gameNo: "not-returned",
        tel: ["not-returned"],
        ext: ["not-returned"],
      }],
    });

    const decoded = decodeDgCardFrame(buffer(encoded));
    expect(decoded).toEqual({
      cmd: 207,
      codeId: 0,
      table: [{
        tableId: 60104,
        shoeId: 13,
        playId: 45,
        state: 5,
        poker: JSON.stringify({ player: "12-22-0", banker: "27-24-0" }),
      }],
    });
    expect(JSON.stringify(decoded)).not.toMatch(/token|cookie|secret|gameNo|userName|list/i);
  });

  it("preserves zero as an actual shoe id and does not invent a missing shoe id", () => {
    const zeroShoe = decodeDgCardFrame(buffer(frame({
      cmd: 208,
      table: [{ tableId: 50104, shoeId: 0, playId: 18, state: 5, poker: verifiedPoker }],
    })));
    expect(zeroShoe?.table[0]).toMatchObject({ tableId: 50104, shoeId: 0, playId: 18, state: 5 });
    expect(Object.prototype.hasOwnProperty.call(zeroShoe?.table[0] ?? {}, "shoeId")).toBe(true);

    const partial = decodeDgCardFrame(buffer(frame({
      cmd: 208,
      table: [{ tableId: 50102, playId: 28, state: 5, poker: verifiedPoker }],
    })));
    expect(partial?.table[0]).toEqual({
      tableId: 50102,
      playId: 28,
      state: 5,
      poker: JSON.stringify({ player: "12-22-0", banker: "27-24-0" }),
    });
    expect(Object.prototype.hasOwnProperty.call(partial?.table[0] ?? {}, "shoeId")).toBe(false);
  });

  it("decodes an offset ArrayBuffer view without reading its surrounding bytes", () => {
    const encoded = frame({ cmd: 208, table: [{ tableId: 50104, shoeId: 0, playId: 18, state: 5, poker: verifiedPoker }] });
    const padded = new Uint8Array(encoded.byteLength + 6);
    padded.set([0xff, 0xff, 0xff], 0);
    padded.set(encoded, 3);
    const view = new DataView(padded.buffer, 3, encoded.byteLength);
    expect(decodeDgCardFrame(view)).toEqual({
      cmd: 208,
      codeId: 0,
      table: [{ tableId: 50104, shoeId: 0, playId: 18, state: 5, poker: JSON.stringify({ player: "12-22-0", banker: "27-24-0" }) }],
    });
  });

  it("fails closed for truncated, unsafe or malformed values and never returns a partial frame", () => {
    // cmd=207 followed by a Table field whose announced length exceeds the bytes left.
    expect(decodeDgCardFrame(new Uint8Array([0x08, 0xcf, 0x01, 0x8a, 0x01, 0x05, 0x08]).buffer)).toBeNull();
    // An eight-byte varint whose high payload exceeds the 53-bit safe-integer bound.
    expect(decodeDgCardFrame(new Uint8Array([0x08, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x02]).buffer)).toBeNull();
    // PublicBean.cmd with an invalid wire type is not a valid card frame.
    expect(decodeDgCardFrame(new Uint8Array([0x0a, 0x00]).buffer)).toBeNull();
  });

  it("omits malformed poker rather than logging it or treating it as a usable hand", () => {
    const decoded = decodeDgCardFrame(buffer(frame({
      cmd: 208,
      table: [{ tableId: 60103, shoeId: 13, playId: 18, state: 5, poker: '{"player":"0-0-0","banker":"26-9-0"}' }],
    })));
    expect(decoded).toEqual({ cmd: 208, codeId: 0, table: [{ tableId: 60103, shoeId: 13, playId: 18, state: 5 }] });
  });
});

describe("DG card feed bridge", () => {
  it("contains no transport creation or network request and only receives existing mirrored buffers", () => {
    expect(DG_CARD_BRIDGE_SCRIPT).toContain("function __dgCardReceive(value)");
    expect(DG_CARD_BRIDGE_SCRIPT).not.toMatch(/WebSocket|NativeWS|fetch\s*\(|XMLHttpRequest|setTimeout|setInterval|session/i);
  });

  it("replays a last state-5 candidate before fresh metadata, without carrying stale poker into metadata", () => {
    const runtime = bridge();
    const first: any[] = [];
    const unsubscribe = runtime.feed.subscribe((packet) => first.push(packet));
    expect(first).toEqual([{ cmd: 0, codeId: 0, table: [] }]);

    runtime.receive(buffer(frame({ cmd: 208, codeId: 0, table: [{ tableId: 60104, shoeId: 13, playId: 45, state: 5, poker: verifiedPoker }] })));
    runtime.receive(buffer(frame({ cmd: 208, codeId: 0, table: [{ tableId: 60104, shoeId: 13, playId: 46, state: 1 }] })));

    const replay: any[] = [];
    runtime.feed.subscribe((packet) => replay.push(packet));
    expect(replay[0]).toEqual({
      cmd: 0,
      codeId: 0,
      table: [
        { tableId: 60104, shoeId: 13, playId: 45, state: 5, poker: JSON.stringify({ player: "12-22-0", banker: "27-24-0" }) },
        { tableId: 60104, shoeId: 13, playId: 46, state: 1 },
      ],
    });
    expect(JSON.stringify(replay[0].table[1])).not.toContain("poker");

    unsubscribe();
    const before = first.length;
    runtime.receive(buffer(frame({ cmd: 208, table: [{ tableId: 60104, shoeId: 13, playId: 47, state: 1 }] })));
    expect(first).toHaveLength(before);
    expect(replay).toHaveLength(2);
  });

  it("retains each table's latest candidate and metadata after more than twenty minutes", () => {
    const runtime = bridge();
    runtime.receive(buffer(frame({ cmd: 208, table: [{ tableId: 60104, shoeId: 13, playId: 45, state: 5, poker: verifiedPoker }] })));
    runtime.receive(buffer(frame({ cmd: 208, table: [{ tableId: 60104, shoeId: 13, playId: 46, state: 1 }] })));
    runtime.advance(20 * 60 * 1000 + 1);
    expect(runtime.feed.snapshot()).toEqual({
      cmd: 0,
      codeId: 0,
      table: [
        { tableId: 60104, shoeId: 13, playId: 45, state: 5, poker: JSON.stringify({ player: "12-22-0", banker: "27-24-0" }) },
        { tableId: 60104, shoeId: 13, playId: 46, state: 1 },
      ],
    });
  });

  it("accepts a complete previous hand arriving after the next opening metadata", () => {
    const runtime=bridge();
    runtime.receive(buffer(frame({cmd:208,table:[{tableId:60104,shoeId:13,playId:46,state:1}]})));
    expect(runtime.receive(buffer(frame({cmd:208,table:[{tableId:60104,shoeId:13,playId:45,state:5,poker:verifiedPoker}]})))).not.toBeNull();
    const rows=runtime.feed.snapshot().table;
    expect(rows[0]).toMatchObject({playId:45,poker:JSON.stringify({player:"12-22-0",banker:"27-24-0"})});
    expect(rows[rows.length-1]).toMatchObject({playId:46,state:1});
  });

  it("retains conflicting previous-round candidates without downgrading current native metadata", () => {
    const runtime = bridge();
    runtime.receive(buffer(frame({cmd:208,table:[{tableId:60104,shoeId:13,playId:45,state:5,poker:verifiedPoker}]})));
    runtime.receive(buffer(frame({cmd:208,table:[{tableId:60104,shoeId:13,playId:46,state:1}]})));
    const other=JSON.stringify({player:"49-20-0",banker:"27-4-50"});
    expect(runtime.receive(buffer(frame({cmd:208,table:[{tableId:60104,shoeId:13,playId:45,state:5,poker:other}]})))).not.toBeNull();
    const rows=runtime.feed.snapshot().table;
    expect(rows.filter((r:any)=>r.poker)).toHaveLength(2);
    expect(rows[rows.length-1]).toMatchObject({shoeId:13,playId:46,state:1});
  });

  it("does not emit or change cache for malformed binary or a non-zero codeId response", () => {
    const runtime = bridge();
    const packets: any[] = [];
    runtime.feed.subscribe((packet) => packets.push(packet));
    runtime.receive(buffer(frame({ cmd: 208, table: [{ tableId: 50104, shoeId: 0, playId: 18, state: 5, poker: verifiedPoker }] })));
    const beforePackets = packets.length;
    const beforeSnapshot = runtime.feed.snapshot();

    expect(runtime.receive(new Uint8Array([0x08, 0xcf, 0x01, 0x8a, 0x01, 0x05, 0x08]).buffer)).toBeNull();
    expect(runtime.receive(buffer(frame({
      cmd: 208,
      codeId: 9,
      table: [{ tableId: 99999, shoeId: 13, playId: 1, state: 5, poker: verifiedPoker }],
    })))).toBeNull();

    expect(packets).toHaveLength(beforePackets);
    expect(runtime.feed.snapshot()).toEqual(beforeSnapshot);
  });

  it("keeps cache bounded across many rounds and clears the old state-5 candidate on an explicit zero-to-13 shoe change", () => {
    const runtime = bridge();
    for (let playId = 1; playId <= 300; playId += 1) {
      runtime.receive(buffer(frame({
        cmd: 208,
        table: [{ tableId: 50104, shoeId: 0, playId, state: 5, poker: verifiedPoker }],
      })));
    }
    const manyRounds = runtime.feed.snapshot();
    expect(manyRounds.table).toEqual([
      { tableId: 50104, shoeId: 0, playId: 300, state: 5, poker: JSON.stringify({ player: "12-22-0", banker: "27-24-0" }) },
      { tableId: 50104, shoeId: 0, playId: 300, state: 5 },
    ]);

    runtime.receive(buffer(frame({ cmd: 208, table: [{ tableId: 50104, shoeId: 13, playId: 1, state: 1 }] })));
    expect(runtime.feed.snapshot()).toEqual({
      cmd: 0,
      codeId: 0,
      table: [{ tableId: 50104, shoeId: 13, playId: 1, state: 1 }],
    });
  });

  it("caps independently cached rooms at 256 and does not emit a backward same-shoe record", () => {
    const runtime = bridge();
    for (let tableId = 1; tableId <= 300; tableId += 1) {
      runtime.receive(buffer(frame({ cmd: 208, table: [{ tableId, shoeId: 13, playId: tableId, state: 1 }] })));
    }
    expect(runtime.feed.snapshot().table).toHaveLength(256);

    const received: any[] = [];
    runtime.feed.subscribe((packet) => received.push(packet));
    const count = received.length;
    runtime.receive(buffer(frame({ cmd: 208, table: [{ tableId: 300, shoeId: 13, playId: 1, state: 1 }] })));
    expect(received).toHaveLength(count);
  });
});
