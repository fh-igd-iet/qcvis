// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import type { GateDefinition } from "@/components/quantum-editor/blocks/gate-definition";

export interface DNDPayload {
    type: "gate";
    origin: null | { col: number; row: number };
    gateDefinition: GateDefinition;
}

export function serializePayload(payload: DNDPayload): string {
    const sgd = {
        ...payload,
    };
    sgd.gateDefinition.toolbarComponent = undefined;

    return JSON.stringify(payload);
}

export function deserializePayload(payload: string): DNDPayload {
    return JSON.parse(payload);
}
