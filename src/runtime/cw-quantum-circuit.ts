// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import { Gate } from "@/components/quantum-editor/blocks/gate";
import { compose, equals, max, min, or, prop } from "rambda";
import { GateType } from "@/components/quantum-editor/blocks/gate-type";
import type { GateDefinition } from "@/components/quantum-editor/blocks/gate-definition";
import { ref } from "vue";
import type { GateName } from "@/components/quantum-editor/blocks/blocks";
import type QuantumCircuit from "@/quantum-circuit.patch";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useCompression } from "./brotli";
import {
    Algorithm,
    cHadamard,
    cPauliX,
    cPauliY,
    cPauliZ,
    cPhaseRoot,
    GateBuilder,
    hadamard,
    pauliX,
    pauliY,
    pauliZ,
    phaseRoot,
    measurement,
} from "qukit/pkg.web";

const brotli = await useCompression();

export const defaultGateTypes: { [key in GateType]: GateName } = {
    [GateType.I]: "IdentityBlock",
    [GateType.H]: "HadamardBlock",
    [GateType.T]: "TGateBlock",
    [GateType.X]: "PauliXBlock",
    [GateType.Y]: "PauliYBlock",
    [GateType.Z]: "PauliZBlock",
    [GateType.C]: "ControlBlock",
    [GateType.M]: "MeasurementGate",
};

/**
 * Application-specific representation of a quantum circuit.
 */
export class CWQuantumCircuit {
    public circuit: Gate[][];

    constructor();
    constructor(cols: number, rows: number);
    constructor(circuit: Gate[][]);
    constructor(circuit: { [key: number]: { [key: number]: GateDefinition } });
    constructor(
        cols:
            | number
            | Gate[][]
            | { [key: number]: { [key: number]: GateDefinition } } = 10,
        rows = 5
    ) {
        if (typeof cols === "number") {
            this.circuit = new Array(cols)
                .fill(0)
                .map(() => new Array(rows).fill(0).map(() => new Gate()));
            this.saveToLocalStorage();
        } else {
            if ((cols as Gate[][]).length !== undefined) {
                this.circuit = cols as Gate[][];
            } else {
                const sparse = cols as {
                    [key: number]: { [key: number]: GateDefinition };
                };
                let maxCol = 0;
                let maxWire = 0;
                for (const colIndex in sparse) {
                    maxCol = max(parseInt(colIndex), maxCol);
                    for (const wireIndex in sparse[colIndex]) {
                        maxWire = max(parseInt(wireIndex), maxWire);
                    }
                }

                this.circuit = new Array(maxCol + 5)
                    .fill(0)
                    .map((_, colIndex) =>
                        new Array(maxWire + 2).fill(0).map((_, wireIndex) => {
                            if (sparse[colIndex] !== undefined) {
                                if (sparse[colIndex][wireIndex] !== undefined) {
                                    return new Gate(
                                        sparse[colIndex][wireIndex]
                                    );
                                }
                            }
                            return new Gate();
                        })
                    );

                for (let col = 0; col < this.columnCount; col++) {
                    this.updateControlBlockWires(col);
                }
            }
        }
    }

    public init(cols: number, rows: number) {
        this.circuit = new Array(cols)
            .fill(0)
            .map(() => new Array(rows).fill(0).map(() => new Gate()));
        this.saveToLocalStorage();
    }

    public clear() {
        this.init(this.columnCount, this.rowCount);
        this.saveToLocalStorage();
    }

    public get columnCount(): number {
        return this.circuit.length;
    }

    public get rowCount(): number {
        return this.circuit[0].length;
    }

    public getColumn(col: number) {
        return this.circuit[col];
    }

