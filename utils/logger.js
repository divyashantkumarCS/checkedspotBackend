import pino from "pino";

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
  }
})

export default logger;