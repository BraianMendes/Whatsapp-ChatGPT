import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('start-bot')
  startBot(): Promise<any> {
    return this.appService.startBot();
  }

  @Post('davinci')
  async getDavinciResponse(@Body() clientText: string) {
    const response = await this.appService.getDavinciResponse(clientText);
    return response;
  }

  @Post('dalle')
  async getDalleResponse(@Body() clientText: string) {
    const response = await this.appService.getDalleResponse(clientText);
    return response;
  }
}
