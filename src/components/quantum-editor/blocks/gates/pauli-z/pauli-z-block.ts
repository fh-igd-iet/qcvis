// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import PauliZBlock from "./PauliZBlock.vue";
import type { GateDefinition } from "../../gate-definition";
import { GateType } from "./../../gate-type";

export const PauliZBlockDefinition: GateDefinition = {
    editorComponent: "PauliZBlock",
    gate: GateType.Z,
    toolbarComponent: PauliZBlock,
};

export { default as PauliZBlock } from "./PauliZBlock.vue";
