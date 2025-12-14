import { createLogger, Logger, format, transports } from 'winston';
import { basename } from 'node:path';

const { combine, timestamp, printf, label, colorize } = format;

export class CustomLogger {
  private context: string;
  private logger: Logger;

  constructor(context: string = 'App') {
    this.context = basename(context);

    // Console log format (with colors)
    const consoleLogFormat = combine(
      colorize({ all: true }), // Colorize based on log level
      printf(({ timestamp, level, message, label }) => {
        return `${timestamp} [${label}] [${level}]: ${message}`;
      })
    );

    this.logger = createLogger({
      format: combine(
        label({ label: this.context }), // Add context to each log entry
        timestamp() // Add timestamp to logs
      ),
      transports: [
        new transports.Console({
          format: combine(
            label({ label: this.context }), // Add context to each log entry
            timestamp(),
            consoleLogFormat // Colorized format for console
          ),
        }),
      ],
    });
  }

  private _format(level: string, ...messages: any[]) {
    const logMessage = messages
      .map((message) => {
        if (typeof message === 'object') {
          return message.message || JSON.stringify(message, null, 2);
        } else if (Array.isArray(message)) {
          return JSON.stringify(message, null, 2);
        } else {
          return String(message);
        }
      })
      .join(' ');

    this.logger.log({ level, message: logMessage });
  }

  // Shortcuts for commonly used log levels
  info(...messages: any[]) {
    this._format('info', ...messages);
  }

  warn(...messages: any[]) {
    this._format('warn', ...messages);
  }

  error(...messages: any[]) {
    this._format('error', ...messages);
  }
}