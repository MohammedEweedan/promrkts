import winston from 'winston';

const { combine, timestamp, printf, colorize, splat } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    splat(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), splat(), logFormat),
    }),
  ],
});

export default logger;
