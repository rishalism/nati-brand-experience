import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Password hashing. Argon2id is the current best-practice memory-hard KDF.
 * Isolated in a service so the algorithm can be tuned/swapped in one place.
 */
@Injectable()
export class PasswordService {
  hash(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