    /**
     * Inserts a single gate at the specified location.
     * @param gate Gate to place.
     * @param col Target column index.
     * @param row Target row index.
     */
    public setGate(gate: Gate, col: number, row: number): boolean {
        // Make sure only one C gate can exist per line
        const cGateInCol = this.circuit[col]
            .map(prop("gateDefinition"))
            .map(prop("gate"))
            .map(equals<GateType>(GateType.C))
            .reduce(or);
        const gateInCol = this.circuit[col]
            .map(prop("gateDefinition"))
            .map(prop("gate"))
            .filter(
                (gateType: GateType) =>
                    gateType !== GateType.I && gateType !== GateType.C
            );

        if (
            (gate.gateDefinition.gate === GateType.C &&
                (cGateInCol || gateInCol.length > 1)) ||
            (cGateInCol &&
                gateInCol.length > 1 &&
                gate.gateDefinition.gate !== GateType.I) ||
            (cGateInCol &&
                gateInCol.length === 1 &&
                this.circuit[col][row].gateDefinition.gate === GateType.I)
        ) {
            // There already is a control
            return false;
        }

        this.circuit[col][row] = gate;

        this.updateControlBlockWires(col);

        const expectedCols = this.getLastFilledCol() + 4;
        const expectedRows = Math.max(this.circuit[0].length, row + 2);
        this.updateDimensions(expectedCols, expectedRows);
        this.saveToLocalStorage();

        return true;
    }

    /**
     * Deletes the gate at the specified location.
     * @param col Target column index.
     * @param row Target row index.
     */
    public removeGate(col: number, row: number) {
        this.setGate(new Gate(), col, row);
    }

    public removeRow(row: number) {
        this.circuit.forEach((col) => col.splice(row, 1));
        this.saveToLocalStorage();
    }

    /**
     * Updates the control block wires after a change in a column. Must be called after every column change.
     * @param updatedCol Index of the column that changed.
     */
    private updateControlBlockWires(updatedCol: number) {
        const controlGateInCol = this.circuit[updatedCol].some(
            (gate: Gate) => gate.gateDefinition.gate === GateType.C
        );

        const gateInCol = this.circuit[updatedCol].some(
            (gate: Gate) =>
                gate.gateDefinition.gate !== GateType.C &&
                gate.gateDefinition.gate !== GateType.I
        );

        if (controlGateInCol && gateInCol) {
            const gateWireIndices = this.circuit[updatedCol]
                .map((gate, index: number) =>
                    gate.gateDefinition.gate !== GateType.I ? index : undefined
                )
                .filter((v: number | undefined) => v !== undefined) as number[];

            const firstGateWireIndex: number = gateWireIndices.reduce(min);
            const lastGateWireIndex: number = gateWireIndices.reduce(max);

            this.circuit[updatedCol].forEach((gate: Gate, index: number) => {
                gate.top =
                    index !== firstGateWireIndex &&
                    index >= firstGateWireIndex &&
                    index <= lastGateWireIndex;
                gate.bottom =
                    index !== lastGateWireIndex &&
                    index >= firstGateWireIndex &&
                    index <= lastGateWireIndex;
            });
        } else {
            this.circuit[updatedCol].forEach((gate) => {
                gate.top = false;
                gate.bottom = false;
            });
        }
    }

    /**
     * Resizes the quantum algorithm along both axes.
     * @param cols Target column count. Must be >0.
     * @param rows Target row count. Must be >0.
     */
    private updateDimensions(cols: number, rows: number) {
        // The order of execution matters, that's why 2D resizing has an own helper
        this.updateRowDimension(rows);
        this.updateColumnDimension(cols);
        this.saveToLocalStorage();
    }

    /**
     * Resizes the quantum algorithm along the horizontal axis.
     * @param cols Target column count. Must be >0.
     */
    private updateColumnDimension(cols: number) {
        if (cols <= 0) {
            throw Error("Invalid column count");
        }

        const offset = cols - this.circuit.length;
        if (offset > 0) {
            const colSize = this.circuit[0].length;
            this.circuit.push(
                ...new Array(offset)
                    .fill(0)
                    .map(() => new Array(colSize).fill(0).map(() => new Gate()))
            );
        } else if (offset < 0) {
            this.circuit = this.circuit.slice(0, cols);
        }
        this.saveToLocalStorage();
    }

