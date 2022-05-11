// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import ToolbarControlBlock from "./ToolbarControlBlock.vue";
import type { GateDefinition } from "../../gate-definition";
import { GateType } from "./../../gate-type";

export const ControlBlockDefinition: GateDefinition = {
    editorComponent: "ControlBlock",
    gate: GateType.C,
    toolbarComponent: ToolbarControlBlock,
};

export { default as ControlBlock } from "./ControlBlock.vue";
