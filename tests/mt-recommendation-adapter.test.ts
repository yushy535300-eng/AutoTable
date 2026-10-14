import { describe, expect, it } from "vitest";

import { localProviderDecision } from "../lib/dg-original-ai";
import {
  createMtRecommendationAdapter,
  type Result,
} from "../lib/mt-recommendation-adapter";

const NOW = 1_800_000_000_000;
const ROAD: Result[] = ["莊", "閒", "莊"];

type LiveOptions = {
  id?: string;
  name?: string;
  shoe?: string;
  round?: number;
  results?: Result[];
  rawRoad?: unknown;
  verified?: boolean;
  phase?: string;
  at?: number;
  count?: number | null;
  snapshotGameSn?: string;
  clockGameSn?: string;
  last?: unknown;
};

function live(options: LiveOptions = {}) {
  const id = options.id ?? "BAV03";
  const shoe = options.shoe ?? "1150";
  const round = options.round ?? 4;
  const results = options.results ?? ROAD;
  return {
    tableId: id,
    name: options.name ?? "B03",
    snapshot: {
      at: NOW - 10,
      shoe,
      round,
      gameSn: options.snapshotGameSn ?? `${id}-SN`,
      rawRoad: options.rawRoad === undefined ? "010201" : options.rawRoad,
      results,
      roadVerifiedAgainstTotals: options.verified ?? true,
    },
    clock: {
      at: options.at ?? NOW - 100,
      phase: options.phase ?? "wait",
      shoe,
      round,
      gameSn: options.clockGameSn ?? options.snapshotGameSn ?? `${id}-SN`,
      count: options.count === undefined ? 10 : options.count,
    },
    lastTableResult: options.last,
  };
}

function report(
  tables: unknown[],
  viewport: {
    tableId?: string | null;
    candidateIds?: string[];
    name?: string;
  } = {},
) {
  return {
    liveTables: tables,
    tableViewport: {
      tables: [
        {
          name: viewport.name ?? "B03",
          tableId: viewport.tableId ?? null,
          candidateIds: viewport.candidateIds ?? ["BAV03"],
          betAreaPresent: true,
          identitySource: viewport.tableId ? "native" : "candidate",
        },
      ],
    },
  };
}

function mustSucceed(
  value: ReturnType<
    ReturnType<typeof createMtRecommendationAdapter>["preview"]
  >,
) {
  expect(value.ok).toBe(true);
  if (!value.ok) throw new Error(value.reason);
  return value;
}

