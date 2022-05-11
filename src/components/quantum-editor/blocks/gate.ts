// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import type { Gate as LibGate } from "quantum-circuit";
import { GateType } from "@/components/quantum-editor/blocks/gate-type";
import type { GateDefinition } from "@/components/quantum-editor/blocks/gate-definition";
import type QuantumCircuit from "@/quantum-circuit.patch";
import { IdentityBlockDefinition } from "@/components/quantum-editor/blocks/gates/gates";

export class Gate {
    gateDefinition: GateDefinition;
    top = false;
    bottom = false;

    constructor(gateDefinition?: GateDefinition) {
        this.gateDefinition = gateDefinition ?? IdentityBlockDefinition;
    }

    addToQuantumCircuit(
        circuit: QuantumCircuit,
        wire: number,
        col: number,
        input?: number
    ) {
        let type: LibGate;
        switch (this.gateDefinition.gate) {
            case GateType.I:
                return circuit;
            case GateType.H:
                type = input !== undefined ? "ch" : "h";
                break;
            case GateType.X:
                type = input !== undefined ? "cx" : "x";
                break;
            case GateType.Y:
                type = input !== undefined ? "cy" : "y";
                break;
            case GateType.Z:
                type = input !== undefined ? "cz" : "z";
                break;
            case GateType.T:
                type = input !== undefined ? "ct" : "t";
                break;
            case GateType.C:
                return circuit;
            case GateType.M:
                circuit.addGate("measure", col, wire, {
                    creg: { name: "default", bit: wire },
                });
                return;
        }

        circuit.addGate(type, col, input !== undefined ? [input, wire] : wire);
    }
}
