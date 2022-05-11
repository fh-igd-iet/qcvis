<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
defineProps<{
    running?: boolean;
}>();
</script>

<template>
    <div class="gate" :class="{ running: running }">T</div>
</template>

<style scoped lang="scss">
@import "./../../gate";

.gate {
    background: linear-gradient(45deg, #5ab71b, #6eef16);
}
</style>
