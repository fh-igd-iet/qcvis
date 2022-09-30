<!--
    Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
    Licensed under the EUPL. See LICENSE.txt.
-->

<script setup lang="ts">
import { ref } from "vue";
import ExportModal from "@/components/modal/ExportModal.vue";
import ImportModal from "@/components/modal/ImportModal.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
    faPlay,
    faForward,
    faRecycle,
    faArrowDown,
    faArrowUp,
    faGlobeEurope,
    faBars,
    faPause,
    faFileLines,
} from "@fortawesome/free-solid-svg-icons";

import QCVISLogo from "../assets/logo.svg?url";

import license from "../../LICENSE.txt?raw";
import notices_web from "../../DEPENDENCIES.txt?url";
import notices_tauri from "../../src-tauri/DEPENDENCIES.txt?url";

defineProps<{
    running: boolean;
}>();

const emit = defineEmits<{
    (e: "run"): void;
    (e: "animate"): void;
    (e: "abort"): void;
    (e: "pause"): void;
    (e: "clear"): void;
    (e: "load"): void;
    (e: "save"): void;
}>();

const open = ref(false);
const exportModalShow = ref(false);
const importModalShow = ref(false);
const showLicense = ref(false);

async function save() {
    const { GlobalQuantumCircuit } = await import(
        "@/runtime/cw-quantum-circuit"
    );

    if (GlobalQuantumCircuit.value) {
        const blob = new Blob(
            [await GlobalQuantumCircuit.value?.serialize(0, false)],
            { type: "application/octet-stream" }
        );
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "circuit.cwc";
        a.click();

        window.URL.revokeObjectURL(url);
    }
}

let noticesLoaded = false;
async function loadNotices() {
    if (noticesLoaded) return;
    noticesLoaded = true;

    const web_res = await fetch(notices_web);
    const web_text = await web_res.text();

    const pre = document.getElementById("notices");
    if (pre === null) return;
    pre.textContent = web_text;

    if ("__TAURI__" in window) {
        const tauri_res = await fetch(notices_tauri);
        const tauri_text = await tauri_res.text();
        pre.textContent += "-----\n\n";
        pre.textContent += tauri_text;
    }
}
</script>

<template>
    <nav class="navbar">
        <div class="navbar-head">
            <div class="logo">
                <img :src="QCVISLogo" alt="QCVIS logo" />
            </div>

            <button
                class="toggle"
                :class="{ active: open }"
                @click="
                    open = !open;
                    showLicense = false;
                "
            >
                <FontAwesomeIcon :icon="faBars" />
            </button>
        </div>

        <div class="navbar-items" :class="{ show: open }">
            <button v-if="!running" class="item" @click="emit('animate')">
                <FontAwesomeIcon :icon="faPlay" />
                <span>Run</span>
            </button>

            <button v-if="running" class="item" @click="emit('pause')">
                <FontAwesomeIcon :icon="faPause" />
                <span>Pause</span>
            </button>

            <button class="item" :disabled="running" @click="emit('run')">
                <FontAwesomeIcon :icon="faForward" />
                <span>End</span>
            </button>

            <div class="spacer" />

            <button class="item" @click="emit('clear')">
                <FontAwesomeIcon :icon="faRecycle" />
                <span>Clear</span>
            </button>

            <div class="spacer" />

            <button class="item" @click="save">
                <FontAwesomeIcon :icon="faArrowDown" />
                <span>Save</span>
            </button>

            <button class="item" @click="importModalShow = true">
                <FontAwesomeIcon :icon="faArrowUp" />
                <span>Load</span>
            </button>

            <div class="spacer" />

            <button class="item" @click="exportModalShow = true">
                <FontAwesomeIcon :icon="faGlobeEurope" />
                <span>Export</span>
            </button>

            <button
                class="item"
                @click="showLicense = !showLicense"
                id="license-symbol"
            >
                <FontAwesomeIcon :icon="faFileLines" />
                <span>License &amp; Notices</span>
            </button>
        </div>
    </nav>

    <div id="licenseModal" v-show="showLicense">
        <div id="lcontainer">
            <div>
                <p>
                    Copyright© 2022 Gesellschaft zur Förderung der angewandten
                    Forschung e.V. acting on behalf of its Fraunhofer Institut
                    für Graphische Datenverarbeitung. Licensed under the EUPL.
                </p>
                <details open>
                    <summary>License</summary>
                    <pre>{{ license }}</pre>
                </details>
                <details :ontoggle="loadNotices">
                    <!-- prettier-ignore -->
                    <summary>Third-party Licenses and Attribution Notices</summary>
                    <pre id="notices"></pre>
                </details>
            </div>
        </div>
    </div>

    <ExportModal
        v-if="exportModalShow"
        @update:show="exportModalShow = $event"
        :show="exportModalShow"
    />
    <ImportModal
        v-if="importModalShow"
        @update:show="importModalShow = $event"
        @run="emit('run')"
        :show="importModalShow"
    />
</template>

<style scoped lang="scss">
.navbar {
    position: fixed;
    background-color: var(--cw-background);
    left: 0;
    top: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid var(--cw-sep);
    padding: 0.25rem;
    z-index: 99;
}

@media (min-width: 640px) {
    .navbar {
        flex-direction: row;
    }
}

.navbar-head {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;

    > button,
    > div {
        margin: 0.5rem;
        min-height: 3rem;
        min-width: 3rem;
        height: 3rem;
        width: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cw-text);
        background-color: var(--cw-logo-background);
        border-radius: 12px;
    }

    > .toggle {
        &:not(:hover):not(:active):not(.active):not(:disabled) {
            background-color: var(--cw-toolbar-button-background) !important;
        }

        &:hover:not(:active):not(.active):not(:disabled) {
            background-color: var(--cw-toolbar-button-hover) !important;
        }
    }
}

.logo > img {
    width: 42px;
    height: auto;
}

@media (min-width: 640px) {
    .navbar-head {
        flex-direction: column;
        width: auto;

        > .toggle {
            display: none;
        }
    }
}

.spacer {
    width: 0;
}

@media (min-width: 640px) {
    .spacer {
        width: 15px;
    }
}

.navbar-items {
    display: none;
    width: 100%;
    flex-direction: column;
    justify-content: start;
    align-items: stretch;
    padding: 1rem 0;

    > button {
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
        border: 0;
        margin: 0 0.5rem;
        padding: 0.5rem 0.5rem;

        &:not(:hover):not(:active):not(.active):not(:disabled) {
            background-color: var(--cw-toolbar-button-background) !important;
        }

        &:hover:not(:active):not(.active):not(:disabled) {
            background-color: var(--cw-toolbar-button-hover) !important;
        }

        > span {
            font-size: 13px;
            margin-top: 7px;
        }

        > svg {
            width: 3rem;
        }
    }
}

@media (min-width: 640px) {
    .navbar-items {
        width: auto;
        display: flex;
        flex-direction: row;
        padding: 0;

        > button {
            flex-direction: column;
        }
    }
}

.navbar-items.show {
    display: flex;
}

#license-symbol {
    position: absolute;
    right: 20px;
}

#licenseModal {
    display: block;
    position: absolute;
    width: 100%;
    min-height: calc(100% - 70px);
    z-index: 999;
    background: #333;
    padding: 10px;
}

#licenseModal #lcontainer {
    overflow-y: auto;
}

#licenseModal #lcontainer div {
    position: relative;
    display: block;

    max-width: 800px;
    margin: 0 auto;
}

#licenseModal #lcontainer * > pre {
    word-wrap: break-word;
    white-space: pre-wrap;
}
</style>
