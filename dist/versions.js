"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const semver = require("semver");
const tool_cache_1 = require("@actions/tool-cache");
const _fs = require("fs");
const fs = _fs.promises;
async function fetchVersions() {
    const token = core.getInput("token");
    const url = `https://ghapi.codehz.workers.dev/repos/xmake-io/xmake/git/refs/tags?access_token=${token}`;
    const file = await tool_cache_1.downloadTool(url);
    const tags = JSON.parse(await fs.readFile(file, { encoding: "utf-8" }));
    return tags.map(({ ref, object: { sha } }) => [ref.slice(11), sha]).reduce((o, [k, v]) => {
        o[k] = v;
        return o;
    }, {});
}
exports.fetchVersions = fetchVersions;
async function selectVersion(version) {
    version = version || core.getInput("xmake-version") || "latest";
    if (version.toLowerCase() === "latest")
        version = "";
    version = semver.validRange(version);
    if (!version) {
        throw new Error(`Invalid input xmake-version: ${core.getInput("xmake-version")}`);
    }
    const versions = await fetchVersions();
    const ver = semver.maxSatisfying(Object.keys(versions), version);
    if (!ver) {
        throw new Error(`No matched releases of xmake-version: ${version}`);
    }
    const sha = versions[ver];
    core.info(`selected xmake v${ver} (commit: ${sha.substr(0, 8)})`);
    return { version: ver, sha };
}
exports.selectVersion = selectVersion;
