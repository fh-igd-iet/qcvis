<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import QuantumEditor from "./quantum-editor/QuantumEditor.vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import QuantumVisualisation from "@/components/visualisation/QuantumVisualisation.vue";
import ApplicationToolbar from "@/components/ApplicationToolbar.vue";
import type { CWQuantumCircuit } from "@/runtime/cw-quantum-circuit";
import { onMounted, ref } from "vue";
import { GlobalQuantumCircuit } from "@/runtime/cw-quantum-circuit";
import {
    GlobalQuantumRuntime,
    QuantumRuntime,
} from "@/runtime/quantum-runtime";

const quantumEditor = ref<typeof QuantumEditor | undefined>(undefined);
const quantumVisualisation = ref<typeof QuantumVisualisation | undefined>(
    undefined
);
const running = ref<boolean>(false);
const currentPos = ref(0);
let timeout: number | undefined;

const visalizationSideBySide = ref<boolean>(false);

async function run() {
    if (!running.value && GlobalQuantumCircuit.value !== undefined) {
        running.value = true;
        GlobalQuantumRuntime.value = await QuantumRuntime.create(
            GlobalQuantumCircuit.value as CWQuantumCircuit
        );

        if (
            quantumEditor?.value?.update !== undefined &&
            quantumVisualisation?.value?.update !== undefined
        ) {
            while (!GlobalQuantumRuntime.value.done() && running.value) {
                GlobalQuantumRuntime.value.step();
                quantumEditor.value.update(GlobalQuantumRuntime.value.pos);
            }
            quantumEditor.value.update(GlobalQuantumRuntime.value.pos);
            quantumVisualisation.value.update();
            running.value = false;
        }
    }

    // Reset circuit position
    currentPos.value = 0;
}

function animateRec() {
    if (
        quantumEditor?.value?.update !== undefined &&
        quantumVisualisation?.value?.update !== undefined &&
        running.value
    ) {
        if (running.value && GlobalQuantumRuntime.value !== undefined) {
            if (GlobalQuantumRuntime.value.done()) {
                quantumVisualisation.value?.update?.();
                currentPos.value = 0;
                running.value = false;
            } else {
                GlobalQuantumRuntime.value.step();
                quantumEditor.value?.update?.(GlobalQuantumRuntime.value.pos);
                quantumVisualisation.value?.update?.();
                currentPos.value = GlobalQuantumRuntime.value.pos + 1;
                if (
                    GlobalQuantumRuntime.value.pos ===
                    Math.floor(GlobalQuantumRuntime.value.pos)
                ) {
                    timeout = setTimeout(() => animateRec(), 1000);
                } else {
                    timeout = setTimeout(() => animateRec(), 1000 / 64);
                }
            }
        } else {
            currentPos.value = 0;
            running.value = false;
        }
    }
}

async function animate() {
    if (!running.value && GlobalQuantumCircuit.value !== undefined) {
        running.value = true;
        GlobalQuantumRuntime.value = await QuantumRuntime.create(
            GlobalQuantumCircuit.value as CWQuantumCircuit,
            64,
            currentPos.value
        );
        timeout = setTimeout(() => animateRec(), 1000 / 64);
    }
}

onMounted(() => run());

function clear() {
    GlobalQuantumRuntime.value = undefined;
    GlobalQuantumCircuit.value.clear();
}

async function abort() {
    pause();

    GlobalQuantumRuntime.value = await QuantumRuntime.create(
        GlobalQuantumCircuit.value as CWQuantumCircuit
    );
    quantumEditor.value?.update?.(GlobalQuantumRuntime.value.pos);
    quantumVisualisation.value?.update?.();
    currentPos.value = 0;
}

function pause() {
    running.value = false;
    clearTimeout(timeout);
}
</script>

<template>
    <ApplicationToolbar
        :running="running"
        @run="run"
        @animate="animate"
        @abort="abort"
        @pause="pause"
        @clear="clear"
    />

    <div
        class="content-wrapper"
        :class="{ 'side-by-side': visalizationSideBySide }"
    >
        <QuantumEditor
            class="quantumEditor"
            :running="running"
            ref="quantumEditor"
        />
        <QuantumVisualisation
            class="quantumVisualisation"
            :visalizationSideBySide="visalizationSideBySide"
            @setVisalizationSideBySide="visalizationSideBySide = $event"
            ref="quantumVisualisation"
        />
    </div>
</template>

<style scoped lang="scss">
.content-wrapper.side-by-side {
    display: flex;

    > .quantumEditor {
        width: 40%;
        border-right: 1px solid var(--cw-sep);

        :deep(.editor) {
            border-bottom: none !important;
        }
    }

    > .quantumVisualisation {
        width: 60%;
    }
}
</style>
