// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureDgMultiHall } from "../lib/dg-auto-multihall";
import { dgFrameMobileProbe, exportDgFrameMobilePublicSources, installDgFramePanel } from "../lib/dg-frame-installer";

const encrypt = (value: string) => value;
const demo = (value: unknown[]) => value;
function nativeConfirmBet(this: any) {
  const betMoneyTmp = this.betMoneyTmp;
  const betMoneyTrue = this.betMoneyTrue;
  const gameNo = this.gameInfo.gameNo;
  return demo(["BET_CHIP", encrypt(JSON.stringify({ betMoneyTmp, betMoneyTrue, gameNo }))]);
}

function stage(...children: unknown[]) {
  return { numChildren: children.length, getChildAt: (index: number) => children[index] };
}

function compatibleCard() {
  return {
    tableId: "RB02", gameInfo: { gameNo: "round-2", stateId: 1 },
    playerInfo: { socketMan: { sendData() {} } }, betBtn: { Banker: {}, Player: {} },
    betMan: { confirm: {event() {}}, cancel: {event() {}} }, betMoneyTmp: { Banker: 0, Player: 0 },
    betMoneyTrue: { Banker: 0, Player: 0 }, confirmBet: nativeConfirmBet,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("DG Mobile native installer", () => {
  it("waits instead of clicking the desktop MultiLobby navigation on unverified Mobile scenes", () => {
    vi.stubGlobal("window", { location: { origin: "https://app.example" } });
    const click = vi.fn();
    const controller = {
      currentView: { viewName: "GameLobby" }, playerInfo: { layout: 0 },
      gameLeftMan: { classicBtnArr: [{ buttonName: "MultiLobby", gameId: 0, event: click }], hotBtnArr: [] },
    };
    const frame: any = {
      contentWindow: { innerWidth: 390, innerHeight: 844, Laya: { stage: stage(controller) } },
      contentDocument: { location: { origin: "https://app.example" } },
    };
    expect(ensureDgMultiHall(frame, "mobile")).toBe("waiting");
    expect(click).not.toHaveBeenCalled();
    expect(installDgFramePanel(frame, "mobile")).toBe("waiting");
  });

  it("keeps the default desktop path independent of the new Mobile builder gate", () => {
    vi.stubGlobal("window", { location: { origin: "https://app.example" } });
    const click = vi.fn();
    const controller = {
      currentView: { viewName: "GameLobby" }, playerInfo: { layout: 0 },
      gameLeftMan: { classicBtnArr: [{ buttonName: "MultiLobby", gameId: 0, event: click }], hotBtnArr: [] },
    };
    const frame: any = {
      contentWindow: { innerWidth: 390, innerHeight: 844, Laya: { stage: stage(controller) } },
      contentDocument: { location: { origin: "https://app.example" } },
    };
    expect(ensureDgMultiHall(frame)).toBe("requested");
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("permits existing-console installation only when the live mobile Laya card proves the PC builder fingerprint", () => {
    vi.stubGlobal("window", { location: { origin: "https://app.example" } });
    const win: any = { innerWidth: 390, innerHeight: 844, Laya: { stage: stage(compatibleCard()) } };
    const doc: any = {
      location: { origin: "https://app.example", href: "https://app.example/ddnewwap/index.html?token=hidden" },
      scripts: [{ src: "/ddnewwap/app.js?cache=secret", type: "module" }],
      createElement: () => ({ remove() {} }),
      documentElement: { appendChild() { win.__DG_SINGLEPAGE__ = {}; } },
    };
    const frame: any = { contentWindow: win, contentDocument: doc };
    expect(dgFrameMobileProbe(frame)).toMatchObject({ readiness: "compatible", portrait: true, cardCount: 1 });
    expect(ensureDgMultiHall(frame, "mobile")).toBe("ready");
    expect(exportDgFrameMobilePublicSources(frame)).toEqual({ version: 1, status: "ready", scripts: [{ url: "https://app.example/ddnewwap/app.js", type: "module" }] });
    expect(installDgFramePanel(frame, "mobile")).toBe("installed");
  });

  it("blocks installation if a same-shaped card has an unknown native packet builder", () => {
    vi.stubGlobal("window", { location: { origin: "https://app.example" } });
    const unknown = compatibleCard();
    unknown.confirmBet = (() => undefined) as unknown as typeof nativeConfirmBet;
    const frame: any = {
      contentWindow: { innerWidth: 390, innerHeight: 844, Laya: { stage: stage(unknown) } },
      contentDocument: { location: { origin: "https://app.example" }, createElement() { throw new Error("must not inject"); } },
    };
    expect(ensureDgMultiHall(frame, "mobile")).toBe("unavailable");
    expect(installDgFramePanel(frame, "mobile")).toBe("blocked");
  });
  it("recognizes native GoodRoad cards even without a MultiLobby viewName", () => {
    vi.stubGlobal("window", { location: { origin: "https://app.example" } });
    const card=compatibleCard(), click=vi.fn();
    const frame:any={contentWindow:{Laya:{stage:stage(card)}},contentDocument:{location:{origin:"https://app.example"}}};
    expect(ensureDgMultiHall(frame,"desktop")).toBe("ready");
    expect(click).not.toHaveBeenCalled();
  });
  it("checks controllers before deep road glyphs exhaust the traversal budget", () => {
    vi.stubGlobal("window", { location: { origin: "https://app.example" } });
    const click=vi.fn(), controller={currentView:{viewName:"GameLobby"},playerInfo:{layout:0},gameLeftMan:{classicBtnArr:[{buttonName:"MultiLobby",gameId:0,event:click}]}};
    let road:any=stage();for(let i=0;i<13000;i++)road=stage(road);
    const frame:any={contentWindow:{Laya:{stage:stage(controller,road)}},contentDocument:{location:{origin:"https://app.example"}}};
    expect(ensureDgMultiHall(frame,"desktop")).toBe("requested");
    expect(click).toHaveBeenCalledTimes(1);
  });

});
