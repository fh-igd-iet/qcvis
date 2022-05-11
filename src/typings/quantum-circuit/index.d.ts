declare module "quantum-circuit" {
    import type { Complex, MathNumericType, MathType } from "mathjs";

    export type Gate =
        | "id"
        | "x"
        | "y"
        | "z"
        | "h"
        | "srn"
        | "srndg"
        | "r2"
        | "r4"
        | "r8"
        | "rx"
        | "ry"
        | "rz"
        | "u1"
        | "u2"
        | "u3"
        | "s"
        | "t"
        | "sdg"
        | "tdg"
        | "swap"
        | "srswap"
        | "iswap"
        | "xy"
        | "cx"
        | "cy"
        | "cz"
        | "ch"
        | "csrn"
        | "ms"
        | "xx"
        | "yy"
        | "zz"
        | "cr2"
        | "cr4"
        | "cr8"
        | "crx"
        | "cry"
        | "crz"
        | "cu1"
        | "cu2"
        | "cu3"
        | "cs"
        | "ct"
        | "csdg"
        | "ctdg"
        | "ccx"
        | "cswap"
        | "csrswap"
        | "reset"
        | "measure";

    export interface RunOptions {
        strictMode?: boolean;
        partitioning?: boolean;
        continue?: boolean;
        initialState?: number[][];
        onGate?(column: number, wire: number, gateCounter: unknown);
        onColumn?(column: number);
    }

    export type QuantumStateMap = { [key: number]: Complex };

    export interface QuantumState {
        index: number;
        indexBinStr: string;
        amplitude: MathNumericType;
        amplitudeStr: string;
        magnitude: MathType;
        chance: number;
        chanceStr: string;
        phase: number;
        phaseStr: string;
    }

    export default class QuantumCircuit {
        numQubits: number;
        state: QuantumStateMap;

        constructor(numQubits: number);

        addGate(
            gateName: Gate,
            column: number,
            wires: number | number[],
            options?: unknown
        );

        addMeasure(wire: number, creg: string, cbit: number);

        run(initialValues?: boolean[], options?: RunOptions);

        getCregValue(creg: string): number;

        probabilities(): number[];

        probability(wire: number): number;

        measureAll(): number[];

        createCreg(creg: string, len: number);

        getCregs(): { [key: string]: number };

        print(onlyPossible: boolean);

        stateAsString(onlyPossible: boolean): string;

        numAmplitudes(onlyPossible?: number): number;

        formatComplex(complex: Complex, options?: unknown): string;

        clear();

        init(numQubits: number, options?: unknown);

        initState();
        clearGates();

        exportQiskit(): string;
        exportQASM(): string;
        exportQuil(
            comment?: string,
            decompose?: boolean,
            exportAsGateName?: boolean,
            versionStr?: string
        ): string;
        exportSVG(): string;

        importQASM(input: string);
        importQuil(quil: string);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getGateAt(column: number, wire: number): any;

        circuitMatrix(): MathNumericType[][];
        applyTransform(U: MathNumericType[][], qubits: number[]);

        partialTrace(
            qubit: number
        ): [
            [MathNumericType, MathNumericType],
            [MathNumericType, MathNumericType]
        ];
    }
}
