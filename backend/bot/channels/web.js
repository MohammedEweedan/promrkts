const express = require('express');
const { handleMessage } = require('../core/handle');

const router = express.Router();

router.post('/webhook', express.json(), async (req, res) => {
  try {
    const { text = '', sessionId, userId, lang = 'en', role, context, ctx, facts, model, stream, hints, tools } = req.body || {};

    const host = String(req.headers.host || '').toLowerCase();
    const onPublic = /^(www\.gaja\.ly(?::\d+)?|gaja\.ly(?::\d+)?)$/.test(host);
    const empHeader = String(req.headers['x-employee'] || '').toLowerCase() === '1';
    const isEmp = !onPublic && empHeader;
    const channel = isEmp ? 'web-emp' : 'web';

    const payload = await handleMessage({
      channel,
      userId: String(userId || sessionId || 'web'),
      text: String(text || ''),
      lang,
      role,
      context: context ?? ctx,
      facts,
      model,
      stream,
      hints,
      tools,
    });

    res.json({
      reply: payload?.text || '',
      images: payload?.images || [],
      suggestions: payload?.suggestions || [],
      actions: payload?.actions || [],
      ctx: payload?.ctx,
    });
  } catch (e) {
    console.error('[WEB WEBHOOK ERROR]', e);
    console.error('[WEB WEBHOOK ERROR STACK]', e.stack);
    res.status(500).json({
      error: 'Markets analysis unavailable',
      guidance: 'Let me suggest alternative learning resources...'
    });
  }
});

module.exports = router;
