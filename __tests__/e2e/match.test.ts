import "jest-extended";
import { compile } from "path-to-regexp";
import { PlatformId } from "../../src/@types";
import { RiotRateLimiter, METHODS, HOST } from "../../src/index";

const riotAPIKey = process.env.X_RIOT_API_KEY || "";
const puuid = process.env.PUUID || "";

describe("E2E", () => {
  test("Get MatchIds By PUUID", async () => {
    const limiter = new RiotRateLimiter();

    const createHost = compile(HOST, { encode: encodeURIComponent });
    const createAccountPath = compile(METHODS.SUMMONER.GET_BY_PUUID, {
      encode: encodeURIComponent,
    });
    const createMatchListPath = compile(METHODS.MATCH_V5.GET_IDS_BY_PUUID, {
      encode: encodeURIComponent,
    });

    const options = {
      headers: {
        "X-Riot-Token": riotAPIKey,
      },
    };
    const account = await limiter.execute({
      url: `https://${createHost({
        platformId: PlatformId.EUW1,
      })}${createAccountPath({ puuid: puuid })}`,
      options,
    });
    const resp = await limiter.execute({
      url: `https://${createHost({
        platformId: PlatformId.EUROPE,
      })}${createMatchListPath({
        puuid: account.puuid,
      })}`,
      options,
    });
    expect(resp).toBeArray();
  });

  test("Get MatchIds By Not Found Account", async () => {
    const limiter = new RiotRateLimiter();

    const createHost = compile(HOST, { encode: encodeURIComponent });
    const createAccountPath = compile(METHODS.SUMMONER.GET_BY_PUUID, {
      encode: encodeURIComponent,
    });
    const createMatchListPath = compile(METHODS.MATCH_V5.GET_IDS_BY_PUUID, {
      encode: encodeURIComponent,
    });

    const options = {
      headers: {
        "X-Riot-Token": riotAPIKey,
      },
    };
    const account = await limiter.execute({
      url: `https://${createHost({
        platformId: PlatformId.EUW1,
      })}${createAccountPath({ puuid: puuid })}`,
      options,
    });

    const resp = await limiter.execute({
      url: `https://${createHost({
        platformId: PlatformId.AMERICAS,
      })}${createMatchListPath({
        puuid: account.puuid,
      })}`,
      options,
    });
    expect(resp).toEqual([]);
  });
});
