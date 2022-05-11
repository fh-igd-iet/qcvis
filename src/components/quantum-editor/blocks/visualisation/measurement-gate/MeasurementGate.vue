<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { ref } from "vue";
import { GlobalQuantumRuntime } from "@/runtime/quantum-runtime";

const props = defineProps<{
    running?: boolean;
    col?: number;
    wire?: number;
}>();
const state = ref<string>("M");

function update(col?: number) {
    if (
        props.col !== undefined &&
        props.wire !== undefined &&
        col === props.col
    ) {
        state.value = GlobalQuantumRuntime?.value?.cregs()[props.wire]
            ? "1"
            : "0";
    } else if (col !== undefined && col < (props.col ?? 0)) {
        state.value = "0";
    }
}

defineExpose({
    update,
});
</script>

<template>
    <div class="gate" :class="{ running: running }">
        <div>
            {{ state }}
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "./../../gate";

.gate {
    padding: 0.4rem;
    background: linear-gradient(45deg, #b3b529, #e2e514);

    > div {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        width: 2rem;
        height: 2rem;
        border-radius: 0.25rem;
        color: black;
    }
}
</style>