    /**
     * Resizes the quantum algorithm along the vertical axis.
     * @param rows Target row count. Must be >0.
     */
    private updateRowDimension(rows: number) {
        if (rows <= 0) {
            throw Error("Invalid row count");
        }

        const offset = rows - this.circuit[0].length;
        if (offset == 0) {
            return;
        }

        this.circuit = this.circuit.map((col) => {
            if (offset > 0) {
                return [
                    ...col,
                    ...new Array(offset).fill(0).map(() => new Gate()),
                ];
            } else if (offset < 0) {
                return col.slice(0, rows);
            }

            return col;
        });
        this.saveToLocalStorage();
    }

    /**
     * Returns the index of the leftmost column that is not empty (i.e. contains >0 gates).
     */
    public getLastFilledCol(): number {
        for (let colIndex = this.circuit.length - 1; colIndex > 0; colIndex--) {
            if (
                this.circuit[colIndex].some(
                    (gate) =>
                        gate.gateDefinition.editorComponent !== "IdentityBlock"
                )
            ) {
                return colIndex;
            }
        }

        return 0;
    }

    /**
     * Returns the index of the bottommost row that is not empty (i.e. contains >0 gates).
     */
    public getLastFilledWire(): number {
        return this.circuit
            .map((col) =>
                (
                    col
                        .map((row, index) =>
                            row.gateDefinition.editorComponent !==
                            "IdentityBlock"
                                ? index
                                : undefined
                        )
                        .filter((index) => index) as number[]
                ).reduce(max, 0)
            )
            .reduce(max, 0);
    }

    public applyToCircuit(circuit: QuantumCircuit, col?: number) {
        if (col !== undefined) {
            const posColumn = this.circuit[col];
            if (posColumn === undefined) {
                return;
            }

            const control: number = posColumn.findIndex(
                compose(
                    equals<GateType>(GateType.C),
                    prop("gate"),
                    prop("gateDefinition")
                )
            );

            posColumn.forEach((gate: Gate, wire: number) => {
                gate.addToQuantumCircuit(
                    circuit,
                    wire,
                    col,
                    control > -1 ? control : undefined
                );
            });
        } else {
            for (let i = 0; i < this.columnCount; i++) {
                this.applyToCircuit(circuit, i);
            }
        }
    }

    public toAlgorithm(): Algorithm {
        const gateBuilder = new GateBuilder();
        const qbits = gateBuilder.qbits(this.getLastFilledWire() + 1);
        const cbits = gateBuilder.bits(this.getLastFilledWire() + 1);
        for (let i = 0; i < this.columnCount; i++) {
            const posColumn = this.circuit[i];
            if (posColumn !== undefined) {
                const control: number = posColumn.findIndex(
                    compose(
                        equals<GateType>(GateType.C),
                        prop("gate"),
                        prop("gateDefinition")
                    )
                );

                let gates = 0;
                posColumn.forEach((gate: Gate, wire: number) => {
                    switch (gate.gateDefinition.gate) {
                        case GateType.I:
                            break;
                        case GateType.H:
                            if (control > -1) {
                                cHadamard(
                                    qbits[control],
                                    qbits[wire],
                                    gates > 0
                                );
                            } else {
                                hadamard(qbits[wire], undefined, gates > 0);
                            }
                            gates++;
                            break;
                        case GateType.X:
                            if (control > -1) {
                                cPauliX(qbits[control], qbits[wire], gates > 0);
                            } else {
                                pauliX(qbits[wire], undefined, gates > 0);
                            }
                            gates++;
                            break;
                        case GateType.Y:
                            if (control > -1) {
                                cPauliY(qbits[control], qbits[wire], gates > 0);
                            } else {
                                pauliY(qbits[wire], undefined, gates > 0);
                            }
                            gates++;
                            break;
                        case GateType.Z:
                            if (control > -1) {
                                cPauliZ(qbits[control], qbits[wire], gates > 0);
                            } else {
                                pauliZ(qbits[wire], undefined, gates > 0);
                            }
                            gates++;
                            break;
                        case GateType.T:
                            if (control > -1) {
                                cPhaseRoot(
                                    qbits[control],
                                    qbits[wire],
                                    gates > 0
                                );
                            } else {
                                phaseRoot(qbits[wire], undefined, gates > 0);
                            }
                            gates++;
                            break;
                        case GateType.C:
                            break;
                        case GateType.M:
                            measurement(
                                qbits[wire],
                                cbits[wire],
                                undefined,
                                gates > 0
                            );
                            gates++;
                            break;
                    }
                });
            }
        }

        return gateBuilder.intoAlgorithm();
    }

