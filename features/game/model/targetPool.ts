import type { Target, TargetKind } from "../types";

export type TargetInitialiser = {
  x: number;
  y: number;
  born: number;
  life: number;
  radius: number;
  kind: TargetKind;
};

export class TargetPool {
  private readonly freeTargets: Target[] = [];
  private nextId = 1;

  acquire(initialiser: TargetInitialiser): Target {
    const target = this.freeTargets.pop() ?? {
      id: 0,
      x: 0,
      y: 0,
      born: 0,
      life: 0,
      radius: 0,
      kind: "normal" as TargetKind,
    };

    target.id = this.nextId;
    target.x = initialiser.x;
    target.y = initialiser.y;
    target.born = initialiser.born;
    target.life = initialiser.life;
    target.radius = initialiser.radius;
    target.kind = initialiser.kind;
    this.nextId += 1;

    return target;
  }

  release(target: Target) {
    this.freeTargets.push(target);
  }

  releaseAll(targets: Target[]) {
    targets.forEach((target) => this.release(target));
    targets.length = 0;
  }
}
