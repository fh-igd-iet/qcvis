<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

defineProps<{
    show: boolean;
}>();

const emit = defineEmits<{
    (e: "update:show", value: boolean): void;
    (e: "run"): void;
}>();

const file = ref<HTMLInputElement>();
const error = ref<"decodeError" | "unknownFileType" | "noFile">("noFile");

async function check() {
    if (file?.value?.files?.item !== undefined) {
        const f = file.value.files.item(0);
        if (f !== undefined && f !== null) {
            const content = await f.text();
            if (f.name.endsWith(".cwc")) {
                try {
                    const { CWQuantumCircuit } = await import(
                        "@/runtime/cw-quantum-circuit"
                    );
                    const decoded = await CWQuantumCircuit.deserialize(content);
                    const { GlobalQuantumCircuit } = await import(
                        "@/runtime/cw-quantum-circuit"
                    );
                    GlobalQuantumCircuit.value = decoded;
                    GlobalQuantumCircuit.value?.saveToLocalStorage();

                    emit("update:show", false);
                    emit("run");
                } catch (e) {
                    error.value = "decodeError";
                }
            } else {
                error.value = "unknownFileType";
            }
        }
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
            <span>Choose An Export Format</span>
            <button class="modal__close" @click="$emit('update:show', false)">
                <FontAwesomeIcon :icon="faX" />
            </button>
        </span>
        <div class="modal__content">
            <input ref="file" type="file" accept=".cwc" @change="check" />
            <span v-if="error === 'decodeError'" style="color: red">
                Can not decode file
            </span>
            <span v-if="error === 'unknownFileType'" style="color: red">
                Unknown file type
            </span>
        </div>
        <div class="modal__action">
            <button @click="$emit('update:show', false)">Close</button>
        </div>
    </vue-final-modal>
</template>

<style scoped lang="scss">
@import "modal";
</style>