    public sparse(): { [key: number]: { [key: number]: GateDefinition } } {
        const sparse: { [key: number]: { [key: number]: GateDefinition } } = {};
        this.circuit.forEach((col, colIndex) => {
            col.forEach((gate, wireIndex) => {
                if (gate.gateDefinition.editorComponent !== "IdentityBlock") {
                    if (sparse[colIndex] === undefined) {
                        sparse[colIndex] = {};
                    }
                    sparse[colIndex][wireIndex] = {
                        ...gate.gateDefinition,
                        editorComponent:
                            defaultGateTypes[gate.gateDefinition.gate] !==
                            gate.gateDefinition.editorComponent
                                ? gate.gateDefinition.editorComponent
                                : undefined,
                        toolbarComponent: undefined,
                    };
                }
            });
        });

        return sparse;
    }

    public serialize(compress = 4096, pretty = false): string {
        const json = JSON.stringify(
            this.sparse(),
            undefined,
            pretty && compress === -1 ? 4 : undefined
        );
        if (compress <= -1) {
            return json;
        }
        if (compress === 0) {
            const compressed = `b${String.fromCharCode.apply(
                null,
                brotli.compress(
                    new Uint8Array(
                        json
                            .slice(1)
                            .split("")
                            .map((c) => c.charCodeAt(0))
                    ),
                    undefined
                ) as unknown as number[]
            )}`;

            return compressed.length < json.length ? compressed : json;
        }
        if (json.length > compress) {
            // > 4kB (Block Size)
            return `b${String.fromCharCode.apply(
                null,
                brotli.compress(
                    new Uint8Array(
                        json
                            .slice(1)
                            .split("")
                            .map((c) => c.charCodeAt(0))
                    ),
                    undefined
                ) as unknown as number[]
            )}`;
        } else {
            return json;
        }
    }

    public static deserialize(serialized: string): CWQuantumCircuit {
        const type = serialized.charAt(0);
        let sparse: { [key: number]: { [key: number]: GateDefinition } } = {};
        if (type === "{") {
            sparse = JSON.parse(serialized);
        } else if (type === "b") {
            const decompressed = String.fromCharCode.apply(
                null,
                brotli.decompress(
                    new Uint8Array(
                        serialized
                            .slice(1)
                            .split("")
                            .map((c) => c.charCodeAt(0))
                    )
                ) as unknown as number[]
            );
            // Add missing `{` due to decompression
            sparse = JSON.parse(`{${decompressed}`);
        }

        return new CWQuantumCircuit(sparse);
    }

    public saveToLocalStorage() {
        sessionStorage.setItem("circuit", this.serialize());
    }
}

const lsCircuit = sessionStorage.getItem("circuit");
export const GlobalQuantumCircuit = ref<CWQuantumCircuit>(
    lsCircuit ? CWQuantumCircuit.deserialize(lsCircuit) : new CWQuantumCircuit()
);
