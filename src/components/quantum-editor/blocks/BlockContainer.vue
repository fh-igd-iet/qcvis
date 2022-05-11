<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import type { Gate } from "./gate";
import { fromName } from "./blocks";
import { defaultGateTypes } from "@/runtime/cw-quantum-circuit";
import { ref } from "vue";
import type { GateDefinition } from "@/components/quantum-editor/blocks/gate-definition";
import type { DNDPayload } from "@/components/quantum-editor/blocks/dnd-payload";
import { serializePayload } from "@/components/quantum-editor/blocks/dnd-payload";

const props = defineProps<{
    running: boolean;
    col: number;
    row: number;
    gate: Gate;
    showGrid?: boolean;
}>();
const isDraggingOver = ref(false);
let dragoverTimeout: number | undefined;

function dragStart(event: DragEvent, definition: GateDefinition) {
    if (!props.running) {
        if (!event.dataTransfer) {
            throw Error("event.dataTransfer not available");
        }

        const payload: DNDPayload = {
            type: "gate",
            origin: { col: props.col, row: props.row },
            gateDefinition: definition,
        };

        event.dataTransfer.setData("text/plain", serializePayload(payload));
        event.dataTransfer.effectAllowed = "move";
    }
}

function dragover() {
    if (!props.running) {
        isDraggingOver.value = true;

        clearTimeout(dragoverTimeout);
        dragoverTimeout = setTimeout(() => (isDraggingOver.value = false), 500);
    }
}

function dragleave() {
    if (!props.running) {
        isDraggingOver.value = false;
    }
}

const component = ref<{ update?(col?: number): Promise<void> } | undefined>(
    undefined
);

function update(col?: number) {
    component.value?.update?.(col);
}

defineExpose({
    update,
});
</script>

<template>
    <div class="gate-border" @dragover="dragover" @dragleave="dragleave">
        <div class="h-line"></div>
        <div class="gate-inner">
            <div class="v-line" :class="{ show: gate.top }"></div>
            <component
                ref="component"
                v-bind="{
                    wire: row,
                    col: col,
                    top: gate.top,
                    bottom: gate.bottom,
                    running: running,
                    showGrid: showGrid,
                }"
                :is="
                    gate.gateDefinition.editorComponent !== undefined
                        ? fromName[gate.gateDefinition.editorComponent]
                        : fromName[defaultGateTypes[gate.gateDefinition.gate]]
                "
                draggable="true"
                class="gate-component"
                @dragstart="dragStart($event, gate.gateDefinition)"
            />
            <div class="v-line" :class="{ show: gate.bottom }"></div>
        </div>
        <div class="h-line"></div>
    </div>
</template>

<style scoped lang="scss">
@import "./../variables";

.gate-border {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;

    > .h-line {
        flex-grow: 1;
        height: $qe-wire-width;
        background-color: var(--cw-editor-wire);
    }

    > .gate-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: $qe-gate-outer-size;
        max-height: $qe-gate-outer-size;

        > .v-line {
            flex-grow: 1;
            width: $qe-wire-width;
            background-color: var(--cw-editor-wire);

            &:not(.show) {
                background-color: transparent !important;
            }
        }
    }
}
</style>
