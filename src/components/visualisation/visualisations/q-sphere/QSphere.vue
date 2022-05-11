<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
    Layer,
    QSphereSceneManager,
} from "@/components/visualisation/visualisations/q-sphere/q-sphere-scene-manager";
import { GlobalQuantumRuntime } from "@/runtime/quantum-runtime";
import PhaseLegend from "@/components/visualisation/visualisations/common/PhaseLegend.vue";

const SPHERE_DEFAULT_LAYERS = [
    Layer.DEFAULT,
    Layer.DISK_LINES,
    Layer.STATE_VECTOR_LABELS,
];

defineProps<{
    settingsOpen: boolean;
}>();

const plot = ref<HTMLElement | undefined>(undefined);
const sceneManager = ref<QSphereSceneManager | undefined>();

async function update() {
    if (sceneManager.value === undefined && plot.value !== undefined) {
        const container = plot.value;
        sceneManager.value = new QSphereSceneManager(
            container,
            1,
            SPHERE_DEFAULT_LAYERS
        );
    }

    if (
        sceneManager.value !== undefined &&
        GlobalQuantumRuntime.value !== undefined
    ) {
        const quantumStates = GlobalQuantumRuntime.value.stateAsArray();
        if (quantumStates)
            sceneManager.value.setQuantumStates(
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
                            setLayerVisibility(
                                Layer.STATE_VECTOR_LABELS,
                                $event
                            )
                        "
                        checked
                    />
                </div>
            </label>
            <label for="settings_cb_disks">
                <div class="checkbox setting">
                    <span>Show disks</span>
                    <input
                        type="checkbox"
                        @change="setLayerVisibility(Layer.DISK_LINES, $event)"
                        id="settings_cb_disks"
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
    opacity: 0.3;
}

.content {
    cursor: grab;
    overflow: hidden;
    margin-top: 1rem;
}
</style>
