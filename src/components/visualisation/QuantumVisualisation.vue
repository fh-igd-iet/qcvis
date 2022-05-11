<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSliders, faTableColumns } from "@fortawesome/free-solid-svg-icons";
import StateBarPlot from "./visualisations/StateBarPlot.vue";
import StateCube from "./visualisations/state-cube/StateCube.vue";
import PhaseDiskStateCube from "./visualisations/phase-disk-state-cube/PhaseDiskStateCube.vue";
import QSphere from "./visualisations/q-sphere/QSphere.vue";

const VISUALIZATIONS = [
    {
        title: "State Bar Plot",
        component: StateBarPlot,
    },
    {
        title: "Q Sphere",
        component: QSphere,
    },
    {
        title: "State Cube",
        component: StateCube,
    },
    {
        title: "Phase Disk State Cube",
        component: PhaseDiskStateCube,
    },
];

const plot = ref<typeof StateBarPlot | typeof QSphere | typeof StateCube>();
const currentPlotId = ref(0);
const settingsOpen = ref(false);

function update() {
    plot?.value?.update?.();
}

defineExpose({
    update,
});

defineEmits(["setVisalizationSideBySide"]);

defineProps<{
    visalizationSideBySide: boolean;
}>();
</script>

<template>
    <div class="wrapper">
        <div class="vis-selector">
            <div class="visualizations">
                <button
                    v-for="(v, vIndex) of VISUALIZATIONS"
                    :key="vIndex"
                    class="item"
                    @click="currentPlotId = vIndex"
                    :class="{ active: vIndex === currentPlotId }"
                >
                    {{ v.title }}
                </button>
            </div>

            <div class="spacer" />

            <div class="actions">
                <button
                    @click="
                        $emit(
                            'setVisalizationSideBySide',
                            !visalizationSideBySide
                        )
                    "
                    :class="{ active: visalizationSideBySide }"
                    title="Toggle Side-by-Side Mode"
                >
                    <FontAwesomeIcon :icon="faTableColumns" />
                </button>

                <button
                    @click="settingsOpen = !settingsOpen"
                    :class="{ active: settingsOpen }"
                    title="Toggle Settings"
                >
                    <FontAwesomeIcon :icon="faSliders" />
                </button>
            </div>
        </div>

        <KeepAlive>
            <component
                :is="VISUALIZATIONS[currentPlotId].component"
                :key="currentPlotId"
                ref="plot"
                :settings-open="settingsOpen"
            />
        </KeepAlive>
    </div>
</template>

<style scoped lang="scss">
.wrapper {
    /* Make sure that the visualization pane can fill the whole screen */
    min-height: calc(100vh - 115px);
}

.vis-selector {
    position: sticky;
    display: flex;
    align-items: center;
    left: 0;
    top: 4.5rem;
    border-bottom: 1px solid var(--cw-sep);
    background-color: var(--cw-visualisation-toolbar-background);
    backdrop-filter: blur(10px);
    z-index: 98;

    > .visualizations {
        display: flex;
        overflow: auto;
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    > .actions {
        display: flex;
    }

    button {
        padding: 5px 15px;
        margin: 5px;
        font-size: 14px;
        white-space: nowrap;

        &:not(:hover):not(:active):not(.active):not(:disabled) {
            background-color: var(--cw-visualisation-toolbar-button-background);
        }
        &:hover:not(:active):not(.active):not(:disabled) {
            background-color: var(--cw-visualisation-toolbar-button-hover);
        }
    }

    > .spacer {
        flex-grow: 1;
    }
}
</style>
