import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './auth.lib';

@Controller('auth')
export class AuthController {
  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}${req.originalUrl}`;

    console.log(`[Auth] ${req.method} ${url}`);
    console.log(`[Auth] Body:`, req.body);

    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers as any,
      body:
        req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body)
          : undefined,
    });

    const betterAuthRes = await auth.handler(webReq);
    console.log(`[Auth] Response Status: ${betterAuthRes.status}`);

    res.status(betterAuthRes.status);

    betterAuthRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

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
