import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './auth.lib';

@Controller('api/auth')
export class AuthController {
  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    // Create a Web Standard Request from the Express Request
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}${req.originalUrl}`;

    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers as any,
      // Note: In a real production app, you'd want to handle the body more robustly (e.g. raw body)
      body:
        req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body)
          : undefined,
    });

    const betterAuthRes = await auth.handler(webReq);

    // Set status
    res.status(betterAuthRes.status);

    // Set headers
    betterAuthRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Set body
    const contentType = betterAuthRes.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const body = await betterAuthRes.json();
      res.json(body);
    } else {
      const body = await betterAuthRes.text();
      res.send(body);
    }
  }
}
