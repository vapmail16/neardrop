import type { FastifyBaseLogger } from 'fastify';
import type { Knex } from 'knex';
import type { Env } from '../config/schema.js';
import { LoggingEmailChannel } from '../channels/logging.email.channel.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { CollectionService } from './collection.service.js';
import { NotificationService } from './notification.service.js';
import { ParcelService } from './parcel.service.js';
import { QrTokenService } from './qr-token.service.js';

export type ParcelStack = {
  parcel: ParcelService;
  collection: CollectionService;
};

export function createParcelStack(knex: Knex, config: Env, log: FastifyBaseLogger): ParcelStack {
  const qrTokens = new QrTokenService(config);
  const email = new LoggingEmailChannel(log);
  const notifications = new NotificationService(
    new UserRepository(knex),
    new NotificationRepository(knex),
    email,
  );
  const parcel = new ParcelService(knex, { qrTokens, notifications });
  const collection = new CollectionService(knex, qrTokens, notifications);
  return { parcel, collection };
}
