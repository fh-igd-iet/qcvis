// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import PauliYBlock from "./PauliYBlock.vue";
import type { GateDefinition } from "../../gate-definition";
import { GateType } from "./../../gate-type";

export const PauliYBlockDefinition: GateDefinition = {
    editorComponent: "PauliYBlock",
    gate: GateType.Y,
    toolbarComponent: PauliYBlock,
};

export { default as PauliYBlock } from "./PauliYBlock.vue";
