#!/usr/bin/env node
"use strict";

// This is deliberately an in-memory PostgreSQL test.  It neither reads DATABASE_URL
// nor creates any network connection.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
let PGlite;
try { ({PGlite} = require("@electric-sql/pglite")); }
catch { ({PGlite} = require("/tmp/autobac-pg-test/node_modules/@electric-sql/pglite")); }

function extractPresenceSql() {
  const source = fs.readFileSync(path.join(__dirname, "..", "server", "user-presence.ts"), "utf8");
  const match = source.match(/export const PRESENCE_SUMMARY_SQL = `([\s\S]*?)`;/);
  assert.ok(match, "PRESENCE_SUMMARY_SQL should remain extractable from the presence module");
  return match[1].replace(/\$\{LEASE_TTL_SECONDS\}/g, "25");
}

async function main() {
  const db = new PGlite();
  try {
    await db.query(`
      CREATE TABLE autobac_user_presence (
        connection_id TEXT PRIMARY KEY,
        app_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        username_key TEXT NOT NULL,
        running BOOLEAN NOT NULL DEFAULT FALSE,
        last_seen_at TIMESTAMPTZ NOT NULL
      )
    `);
    await db.query(`
      CREATE TABLE tz_whitelist (
        platform TEXT NOT NULL,
        username TEXT NOT NULL,
        enabled BOOLEAN NOT NULL,
        expires_at TIMESTAMPTZ NULL
      )
    `);
    await db.query(`
      INSERT INTO tz_whitelist (platform, username, enabled, expires_at) VALUES
        ('ofa', 'OwnerCase', TRUE, NULL),
        ('TZ', 'AnotherCase', TRUE, NULL),
        ('OFA', 'DisabledCase', FALSE, NULL),
        ('OFA', 'ExpiredCase', TRUE, NOW() - INTERVAL '1 minute'),
        ('OFA', 'StaleCase', TRUE, NULL)
    `);
    await db.query(`
      INSERT INTO autobac_user_presence (connection_id, app_id, platform, username_key, running, last_seen_at) VALUES
        -- two tabs in the same app are one online_user
        ('a1', 'autobac', 'OFA', 'ownercase', TRUE, NOW()),
        ('a2', 'autobac', 'OFA', 'ownercase', FALSE, NOW()),
        -- the same account on a different app has its own online_user
        ('b1', 'baccarat-helper', 'OFA', 'ownercase', FALSE, NOW()),
        ('s1', 'scarab-heart', 'TZ', 'anothercase', FALSE, NOW()),
        -- disabled, expired whitelist, and expired lease must all be absent
        ('d1', 'autobac', 'OFA', 'disabledcase', FALSE, NOW()),
        ('e1', 'baccarat-helper', 'OFA', 'expiredcase', FALSE, NOW()),
        ('l1', 'scarab-heart', 'OFA', 'stalecase', FALSE, NOW() - INTERVAL '26 seconds')
    `);

    const { rows } = await db.query(extractPresenceSql());
    const summary = rows.find((row) => row.row_kind === "summary");
    const applications = rows.filter((row) => row.row_kind === "application");
    const onlineUsers = rows.filter((row) => row.row_kind === "online_user");

    assert.equal(summary.online_users_available, true);
    assert.equal(summary.online_accounts, 2, "global count is unique platform/account pairs");
    assert.equal(summary.running_accounts, 1);
    assert.deepEqual(onlineUsers.map(({ app_id, platform, username }) => ({ appId: app_id, platform, username })), [
      { appId: "autobac", platform: "OFA", username: "OwnerCase" },
      { appId: "baccarat-helper", platform: "OFA", username: "OwnerCase" },
      { appId: "scarab-heart", platform: "TZ", username: "AnotherCase" },
    ]);
    assert.equal(onlineUsers.length, 3, "same-app tabs deduplicate; the second app remains visible");
    assert.equal(new Set(onlineUsers.map((user) => `${user.platform}:${user.username.toLowerCase()}`)).size, summary.online_accounts);
    for (const application of applications) {
      assert.equal(
        onlineUsers.filter((user) => user.app_id === application.app_id).length,
        application.online_accounts,
        `application count agrees with onlineUsers for ${application.app_id}`,
      );
    }
    assert.ok(!onlineUsers.some((user) => /Disabled|Expired|Stale/.test(user.username)));
    console.log("presence user SQL: passed");
  } finally {
    await db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
