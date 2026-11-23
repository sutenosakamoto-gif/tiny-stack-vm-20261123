// Tiny stack VM for make.fun's tiny stack ISA v1: a faithful port of the kit's
// reference vm.mjs (ISA.md beside it is the spec). Per step, in the reference's
// order: step limit (trap 10), pc range (9), unknown opcode (5), cut-off
// immediate (9), stack underflow (2), stack overflow (3), then the instruction's
// own traps (4 div by zero, 6 memory range, 7 call depth, 8 empty RET, 11 output
// limit). Int32 values wrap (Math.imul for MUL); DIV/MOD/DIVU/MODU copy the
// reference formulas exactly (INT_MIN / -1, remainder sign, unsigned reads).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function run(P: Uint8Array, I: Uint8Array) {
  const D = new Int32Array(256);
  const C = new Int32Array(64);
  const M = new Int32Array(256);
  const O = new Uint8Array(65536);
  const n = P.length;
  let sp = 0;
  let cp = 0;
  let ol = 0;
  let ip = 0;
  let pc = 0;
  let st = 0;
  const end = (c: number) => ({ o: O.slice(0, ol), c });
  for (;;) {
    if (st === 1000000) return end(10);
    if (pc < 0 || pc >= n) return end(9);
    const op = P[pc];
    const im = op === 1 ? 1 : op === 2 ? 4 : op >= 0x30 && op <= 0x33 ? 2 : 0;
    const ok =
      op <= 7 || (op >= 0x10 && op <= 0x1e) || (op >= 0x20 && op <= 0x22) ||
      (op >= 0x30 && op <= 0x34) || op === 0x40 || op === 0x41 || (op >= 0x50 && op <= 0x53);
    if (!ok) return end(5);
    if (pc + im >= n) return end(9);
    st++;
    let pp = 0;
    let pu = 0;
    if (op === 7) pp = 3;
    else if (op === 5 || op === 6 || op === 0x41 || (op >= 0x10 && op <= 0x22 && op !== 0x17 && op !== 0x1b)) pp = 2;
    else if (op === 3 || op === 4 || op === 0x17 || op === 0x1b || op === 0x31 || op === 0x32 || op === 0x40 || op === 0x50 || op === 0x51 || op === 0x53) pp = 1;
    if (op === 6 || op === 7) pu = 3;
    else if (op === 4 || op === 5) pu = 2;
    else if (op === 1 || op === 2 || op === 0x40 || op === 0x52 || (op >= 0x10 && op <= 0x22)) pu = 1;
    if (sp < pp) return end(2);
    if (sp - pp + pu > 256) return end(3);
    const nx = pc + 1 + im;
    pc = nx;
    switch (op) {
      case 0x00:
        return end(0);
      case 0x01:
        D[sp++] = (P[nx - 1] << 24) >> 24;
        break;
      case 0x02:
        D[sp++] = P[nx - 4] | (P[nx - 3] << 8) | (P[nx - 2] << 16) | (P[nx - 1] << 24);
        break;
      case 0x03:
        sp--;
        break;
      case 0x04:
        D[sp] = D[sp - 1];
        sp++;
        break;
      case 0x05: {
        const t = D[sp - 1];
        D[sp - 1] = D[sp - 2];
        D[sp - 2] = t;
        break;
      }
      case 0x06:
        D[sp] = D[sp - 2];
        sp++;
        break;
      case 0x07: {
        const a = D[sp - 3];
        D[sp - 3] = D[sp - 2];
        D[sp - 2] = D[sp - 1];
        D[sp - 1] = a;
        break;
      }
      case 0x17:
        D[sp - 1] = -D[sp - 1];
        break;
      case 0x1b:
        D[sp - 1] = ~D[sp - 1];
        break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e:
      case 0x20: case 0x21: case 0x22: {
        const b = D[sp - 1];
        const a = D[sp - 2];
        let r: number;
        if (op === 0x10) r = a + b;
        else if (op === 0x11) r = a - b;
        else if (op === 0x12) r = Math.imul(a, b);
        else if (op === 0x13) {
          if (b === 0) return end(4);
          r = a === -2147483648 && b === -1 ? a : (a / b) | 0;
        } else if (op === 0x14) {
          if (b === 0) return end(4);
          r = b === -1 ? 0 : a % b;
        } else if (op === 0x15) {
          if (b === 0) return end(4);
          r = Math.floor((a >>> 0) / (b >>> 0));
        } else if (op === 0x16) {
          if (b === 0) return end(4);
          r = (a >>> 0) % (b >>> 0);
        } else if (op === 0x18) r = a & b;
        else if (op === 0x19) r = a | b;
        else if (op === 0x1a) r = a ^ b;
        else if (op === 0x1c) r = a << (b & 31);
        else if (op === 0x1d) r = a >> (b & 31);
        else if (op === 0x1e) r = a >>> (b & 31);
        else if (op === 0x20) r = a === b ? 1 : 0;
        else if (op === 0x21) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        D[sp - 2] = r;
        sp--;
        break;
      }
      case 0x30:
      case 0x31:
      case 0x32: {
        const rel = ((P[nx - 2] | (P[nx - 1] << 8)) << 16) >> 16;
        let take = op === 0x30;
        if (!take) take = (D[--sp] === 0) === (op === 0x31);
        if (take) pc = nx + rel;
        break;
      }
      case 0x33:
        if (cp === 64) return end(7);
        C[cp++] = nx;
        pc = P[nx - 2] | (P[nx - 1] << 8);
        break;
      case 0x34:
        if (cp === 0) return end(8);
        pc = C[--cp];
        break;
      case 0x40: {
        const a = D[sp - 1];
        if (a < 0 || a > 255) return end(6);
        D[sp - 1] = M[a];
        break;
      }
      case 0x41: {
        const a = D[sp - 1];
        if (a < 0 || a > 255) return end(6);
        M[a] = D[sp - 2];
        sp -= 2;
        break;
      }
      case 0x50: {
        const s = String(D[sp - 1]);
        if (ol + s.length > 65536) return end(11);
        sp--;
        for (let i = 0; i < s.length; i++) O[ol++] = s.charCodeAt(i);
        break;
      }
      case 0x51:
        if (ol + 1 > 65536) return end(11);
        O[ol++] = D[--sp] & 255;
        break;
      case 0x52:
        D[sp++] = ip < I.length ? I[ip++] : -1;
        break;
      case 0x53:
        return end(D[--sp] & 255);
    }
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(readFileSync(join(I, id, 'program.bin')), readFileSync(join(I, id, 'input.bin')));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), r.o);
  writeFileSync(join(O, id, 'exit.txt'), `${r.c}\n`);
}
