var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/yoco/charge", async (req, res) => {
    try {
      const { token, amountInCents, currency = "ZAR", orderNumber, customerEmail, customerName } = req.body;
      if (!token || !amountInCents) {
        return res.status(400).json({ error: "Missing token or amountInCents in request" });
      }
      const secretKey = process.env.YOCO_SECRET_KEY;
      if (!secretKey) {
        console.warn("[Yoco Charge] YOCO_SECRET_KEY environment variable is not configured.");
      }
      console.log(`[Yoco Charge] Processing charge for order ${orderNumber} - Amount: ZAR ${(amountInCents / 100).toFixed(2)}`);
      const yocoResponse = await fetch("https://online.yoco.com/v1/charges/", {
        method: "POST",
        headers: {
          "X-Auth-Secret-Key": secretKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          amountInCents: Math.round(Number(amountInCents)),
          currency,
          metadata: {
            orderNumber: orderNumber || "FTD-TEST",
            customerEmail: customerEmail || "customer@example.com",
            customerName: customerName || "Test Customer"
          }
        })
      });
      const data = await yocoResponse.json();
      if (yocoResponse.ok && (data.status === "successful" || data.id)) {
        console.log(`[Yoco Charge] Success! Charge ID: ${data.id}`);
        return res.json({
          success: true,
          status: data.status || "successful",
          chargeId: data.id,
          charge: data
        });
      } else {
        console.error("[Yoco Charge] Failed:", data);
        return res.status(yocoResponse.status || 400).json({
          success: false,
          error: data.displayMessage || data.errorMessage || data.message || "Yoco charge failed",
          details: data
        });
      }
    } catch (err) {
      console.error("[Yoco Charge] Server error:", err);
      return res.status(500).json({ success: false, error: err.message || "Internal server error" });
    }
  });
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", yocoConfigured: Boolean(process.env.VITE_YOCO_PUBLIC_KEY) });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
