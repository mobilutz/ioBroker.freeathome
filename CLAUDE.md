# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ioBroker adapter that bridges a Busch-Jaeger free@home System Access Point (SysAP) into ioBroker. Pure JavaScript (no TypeScript build step). Entry point is `main.js`; runtime config comes from ioBroker, not env vars.

## Commands

```
npm run lint              # eslint (config: .eslintrc.json — 4-space indent, single quotes, semis)
npm run test:js           # mocha — runs main.test.js (matches mocharc default glob)
npm run test:package      # validates io-package.json / package.json metadata
npm run test:unit         # @iobroker/testing unit harness (starts adapter in mocked JS-Controller)
npm run test:integration  # @iobroker/testing integration harness (real JS-Controller); allowedExitCodes: [6, 11]
npm test                  # test:js + test:package (what CI runs via ioBroker testing actions)
npm run translate         # @iobroker/adapter-dev translator for admin/i18n/*
```

Run a single mocha file: `npx mocha path/to/file.test.js`. There is no build step — edits to `.js` files take effect immediately.

## Architecture

Two layers, both in plain JS:

1. **`main.js` — `Freeathome extends utils.Adapter`**  
   Lifecycle (`ready` / `stateChange` / `unload`) wired to an `@iobroker/adapter-core` Adapter. On `ready` it instantiates the API wrapper and `subscribeStates('*')`. A 60s `setInterval` (`this.cron`) re-polls devices via `updateAllDevices()`. `onStateChange` forwards non-ack writes to the SysAP by splitting the state id into `[adapter, instance, deviceId, channel, datapoint]` and calling `_api.set(deviceId, channel, datapoint, value)`.

2. **`lib/freeathome.js` — `FreeAtHomeApi`**  
   Wraps `SystemAccessPoint` from the `freeathome-api` npm package. Holds `_connected`, mirrors it to `info.connection`. `addDeviceToioBroker(device)` is the object-graph builder: it creates an ioBroker `device` per `serialNumber`, a `channel` per channel, and `state` objects per datapoint and per metadata key (`displayName`, `room`, `iconId`, `floor`, `functionId`). `functionId` values are looked up in the `functionIds` map (hex code → `FID_*` constant from the ABB free@home reference) before being written.

   `broadcastMessage(message)` is the callback the `freeathome-api` library invokes on push updates — note it iterates `message.result` and re-runs `addDeviceToioBroker` for each entry, which is also how state changes from the SysAP reach ioBroker.

   The SysAP itself (`freeathome.0.ABB700000000`) is explicitly skipped in `addDeviceToioBroker`.

`lib/tools.js` only contains `isObject`/`isArray`/`translateText` helpers (Yandex/Google) for the admin translation flow — it is not used at runtime by the adapter.

## Config surface (`io-package.json` → `native`)

`hostname`, `username`, `password` (encrypted + protected), plus `httpEnabled`/`httpIp`/`httpPort` and `wsEnabled`/`wsIp`/`wsPort`. These map 1:1 into the `freeathome-api` `SystemAccessPoint` config in `FreeAtHomeApi`'s constructor. Admin UI lives in `admin/index_m.html` with translations under `admin/i18n/`.

## Conventions specific to this repo

- All state ids use the pattern `<serial>.<channel>.<datapoint>`; this shape is hardcoded in `onStateChange`. Don't change the id layout without updating both ends.
- Adding a new free@home function type means adding an entry to the `functionIds` map in `lib/freeathome.js` — the key is the hex code from the [ABB function-id reference](https://developer.eu.mybuildings.abb.com/fah_cloud/reference/functionids/) linked at the top of that file.
- `setObjectNotExistsAsync` is used everywhere to keep the device tree idempotent across re-polls; prefer it over `setObjectAsync` unless you're intentionally overwriting (as the `displayName` branch does).
- Releases ship via tag push (`v[0-9]+.[0-9]+.[0-9]+`). The publish/release steps in `.github/workflows/test-and-release.yml` are currently commented out — bumping the version in `package.json` + `io-package.json` and tagging does not automatically publish to npm.
