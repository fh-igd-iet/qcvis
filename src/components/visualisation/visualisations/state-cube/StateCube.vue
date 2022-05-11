<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
    Layer,
    StateCubeSceneManager,
} from "@/components/visualisation/visualisations/state-cube/state-cube-scene-manager";
import { GlobalQuantumRuntime } from "@/runtime/quantum-runtime";
import PhaseLegend from "@/components/visualisation/visualisations/common/PhaseLegend.vue";

defineProps<{
    settingsOpen: boolean;
}>();

const plot = ref<HTMLElement | undefined>(undefined);
const sceneManager = ref<StateCubeSceneManager | undefined>();

const DEFAULT_LAYERS = [Layer.DEFAULT, Layer.GRID, Layer.CUBE_INDEX_LABELS];

function update() {
    if (sceneManager.value === undefined && plot.value !== undefined) {
        const container = plot.value;
        sceneManager.value = new StateCubeSceneManager(
            container,
            DEFAULT_LAYERS
        );
    }

    if (
        sceneManager.value !== undefined &&
        GlobalQuantumRuntime.value !== undefined
    ) {
        const quantumStates = GlobalQuantumRuntime.value.stateAsArray();
        if (quantumStates)
            sceneManager.value.applyStates(
                quantumStates,
                GlobalQuantumRuntime.value.pos !==
                    Math.floor(GlobalQuantumRuntime.value.pos) &&
                    !GlobalQuantumRuntime.value.done()
            );
    }
}

function setLayerVisibility(layer: Layer, event: Event) {
    sceneManager.value?.setLayerVisibility?.(
        layer,
        !!(event.target as null | { checked: boolean })?.checked
    );
}

// Perform initial update
onMounted(() => update());

onUnmounted(() => sceneManager?.value?.remove?.());

defineExpose({
    update,
});
</script>

<template>
    <div class="wrapper">
        <div class="content" ref="plot">
            <PhaseLegend style="position: absolute" />
        </div>

        <div class="settings-panel" v-if="settingsOpen">
            <label for="settings_cb_labels">
                <div class="checkbox setting">
                    <span>Show labels</span>
                    <input
                        type="checkbox"
                        id="settings_cb_labels"
                        @change="
                            setLayerVisibility(Layer.CUBE_INDEX_LABELS, $event)
                        "
                        checked
                    />
                </div>
            </label>
            <label for="settings_cb_probs">
                <div class="checkbox setting">
                    <span>Show probabilities</span>
                    <input
                        type="checkbox"
                        @change="
                            setLayerVisibility(Layer.CUBE_PROB_LABELS, $event)
                        "
                        id="settings_cb_probs"
                    />
                </div>
            </label>
            <label for="settings_cb_grid">
                <div class="checkbox setting">
                    <span>Show cube lines</span>
                    <input
                        type="checkbox"
                        @change="setLayerVisibility(Layer.GRID, $event)"
                        id="settings_cb_grid"
                        checked
                    />
                </div>
            </label>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "../common/content-with-settings";

:deep(.state-vector-label) {
    padding-left: 3px;
    padding-right: 3px;
    border-radius: 0.25rem;
    background-color: white;
    color: black;
}

:deep(.state-vector-label.covered) {
    visibility: hidden;
}

.content {
    cursor: grab;
    overflow: hidden;
    margin-top: 1rem;
}
</style>
