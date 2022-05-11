<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
defineProps<{
    running?: boolean;
    top?: boolean;
    bottom?: boolean;
    showGrid?: boolean;
}>();
</script>

<template>
    <div class="gate" :class="{ grid: showGrid, running: running }">
        <div class="v-line" :class="{ show: top }"></div>
        <div class="h-container">
            <div class="h-line"></div>
            <div class="dot"></div>
            <div class="h-line"></div>
        </div>
        <div class="v-line" :class="{ show: bottom }"></div>
    </div>
</template>

<style scoped lang="scss">
@import "./../../../variables";
@import "./dot";

.gate {
    display: flex;
    min-width: $qe-gate-inner-size;
    min-height: $qe-gate-inner-size;
    flex-direction: column;
    align-items: center;
    border-radius: $qe-gate-border-radius;

    > .v-line {
        flex-grow: 1;
        min-width: $qe-wire-width;
        max-width: $qe-wire-width;
        background-color: var(--cw-editor-wire);
        &:not(.show) {
            background-color: transparent !important;
        }
    }
    .h-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        min-width: 100%;

        > .h-line {
            min-height: $qe-wire-width;
            max-height: $qe-wire-width;
            flex-grow: 1;
            background-color: var(--cw-editor-wire);
        }
    }

    &:not(.running) {
        cursor: move;
    }

    &.grid:not(.running),
    &:hover:not(.running) {
        background: var(--cw-editor-hover);
    }
}
</style>
