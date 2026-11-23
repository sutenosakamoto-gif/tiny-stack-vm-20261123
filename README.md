# Tiny stack virtual machine

`main.ts` (Node 22, no dependencies) interprets make.fun's tiny stack ISA v1:
for each instance under `/input/<id>/` it runs `program.bin` on `input.bin`
and writes `/output/<id>/stdout.bin` and `/output/<id>/exit.txt`.

It follows the reference VM exactly: wrapping int32 arithmetic, a 256-value
stack, 64-deep calls, 256 words of memory, all ten trap codes, and the
1,000,000-step and 65,536-byte output limits. Locally, set
`MAKEFUN_INPUT_DIR` / `MAKEFUN_OUTPUT_DIR` to run it on the kit's practice set.
