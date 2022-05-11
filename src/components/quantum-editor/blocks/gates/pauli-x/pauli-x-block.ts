// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import PauliXBlock from "./PauliXBlock.vue";
import type { GateDefinition } from "../../gate-definition";
import { GateType } from "./../../gate-type";

export const PauliXBlockDefinition: GateDefinition = {
    editorComponent: "PauliXBlock",
    gate: GateType.X,
    toolbarComponent: PauliXBlock,
};

export { default as PauliXBlock } from "./PauliXBlock.vue";
