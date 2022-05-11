<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import QiskitLogo from "./QiskitLogo.svg";
import QuilLogo from "./QuilLogo.svg";
import TextModal from "@/components/modal/TextModal.vue";
import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import QuantumCircuit from "@/quantum-circuit.patch";
import { GlobalQuantumCircuit } from "@/runtime/cw-quantum-circuit";

defineProps<{
    show: boolean;
}>();

defineEmits<{
    (e: "update:show", value: boolean): void;
}>();

const showTextModal = ref(false);
const exportText = ref<string>("");
const exportBlob = ref<File>();

async function exportQASM() {
    const circuit = new QuantumCircuit(
        GlobalQuantumCircuit.value.getLastFilledWire()
    );
    GlobalQuantumCircuit.value.applyToCircuit(circuit);
    exportText.value = circuit.exportQASM();
    exportBlob.value = new File([exportText.value], "export.qasm", {
        type: "application/octet-stream",
    });

    showTextModal.value = true;
}

async function exportQuil() {
    const circuit = new QuantumCircuit(
        GlobalQuantumCircuit.value.getLastFilledWire()
    );
    GlobalQuantumCircuit.value.applyToCircuit(circuit);
    exportText.value = circuit.exportQuil();
    exportBlob.value = new File([exportText.value], "export.quil", {
        type: "application/octet-stream",
    });

    showTextModal.value = true;
}

async function exportQiskit() {
    const circuit = new QuantumCircuit(
        GlobalQuantumCircuit.value.getLastFilledWire()
    );
    GlobalQuantumCircuit.value.applyToCircuit(circuit);
    exportText.value = circuit.exportQiskit();
    exportBlob.value = new File([exportText.value], "export.py", {
        type: "application/octet-stream",
    });

    showTextModal.value = true;
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
            <div class="exports">
                <button @click="exportQASM">QASM</button>
                <button @click="exportQiskit">
                    <QiskitLogo />
                    Qiskit
                </button>
                <button @click="exportQuil">
                    <QuilLogo />
                    Quil
                </button>
            </div>
        </div>
        <div class="modal__action">
            <button @click="$emit('update:show', false)">Close</button>
        </div>
        <TextModal
            v-if="showTextModal"
            :text="exportText"
            :show="showTextModal"
            :download="exportBlob"
            @update:show="showTextModal = $event"
        />
    </vue-final-modal>
</template>

<style scoped lang="scss">
@import "modal";

.exports {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;

    > button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.5rem;
        margin: 1rem;
        width: 6rem;
        height: 7.5rem;

        > svg {
            margin-bottom: 0.5rem;
        }
    }
}
</style>
