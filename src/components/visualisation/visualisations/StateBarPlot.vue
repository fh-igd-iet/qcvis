<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { GlobalQuantumRuntime } from "@/runtime/quantum-runtime";
import type { QuantumState } from "quantum-circuit";
import PhaseLegend from "@/components/visualisation/visualisations/common/PhaseLegend.vue";
import { getColorForPhase } from "@/components/visualisation/visualisations/common/phase-color";
import { css } from "@thi.ng/color";

defineProps<{
    settingsOpen: boolean;
}>();

const states = ref<QuantumState[] | undefined>(undefined);
const animating = ref<boolean>(false);
const plot = ref<HTMLElement | undefined>(undefined);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function update() {
    if (plot.value !== undefined && GlobalQuantumRuntime.value !== undefined) {
        states.value = GlobalQuantumRuntime?.value
            ?.stateAsArray()
            ?.map((state) => ({
                ...state,
                indexBinStr: `|${state.indexBinStr}>`,
            }));
        animating.value =
            GlobalQuantumRuntime.value.pos !==
                Math.floor(GlobalQuantumRuntime.value.pos) &&
            !GlobalQuantumRuntime.value.done();
    }
}

// Perform initial update
onMounted(() => update());

defineExpose({
    update,
});
</script>

<template>
    <div class="wrapper">
        <div class="content" ref="plot">
            <PhaseLegend />
            <svg
                v-if="states !== undefined"
                font-family="system-ui, sans-serif"
                font-size="10"
                text-anchor="middle"
                width="640"
                height="400"
                viewBox="0 0 640 400"
                style="background: transparent"
            >
                <g
                    aria-label="y-axis"
                    transform="translate(40,0)"
                    fill="none"
                    text-anchor="end"
                    font-variant="tabular-nums"
                >
                    <g class="tick" opacity="1" transform="translate(0,370)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">0</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,335)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">10</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,300)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">20</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,265)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">30</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,230)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">40</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,195)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">50</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,160)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">60</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,125)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">70</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,90)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">80</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,55)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">90</text>
                    </g>
                    <g class="tick" opacity="1" transform="translate(0,20)">
                        <line stroke="currentColor" x2="-6"></line>
                        <text fill="currentColor" x="-9" dy="0.32em">100</text>
                    </g>
                    <text
                        fill="currentColor"
                        transform="translate(-40,20)"
                        dy="-1em"
                        text-anchor="start"
                    >
                        ↑ chance
                    </text>
                </g>
                <g
                    transform="translate(0,370)"
                    fill="none"
                    text-anchor="middle"
                >
                    <g
                        v-for="(state, index) in states"
                        class="tick"
                        opacity="1"
                        :key="index"
                        :transform="
                            'translate(' +
                            (50 +
                                (562 / (states.length ?? 1)) * (index + 0.5)) +
                            ',0)'
                        "
                    >
                        <line stroke="currentColor" y2="6"></line>
                        <text fill="currentColor" y="9" dy="0.71em">
                            {{ state.indexBinStr }}
                        </text>
                    </g>
                    <text
                        fill="currentColor"
                        transform="translate(330,30)"
                        dy="-0.32em"
                        text-anchor="middle"
                    >
                        indexBinStr
                    </text>
                </g>
                <g aria-label="bar">
                    <rect
                        v-for="(state, index) in states"
                        :x="50 + (562 / (states.length ?? 1)) * index"
                        :width="562 / (states.length ?? 1)"
                        :y="20 + (350 - (state.chance / 100) * 350)"
                        :height="(state.chance / 100) * 350"
                        :key="index"
                        :fill="css(getColorForPhase(state.phase, animating))"
                    ></rect>
                </g>
            </svg>
        </div>

        <div class="settings-panel" v-if="settingsOpen">
            <label for="settings_cb_labels"> </label>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "./common/content-with-settings";

.content {
    flex-direction: column;
    justify-content: left;
    align-items: center;
    margin-top: 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
}
</style>
