import { Injectable } from '@nestjs/common';
import { create } from 'venom-bot';
import { OpenAIApi, CreateImageRequestSizeEnum, Configuration } from "openai";
import qrcode from 'qrcode-terminal';

@Injectable()
export class AppService {
  private readonly openai: OpenAIApi;
  constructor() {
    const configuration = new Configuration({
      organization: process.env.ORGANIZATION_ID,
      apiKey: process.env.OPENAI_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async startBot(): Promise<any> {
    let qrCode: any
    let sessionId: any
    return create({
      session: 'chat-gpt',
      multidevice: true
    })
      .then((client) => this.start(client))
      .catch((erro) => {
        console.log(erro)
      });
  }

  private registerBotListeners(client) {
    client.onAnyMessage((message) => {
      console.log("Hello World")
      if (message.body.toLowerCase() === "hello") {
        // message.from é o número do usuário que enviou a msg "hello"
        client.sendText(message.from, "🤖 world 🌎")
      }
    });
  }

  async getDavinciResponse(clientText: string) {
    const options = {
      model: "text-davinci-003",
      prompt: clientText,
      temperature: 1,
      max_tokens: 4000
    }

    try {
      const response = await this.openai.createCompletion(options)
      let botResponse = ""
      response.data.choices.forEach(({ text }) => {
        botResponse += text
      })
      return `Chat GPT 🤖\n\n ${botResponse.trim()}`
    } catch (e) {
      return `❌ OpenAI Response Error: ${e.response.data.error.message}`
    }
  }

  async getDalleResponse(clientText: string) {
    const options = {
      prompt: clientText,
      n: 1,
      size: "1024x1024" as CreateImageRequestSizeEnum, // Tamanho da imagem
    }

    try {
      const response = await this.openai.createImage(options);
      return response.data.data[0].url
    } catch (e) {
      return `❌ OpenAI Response Error: ${e.response.data.error.message}`
    }
  }

  commands(client, message) {
    const iaCommands = {
      davinci3: "/bot",
      dalle: "/img"
    }

    let firstWord = message.text.substring(0, message.text.indexOf(" "));

    switch (firstWord) {
      case iaCommands.davinci3:
        const question = message.text.substring(message.text.indexOf(" "));
        this.getDavinciResponse(question).then((response) => {
          /*
           * Faremos uma validação no message.from
           * para caso a gente envie um comando
           * a response não seja enviada para
           * nosso próprio número e sim para 
           * a pessoa ou grupo para o qual eu enviei
           */
          client.sendText(message.from === process.env.BOT_NUMBER ? message.to : message.from, response)
        })
        break;

      case iaCommands.dalle:
        const imgDescription = message.text.substring(message.text.indexOf(" "));
        this.getDalleResponse(imgDescription).then((imgUrl) => {
          client.sendImage(
            message.from === process.env.BOT_NUMBER ? message.to : message.from,
            imgUrl,
            imgDescription,
            'Imagem gerada pela IA DALL-E 🤖'
          )
        })
        break;
    }
  }

  async start(client) {
    client.onAnyMessage((message) => this.commands(client, message));
  }
}