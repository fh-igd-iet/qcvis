<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import QuantumEditorToolbar from "./QuantumEditorToolbar.vue";
import { computed, ref, watch } from "vue";
import { Gate } from "./blocks/gate";
import BlockContainer from "./blocks/BlockContainer.vue";
import { GlobalQuantumCircuit } from "@/runtime/cw-quantum-circuit";
import { deserializePayload } from "@/components/quantum-editor/blocks/dnd-payload";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{
    running: boolean;
}>();

// const customBreakpoints = ref<number[]>([]);
const currentPos = ref<number>(0);
const currentBlockPos = computed(() => Math.floor(currentPos.value));
const currentInBlockPos = computed(
    () => currentPos.value - currentBlockPos.value
);

// Automatically scroll to currently executed gate
watch(currentBlockPos, (blockPos) => {
    const posBox = document.getElementById(`col-${blockPos + 1}-top`);
    if (posBox) {
        // TODO keep y position
        posBox.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "center",
        });
    }
});

function removeRow(row: number) {
    if (!props.running) {
        GlobalQuantumCircuit.value?.removeRow?.(row);
    }
}

// function setBreakpointColumn(col: number) {
//     if (!props.running) {
//         if (customBreakpoints.value.find(equals(col)) !== undefined) {
//             customBreakpoints.value = customBreakpoints.value.filter(
//                 (breakpoint) => breakpoint !== col
//             );
//         } else {
//             customBreakpoints.value.push(col);
//         }
//     }
// }

async function drop(event: DragEvent, row: number, col: number) {
    if (!props.running) {
        const dragData = event.dataTransfer?.getData("text");
        if (!dragData) {
            return;
        }

        isDraggingOverEditor.value = false;

        const payload = deserializePayload(dragData);
        const dragGate = new Gate(payload.gateDefinition);

        if (
            GlobalQuantumCircuit.value?.setGate?.(dragGate, col, row) &&
            payload.origin !== null
        ) {
            // If the gate was dragged from another location of the _circuit, remove it there
            GlobalQuantumCircuit.value?.removeGate?.(
                payload.origin.col,
                payload.origin.row
            );
        }
    }
}

function dragover(event: DragEvent) {
    if (!props.running) {
        event.preventDefault();
    }
}

const isDraggingOverEditor = ref(false);
let editorDragoverTimeout: number | undefined;

function editorDragover() {
    if (!props.running) {
        isDraggingOverEditor.value = true;

        clearTimeout(editorDragoverTimeout);
        editorDragoverTimeout = setTimeout(
            () => (isDraggingOverEditor.value = false),
            500
        );
    }
}

const blockContainer = ref<typeof BlockContainer[] | undefined>(undefined);

function update(col: number) {
    currentPos.value = col;

    if (blockContainer.value !== undefined) {
        for (let container of blockContainer.value) {
            container.update(col);
        }
    }
}

defineExpose({
    update,
});
</script>

