<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import FileSaver from "file-saver";

const props = defineProps<{
    show: boolean;
    text: string;
    download?: File;
}>();

const emit = defineEmits<{
    (e: "update:show", value: boolean): void;
}>();

function downloadFile() {
    if (props.download !== undefined) {
        FileSaver.saveAs(props.download);
        emit("update:show", false);
    }
}
</script>

<template>
    <vue-final-modal
        @update:modelValue="$emit('update:show', $event)"
        :modelValue="show"
        classes="modal-container"
        content-class="modal-content"
    >
        <span class="modal__title">
            <span></span>
            <button class="modal__close" @click="$emit('update:show', false)">
                <FontAwesomeIcon :icon="faX" />
            </button>
        </span>
        <div class="modal__content">
            <textarea :value="text"></textarea>
        </div>
        <div class="modal__action">
            <button v-if="download" @click="downloadFile">Download</button>
            <button @click="$emit('update:show', false)">Close</button>
        </div>
    </vue-final-modal>
</template>

<style scoped lang="scss">
@import "modal";

.modal__content > textarea {
    width: 80vw;
    height: 60vh;
    color: var(--cw-text);
    background-color: var(--cw-background-shade);
}
</style>
