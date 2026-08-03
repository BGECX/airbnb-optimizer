import { Body, Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { PlatformCallbackDto } from './dto/platform-callback.dto';
import { PlatformWebhookVerifier } from './platform-webhook-verifier';
import { TransmissionsService } from './transmissions.service';

@ApiExcludeController()
@Controller('integrations/plateforme-agreee')
export class PlatformWebhookController {
  constructor(private readonly verifier: PlatformWebhookVerifier, private readonly transmissions: TransmissionsService) {}

  @Post('webhook')
  callback(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-pa-timestamp') timestamp: string | undefined,
    @Headers('x-pa-event-id') eventId: string | undefined,
    @Headers('x-pa-signature') signature: string | undefined,
    @Body() dto: PlatformCallbackDto,
  ) {
    this.verifier.verify(request.rawBody, timestamp, eventId, signature);
    return this.transmissions.recordCallback(eventId!, dto);
  }
}
