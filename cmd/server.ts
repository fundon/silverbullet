import { path } from "../server/deps.ts";
import { HttpServer } from "../server/http_server.ts";
import assetBundle from "../dist/asset_bundle.json" assert { type: "json" };
import { AssetBundle, AssetJson } from "../plugos/asset_bundle/bundle.ts";

export function serveCommand(options: any, folder: string) {
  const pagesPath = path.resolve(Deno.cwd(), folder);
  const hostname = options.hostname || "127.0.0.1";
  const port = options.port || 3000;

  console.log(
    "Going to start Silver Bullet binding to",
    `${hostname}:${port}`,
  );
  console.log("Serving pages from", pagesPath);

  if (hostname === "127.0.0.1") {
    console.log(
      `_Note:_ Silver Bullet will only be available locally (via http://localhost:${port}), to allow outside connections, pass --host 0.0.0.0 as a flag.`,
    );
  }

  const httpServer = new HttpServer({
    hostname,
    port: port,
    pagesPath: pagesPath,
    dbPath: path.join(pagesPath, options.db),
    assetBundle: new AssetBundle(assetBundle as AssetJson),
    user: options.user,
  });
  httpServer.start().catch((e) => {
    console.error("HTTP Server error", e);
    Deno.exit(1);
  });
}
