# Tiny stack virtual machine

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/sutenosakamoto-gif/tiny-stack-vm-20261123/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/sutenosakamoto-gif/tiny-stack-vm-20261123/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

`main.ts` (Node 22, no dependencies) interprets make.fun's tiny stack ISA v1:
for each instance under `/input/<id>/` it runs `program.bin` on `input.bin`
and writes `/output/<id>/stdout.bin` and `/output/<id>/exit.txt`.

It follows the reference VM exactly: wrapping int32 arithmetic, a 256-value
stack, 64-deep calls, 256 words of memory, all ten trap codes, and the
1,000,000-step and 65,536-byte output limits. Locally, set
`MAKEFUN_INPUT_DIR` / `MAKEFUN_OUTPUT_DIR` to run it on the kit's practice set.