describe("MT recommendation adapter", () => {
  it("uses a confirmed native ID only and delegates direction/confidence to the existing local formula", () => {
    const adapter = createMtRecommendationAdapter();
    const results: Result[] = ["莊", "閒", "莊", "莊", "和", "莊"];
    const exact = live({ id: "BAV03", results, round: 7, count: 10 });
    const conflictingLive = live({
      id: "BAV03_LIVE",
      results: ["閒", "閒", "閒", "莊", "閒", "莊"],
      round: 7,
      count: 9,
    });

    const recommendation = mustSucceed(
      adapter.preview(
        report([exact, conflictingLive], {
          tableId: "BAV03",
          candidateIds: ["BAV03", "BAV03_LIVE"],
        }),
        "B03",
        "gemini",
        NOW,
      ),
    );

    expect(recommendation.dataSource).toBe("exact-native-id");
    expect(recommendation.candidateIds).toEqual(["BAV03"]);
    expect(recommendation.gameSnById).toEqual({ BAV03: "BAV03-SN" });
    expect(recommendation.count).toBe(10);
    expect(recommendation.canBet).toBe(true);
    expect(recommendation.side).toBe(
      localProviderDecision("gemini", results).side,
    );
    expect(recommendation.confidence).toBe(
      localProviderDecision("gemini", results).confidence,
    );
  });

  it("permits unknown-ID recommendations only for complete candidate consensus and preserves both IDs/gameSn values", () => {
    const adapter = createMtRecommendationAdapter();
    const regular = live({
      id: "BAV03",
      snapshotGameSn: "regular-sn",
      count: 12,
    });
    const liveAlias = live({
      id: "BAV03_LIVE",
      snapshotGameSn: "live-sn",
      count: 9,
    });

    const recommendation = mustSucceed(
      adapter.preview(
        report([regular, liveAlias], { candidateIds: ["BAV03", "BAV03_LIVE"] }),
        "B03",
        "road",
        NOW,
      ),
    );

    expect(recommendation.dataSource).toBe("candidate-consensus");
    expect(recommendation.candidateIds).toEqual(["BAV03", "BAV03_LIVE"]);
    expect(recommendation.gameSnById).toEqual({
      BAV03: "regular-sn",
      BAV03_LIVE: "live-sn",
    });
    expect(recommendation.count).toBe(9);
    expect(recommendation.canBet).toBe(true);
  });

  it.each([
    ["road", live({ id: "BAV03_LIVE", results: ["莊", "莊", "莊"] })],
    ["shoe", live({ id: "BAV03_LIVE", shoe: "1151" })],
    [
      "round",
      live({ id: "BAV03_LIVE", round: 5, results: ["莊", "閒", "莊", "閒"] }),
    ],
  ])("rejects candidate consensus when %s differs", (_label, alternate) => {
    const adapter = createMtRecommendationAdapter();
    const recommendation = adapter.preview(
      report([live(), alternate], { candidateIds: ["BAV03", "BAV03_LIVE"] }),
      "B03",
      "chatgpt",
      NOW,
    );
    expect(recommendation.ok).toBe(false);
  });

  it("fails incomplete bead roads and never uses the local formula's empty-road banker fallback", () => {
    const adapter = createMtRecommendationAdapter();
    const noBead = live({ rawRoad: "", results: [], round: 1 });
    const recommendation = adapter.preview(
      report([noBead]),
      "B03",
      "road",
      NOW,
    );
    expect(recommendation).toMatchObject({ ok: false, tableName: "B03" });
  });

  it("permits a closed-table preview but makes stale clocks, missing gameSn, and non-wait phases non-bettable", () => {
    const scenarios: Array<[string, LiveOptions]> = [
      ["stale", { at: NOW - 3501 }],
      ["missing gameSn", { snapshotGameSn: "", clockGameSn: "" }],
      ["closed", { phase: "end" }],
    ];

    for (const [_label, options] of scenarios) {
      const adapter = createMtRecommendationAdapter();
      const recommendation = mustSucceed(
        adapter.preview(report([live(options)]), "B03", "meta", NOW),
      );
      expect(recommendation.canBet).toBe(false);
      expect(recommendation.reason).toBeTypeOf("string");
    }
  });

  it("requires the DOM table name to be unique in the viewport", () => {
    const adapter = createMtRecommendationAdapter();
    const input = report([live()]);
    input.tableViewport.tables.push({
      name: "B03",
      tableId: "BAV03",
      candidateIds: ["BAV03"],
      betAreaPresent: true,
      identitySource: "native",
    });
    const recommendation = adapter.preview(input, "B03", "road", NOW);
    expect(recommendation).toMatchObject({
      ok: false,
      reason: "viewport 出現重複 DOM table name",
    });
  });

  it("only appends a safe contiguous show_win, deduplicates it, does not regress to an old snapshot, and refuses a cross-shoe event", () => {
    const adapter = createMtRecommendationAdapter();
    const base = live({ id: "BAV03", results: ROAD, round: 4 });
    const initial = mustSucceed(
      adapter.preview(report([base]), "B03", "combined", NOW),
    );
    expect(initial).toMatchObject({ round: 4, results: ROAD });

    const next = live({
      id: "BAV03",
      // This simulates the diagnostic's copied old snapshot after a show_win:
      // no rawRoad means it is not a replacement bead snapshot.
      rawRoad: "",
      results: ROAD,
      round: 5,
      last: { at: NOW, shoe: "1150", round: 4, result: "閒" },
    });
    const afterIncrement = mustSucceed(
      adapter.preview(report([next]), "B03", "combined", NOW + 1),
    );
    expect(afterIncrement).toMatchObject({
      round: 5,
      results: ["莊", "閒", "莊", "閒"],
    });

    const duplicate = mustSucceed(
      adapter.preview(report([next]), "B03", "combined", NOW + 2),
    );
    expect(duplicate.results).toEqual(["莊", "閒", "莊", "閒"]);

    // Once the UI has an exact native identity, a delayed snapshot may preview
    // the verified cache but cannot move it backward or become bettable.
    const oldSnapshot = mustSucceed(
      adapter.preview(
        report([base], { tableId: "BAV03" }),
        "B03",
        "combined",
        NOW + 3,
      ),
    );
    expect(oldSnapshot).toMatchObject({
      round: 5,
      results: ["莊", "閒", "莊", "閒"],
      canBet: false,
    });

    const crossShoe = live({
      id: "BAV03",
      shoe: "1151",
      round: 1,
      rawRoad: "",
      results: [],
      last: { at: NOW + 4, shoe: "1150", round: 4, result: "閒" },
    });
    const unsafe = adapter.preview(
      report([crossShoe]),
      "B03",
      "combined",
      NOW + 4,
    );
    expect(unsafe.ok).toBe(false);

    const verifiedNewShoe = live({
      id: "BAV03",
      shoe: "1151",
      round: 2,
      results: ["莊"],
      rawRoad: "0202",
    });
    const newShoe = mustSucceed(
      adapter.preview(report([verifiedNewShoe]), "B03", "combined", NOW + 5),
    );
    expect(newShoe).toMatchObject({ shoe: "1151", round: 2, results: ["莊"] });
  });
});
