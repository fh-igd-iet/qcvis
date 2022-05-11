<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import type { QuantumState } from "quantum-circuit";
import { computed, ref } from "vue";
import { GlobalQuantumRuntime } from "@/runtime/quantum-runtime";
import type { Complex } from "mathjs";
import { add, complex } from "mathjs";

const props = defineProps<{
    running?: boolean;
    col?: number;
    wire?: number;
}>();
const probability = ref<number>(0);
const phase = ref<number>(0);
const purity = ref<number>(1);

function update(col?: number) {
    if (
        props.col !== undefined &&
        props.wire !== undefined &&
        col === props.col - 1
    ) {
        let a = complex(0.0, 0.0);
        let b = complex(0.0, 0.0);
        let p = 0.0;
        GlobalQuantumRuntime?.value
            ?.stateAsArray()
            ?.forEach((qs: QuantumState) => {
                if (
                    qs.indexBinStr.charAt(
                        qs.indexBinStr.length - (props.wire ?? 0) - 1
                    ) === "1"
                ) {
                    p += qs.chance;
                    a = add(a, qs.amplitude as Complex);
                } else {
                    b = add(b, qs.amplitude as Complex);
                }
            });

        //const t = GlobalQuantumRuntime.value.circuit.partialTrace(props.wire); TODO
        //const e: MathNumericType[] = eigs(t).values as MathNumericType[];
        //purity.value = cumsum(multiply(abs(e), abs(e)))[0] as number;

        probability.value = p / 100.0;
        phase.value = a.toPolar().phi - b.toPolar().phi;
    } else if (col !== undefined && col < (props.col ?? 0) - 1) {
        probability.value = 0.0;
        phase.value = 0.0;
        purity.value = 1.0;
    }
}

const phasePos = computed<[number, number]>(() => {
    return [
        purity.value * 0.4 * Math.cos(phase.value) + 0.5,
        purity.value * 0.4 * -Math.sin(phase.value) + 0.5,
    ];
});

defineExpose({
    update,
});
</script>

<template>
    <div class="gate" :class="{ running: running }">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="diagram"
            viewBox="0 0 1 1"
        >
            <mask :id="'circle-mask-p-' + Math.floor(purity * 100)">
                <circle
                    cx="0.5"
                    cy="0.5"
                    :r="0.4 * purity"
                    stroke-width="0.05"
                    stroke="black"
                    fill="white"
                />
            </mask>
            <g>
                <circle
                    cx="0.5"
                    cy="0.5"
                    :r="0.4 * purity"
                    stroke="rgb(30, 30, 30)"
                    stroke-width="0.05"
                    fill="rgb(255, 255, 255)"
                />
                <rect
                    width="1"
                    :height="purity * probability"
                    :y="1 - purity * probability - (1 - purity) / 2"
                    x="0"
                    fill="rgb(20, 207, 224)"
                    :mask="
                        'url(#circle-mask-p-' + Math.floor(purity * 100) + ')'
                    "
                />
                <line
                    x1="0.5"
                    y1="0.5"
                    :x2="phasePos[0]"
                    :y2="phasePos[1]"
                    stroke="rgba(30, 30, 30, 0.8)"
                    stroke-width="0.05"
                />
            </g>
        </svg>
    </div>
</template>

<style scoped lang="scss">
@import "./../../gate";

.gate {
    background: linear-gradient(45deg, #b3b529, #e2e514);
}
</style>