<template>
    <div class="wrapper">
        <QuantumEditorToolbar class="toolbar" />

        <div class="editor" @dragover="editorDragover">
            <div
                class="qbit"
                :style="{ 'grid-row': i + 1, 'grid-column': 1 }"
                :class="{
                    running: running,
                    disabled:
                        GlobalQuantumCircuit?.circuit?.[0].length <= 1 ?? true,
                }"
                v-for="(gate, i) in GlobalQuantumCircuit?.circuit?.[0] ?? []"
                :key="i"
                @click="removeRow(i)"
            >
                <span class="qbit-icon">0</span>
                <FontAwesomeIcon class="trash-icon" :icon="faTrash" />
            </div>

            <template
                v-for="(col, colIndex) in GlobalQuantumCircuit?.circuit ?? []"
                :key="colIndex"
            >
                <div
                    v-for="(gate, rowIndex) in col"
                    :key="rowIndex"
                    :style="{
                        'grid-row': rowIndex + 1,
                        'grid-column': colIndex + 2,
                    }"
                    class="block"
                    :class="{
                        top: rowIndex === 0,
                        bottom: rowIndex === col.length - 1,
                        active: currentBlockPos === colIndex - 1,
                        running: running,
                    }"
                    :id="rowIndex === 0 ? `col-${colIndex}-top` : undefined"
                    @drop="drop($event, rowIndex, colIndex)"
                    @dragover="dragover($event)"
                >
                    <div
                        class="interpolation-progress-indicator"
                        v-if="currentBlockPos === colIndex - 1"
                        :style="{
                            left: `${100 * currentInBlockPos}%`,
                        }"
                    />
                    <BlockContainer
                        ref="blockContainer"
                        :running="running"
                        :gate="gate"
                        :col="colIndex"
                        :row="rowIndex"
                        :show-grid="isDraggingOverEditor"
                    />
                </div>

                <!--                <button-->
                <!--                    @click="setBreakpointColumn(colIndex)"-->
                <!--                    class="breakpoint"-->
                <!--                    :class="{-->
                <!--                        active:-->
                <!--                            customBreakpoints.find(equals(colIndex)) !==-->
                <!--                            undefined,-->
                <!--                        running: running,-->
                <!--                    }"-->
                <!--                    :style="{-->
                <!--                        'grid-row': col.length + 1,-->
                <!--                        'grid-column': colIndex + 2,-->
                <!--                    }"-->
                <!--                    title="Toggle breakpoint"-->
                <!--                ></button>-->
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "variables";

.wrapper {
    background-color: var(--cw-background-shade);
}

.run {
    min-width: 6rem;
    width: 6rem;
    min-height: $qe-gate-inner-size;
    height: $qe-gate-inner-size;
    border-radius: 0.5rem;
    padding-left: 0;
    padding-right: 0;
    margin-right: 0.5rem;
}

.editor {
    display: grid;
    align-items: center;
    padding-top: 15px;
    padding-bottom: 15px;
    grid-template-rows: $qe-gate-outer-size;
    grid-auto-columns: $qe-gate-outer-size;
    grid-template-columns: 30px;
    overflow: auto;
    background-color: var(--cw-background-shade);
    border-bottom: 1px solid var(--cw-sep);

    > .breakpoint {
        margin-left: 5px;
        margin-right: 5px;
        margin-top: 10px;
        height: 20px;
        border-radius: 0.25rem;
        background-color: var(--cw-editor-breakpoint);
        border: 0;

        &.running {
            cursor: auto;
        }

        &:hover:not(.running):not(.active):not(:active) {
            background-color: var(--cw-editor-breakpoint-hover);
        }

        &:hover.running:not(.active):not(:active) {
            background-color: var(--cw-editor-breakpoint);
        }

        &.active,
        &:active {
            background-color: var(--cw-editor-breakpoint-active);
        }
    }

    > .block {
        position: relative;
        overflow: hidden;

        &.active {
            background-color: var(--cw-editor-active);
        }

        &.top {
            border-top-left-radius: 0.25rem;
            border-top-right-radius: 0.25rem;
        }

        &.bottom {
            border-bottom-left-radius: 0.25rem;
            border-bottom-right-radius: 0.25rem;
        }

        > .interpolation-progress-indicator {
            background-color: white;
            opacity: 0.5;
            position: absolute;
            width: 1px;
            height: 100%;
            z-index: 0;
        }
    }

    > .qbit {
        display: flex;
        align-items: center;
        grid-column: 1;
        height: 50px;
        border: $qe-wire-width solid var(--cw-editor-wire);
        color: var(--cw-editor-wire);
        border-left: none;
        box-sizing: border-box;
        border-top-right-radius: 100%;
        border-bottom-right-radius: 100%;

        &.disabled {
            pointer-events: none;
        }

        > .qbit-icon {
            margin-left: 7px;
        }

        > .trash-icon {
            margin-left: 5px;
            display: none;
        }

        &:hover:not(.running) {
            cursor: pointer;
            color: orangered;

            > .qbit-icon {
                display: none;
            }

            > .trash-icon {
                display: block;
            }
        }
    }
}
</style>
