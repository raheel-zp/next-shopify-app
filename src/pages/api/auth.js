// pages/api/auth.js

export default function handler(req, res) {
  const { shop } = req.query;
  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  // Use environment variables from .env.local
  const { SHOPIFY_API_KEY, SCOPES, HOST } = process.env;
  const redirectUri = `${HOST}/api/auth/callback`;
  const installUrl =
    `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}` +
    `&scope=${SCOPES}&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
}
