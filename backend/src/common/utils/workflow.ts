import { BadRequestException } from '@nestjs/common';

export function assertTransition<T extends string>(label: string, from: T, to: T, transitions: Record<T, readonly T[]>) {
  if (from !== to && !transitions[from].includes(to)) {
    throw new BadRequestException(`Transition ${label} interdite : ${from} → ${to}`);
  }
}
