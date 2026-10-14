import { describe, expect, it, vi } from "vitest";
import { hasDgVerifiedDirectPacketBuilder, inspectDgMobileNativeSurface } from "../lib/dg-mobile-native";
import { exportDgMobileLoadedPublicScripts } from "../lib/dg-mobile-public-source";

const encrypt = (value: string) => value;
const demo = (value: unknown[]) => value;
function nativeConfirmBet(this: any) {
  const betMoneyTmp = this.betMoneyTmp;
  const betMoneyTrue = this.betMoneyTrue;
  const gameNo = this.gameInfo.gameNo;
  const encrypted = encrypt(JSON.stringify({ betMoneyTmp, betMoneyTrue, gameNo }));
  return demo(["BET_CHIP", encrypted]);
}

function card(confirmBet: unknown = nativeConfirmBet) {
  return {
    tableId: "RB01",
    gameInfo: { gameNo: "round-1", stateId: 1 },
    playerInfo: { socketMan: { sendData: vi.fn() } },
    betBtn: { Banker: {}, Player: {} },
    betMan: { confirm() {}, cancel() {} },
    betMoneyTmp: { Banker: 0, Player: 0 },
    betMoneyTrue: { Banker: 0, Player: 0 },
    confirmBet,
  };
}

function stage(...children: unknown[]) {
  return { numChildren: children.length, getChildAt: (index: number) => children[index] };
}

describe("DG mobile native evidence gate", () => {
  it("recognizes only the documented Laya card plus native packet-builder source fingerprint", () => {
    const known = card();
    expect(hasDgVerifiedDirectPacketBuilder(known)).toBe(true);
    expect(inspectDgMobileNativeSurface({ innerWidth: 390, innerHeight: 844, Laya: { stage: stage(known) } }))
      .toEqual({ readiness: "compatible", portrait: true, cardCount: 1, rejectedCardCount: 0 });
  });

  it("fails closed for a visual lookalike or a builder without the original source markers", () => {
    const sent = vi.fn();
    const unverified = card(function () { sent(); });
    expect(hasDgVerifiedDirectPacketBuilder(unverified)).toBe(false);
    expect(inspectDgMobileNativeSurface({ innerWidth: 390, innerHeight: 844, Laya: { stage: stage(unverified) } }))
      .toEqual({ readiness: "unverified-packet-builder", portrait: true, cardCount: 1, rejectedCardCount: 1 });
    expect(sent).not.toHaveBeenCalled();
    expect(inspectDgMobileNativeSurface({ innerWidth: 390, innerHeight: 844, Laya: { stage: stage({ tableId: "RB01" }) } }).readiness)
      .toBe("waiting-multi-table");
  });

  it("waits when a Laya stage has not been loaded", () => {
    expect(inspectDgMobileNativeSurface({ innerWidth: 390, innerHeight: 844 })).toEqual({
      readiness: "waiting-stage", portrait: true, cardCount: 0, rejectedCardCount: 0,
    });
  });
});

describe("DG mobile public source export", () => {
  it("exports only currently loaded external public script paths and strips credentials, queries, and hashes", () => {
    const manifest = exportDgMobileLoadedPublicScripts({
      location: { href: "https://proxy.example/ddnewwap/index.html?token=do-not-export" },
      scripts: [
        { src: "/ddnewwap/assets/app.js?cache=123#top", type: "module" },
        { src: "https://cdn.example/laya.js?session=do-not-export", type: "text/javascript" },
        { src: "https://name:password@static.example/a.js?token=no", type: "" },
        { src: "data:text/javascript,ignored", type: "" },
        { src: "", type: "" },
      ],
    });
    expect(manifest).toEqual({
      version: 1,
      status: "ready",
      scripts: [
        { url: "https://proxy.example/ddnewwap/assets/app.js", type: "module" },
        { url: "https://cdn.example/laya.js", type: "text/javascript" },
        { url: "https://static.example/a.js", type: "" },
      ],
    });
    expect(JSON.stringify(manifest)).not.toMatch(/token|password|cache|#/i);
  });

  it("does not manufacture a source manifest without a readable document URL", () => {
    expect(exportDgMobileLoadedPublicScripts({ scripts: [{ src: "/bundle.js" }] }))
      .toEqual({ version: 1, status: "unavailable", scripts: [] });
  });
});
