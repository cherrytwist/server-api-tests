import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

export const createLogger = () => {
  return winston.createLogger({
    transports: [
      new winston.transports.Console({ level: 'info', format: logFormat }),
      new winston.transports.File({
        filename: 'server-api-info.log',
        level: 'info',
      }),
      new winston.transports.File({
        filename: 'server-api-warnings.log',
        level: 'warn',
      }),
      new winston.transports.File({
        filename: 'server-api-errors.log',
        level: 'error',
      }),
    ],
  });
};

export const createProfiler = () => {
  return winston.createLogger({
    transports: [
      new winston.transports.Console({ level: 'info', format: logFormat }),
      new winston.transports.File({
        filename: 'server-api-profile-info.log',
        level: 'silly',
      }),
    ],
  });
};
