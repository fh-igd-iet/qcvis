<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { Definitions } from "./blocks/blocks";
import type { GateDefinition } from "./blocks/gate-definition";
import type { DNDPayload } from "@/components/quantum-editor/blocks/dnd-payload";
import { serializePayload } from "@/components/quantum-editor/blocks/dnd-payload";

function dragStart(event: DragEvent, definition: GateDefinition) {
    const payload: DNDPayload = {
        type: "gate",
        origin: null,
        gateDefinition: definition,
    };

    event?.dataTransfer?.setData("text/plain", serializePayload(payload));
}
</script>

<template>
    <div class="toolbar">
        <component
            :key="definitionIndex"
            class="gate-component"
            v-for="(definition, definitionIndex) in Definitions"
            :is="definition.toolbarComponent"
            draggable="true"
            :wire="0"
            :col="0"
            @dragstart="dragStart($event, definition)"
        />
    </div>
</template>

<style scoped lang="scss">
.toolbar {
    position: sticky;
    left: 0;
    top: 4.5rem;
    background-color: var(--cw-editor-toolbar-background);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--cw-sep);
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    padding: 0.5rem;
    z-index: 98;

    > .gate-component {
        margin: 0.4rem;
        cursor: move;
    }
}
</style>
