// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import {
    BufferGeometry,
    CircleGeometry,
    Color,
    EdgesGeometry,
    Line,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    Object3D,
    PerspectiveCamera,
    PointLight,
    Scene,
    SphereGeometry,
    Vector3,
    WebGLRenderer,
} from "three";
import type { QuantumState } from "quantum-circuit";
import { MeshLine, MeshLineMaterial } from "three.meshline";
import {
    CSS2DObject,
    CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import { getThreeColorForPhase } from "@/components/visualisation/visualisations/common/phase-color";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const NULL_VECTOR = new Vector3(0, 0, 0);
const CAMERA_Z_OFFSET = 5;

export enum Layer {
    DEFAULT = 0,
    DISK_LINES = 1,
    STATE_VECTOR_LABELS = 2,
    STATE_VECTOR_DOTS = 3,
    STATE_VECTOR_PROJECTIONS = 4,
    CENTER_DISK = 5,
}

interface StateVectorDefinition {
    stateVectorPosition: Vector3;
    dot: {
        mesh: Mesh;
        material: MeshBasicMaterial;
    };
    vector: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        meshLine: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        material: any;
    };
}

export class QSphereSceneManager {
    public readonly scene;
    public readonly camera;

    private readonly radius;

    private stateVectorDefinitions: {
        [stateVector: string]: StateVectorDefinition;
    } = {};

    // Array for keeping track of all visual objects that must be removed from the scene upon state vector change
    private stateVectorObjects: Object3D[] = [];

    constructor(
        container: HTMLElement,
        radius = 1,
        defaultLayers = [Layer.DEFAULT]
    ) {
        this.radius = radius;

        this.scene = new Scene();
        const background: string = getComputedStyle(
            document.body
        ).getPropertyValue("--cw-background");
        this.scene.background = new Color(
            parseInt(background.substring(background.indexOf("#") + 1), 16)
        );

        this.camera = new PerspectiveCamera(
            35,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, CAMERA_Z_OFFSET, 0.1);

        const light = new PointLight();
        light.position.set(10, 0, 10);
        this.camera.add(light);
        this.scene.add(this.camera);

        const qSphereGeometry = new SphereGeometry(this.radius, 64, 32);
        const qSphereMaterial = new MeshLambertMaterial({
            color: 0xffffff,
            opacity: 0.25,
            transparent: true,
        });
        const qSphere = new Mesh(qSphereGeometry, qSphereMaterial);
        this.scene.add(qSphere);

        const qSphereCenterGeometry = new SphereGeometry(
            this.radius * 0.025,
            12,
            6
        );
        const qSphereCenterMaterial = new MeshBasicMaterial({
            color: 0x000000,
        });
        const qSphereCenter = new Mesh(
            qSphereCenterGeometry,
            qSphereCenterMaterial
        );
        this.scene.add(qSphereCenter);

        const renderer = new WebGLRenderer({
            powerPreference: "low-power",
            antialias: true,
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(container.clientWidth, container.clientHeight);
        labelRenderer.domElement.style.position = "absolute";
        container.appendChild(labelRenderer.domElement);

        const controls = new OrbitControls(
            this.camera,
            labelRenderer.domElement
        );
        controls.target.set(0, 0, 0);
        controls.rotateSpeed = 0.25;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = false;

        // Override visible layers with defaultLayers selection
        this.camera.layers.disableAll();
        defaultLayers.forEach((layer) => this.camera.layers.enable(layer));

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const ctx = this;

        function animate() {
            requestAnimationFrame(animate);

            if (
                container.clientWidth !== renderer.domElement.clientWidth ||
                container.clientHeight !== renderer.domElement.clientHeight
            ) {
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
            if (
                container.clientWidth !==
                    labelRenderer.domElement.clientWidth ||
                container.clientHeight !== labelRenderer.domElement.clientHeight
            ) {
                labelRenderer.setSize(
                    container.clientWidth,
                    container.clientHeight
                );
            }
            ctx.camera.aspect = container.clientWidth / container.clientHeight;
            ctx.camera.updateProjectionMatrix();

            controls.update();

            renderer.render(ctx.scene, ctx.camera);
            labelRenderer.render(ctx.scene, ctx.camera);
        }

        animate();
    }

    /**
     * Sets the visibility of a given visual layer.
     * @param layer Layer to set the visibility for.
     * @param visible Target visibility state (true=visible).
     */
    public setLayerVisibility(layer: Layer, visible: boolean) {
        if (visible) {
            this.camera.layers.enable(layer);
        } else {
            this.camera.layers.disable(layer);
        }
    }

    /**
     * Updates the state vector amplitudes if the correct state vectors are already present. If not, it first
     * cleans up the scene and initializes with state vectors that match the given QuantumStates.
     * @param quantumStates Quantum state probabilities obtained from quantum-circuit.
     */
    public setQuantumStates(
        quantumStates: QuantumState[],
        isAnimating: boolean
    ) {
        if (
            quantumStates.length !==
            Object.keys(this.stateVectorDefinitions).length
        ) {
            // State vectors are not yet initialized / don't match the quantum states -> rebuild them
            const stateVectors = quantumStates.map(
                (state) => state.indexBinStr
            );
            this.initializeStateVectors(stateVectors);
        }

        // Determine max. probability to normalize the vector length to the full radius
        const maxChance = Math.max(
            ...quantumStates.map((state) => state.chance)
        );
        quantumStates.forEach((state) => {
            // Get definition for current state vector
            const stateVectorDefinition =
                this.stateVectorDefinitions[state.indexBinStr];

            if (state.chance === 0) {
                // Make all impossible state vectors invisible
                stateVectorDefinition.vector.meshLine.setPoints([]);
                stateVectorDefinition.dot.mesh.visible = false;
            } else {
                const normalizedChance = state.chance / maxChance;
                const probabilityVector =
                    stateVectorDefinition.stateVectorPosition.clone();
                probabilityVector.multiplyScalar(normalizedChance);

                // Set length of probability vector
                const probabilityVectorGeometry =
                    new BufferGeometry().setFromPoints([
                        NULL_VECTOR,
                        probabilityVector,
                    ]);
                stateVectorDefinition.vector.meshLine.setGeometry(
                    probabilityVectorGeometry
                );

                // Also update dot at the end of the probability vector
                stateVectorDefinition.dot.mesh.position.copy(probabilityVector);
                stateVectorDefinition.dot.mesh.visible = true;

                // Set vector color
                const color = getThreeColorForPhase(state.phase, isAnimating);
                stateVectorDefinition.dot.material.color = color;
                stateVectorDefinition.vector.material.color = color;
            }
        });
    }

    /**
     * Aligns the given state vectors on the sphere according to the QSphere algorithm. If state vectors are already
     * present, it cleans them up first.
     * @param stateVectors State vectors to place on the QSphere.
     */
    private initializeStateVectors(stateVectors: string[]) {
        this.cleanupStateVectors();

        // Group to get the layers (disks) of the sphere
        const stateVectorsByDist =
            QSphereSceneManager.groupByHammingDistance(stateVectors);

        // Disks are distributed equidistantly within the sphere
        const diskCount = Object.keys(stateVectorsByDist).length;
        const layerDistance = (2 * this.radius) / (diskCount - 1);

        // Render all items disk by disk
        Object.entries(stateVectorsByDist).forEach(
            ([distance, stateVectors]) => {
                // Since all following objects will be placed on the same disk, we can already compute the z-axis position
                const diskZPosition =
                    parseInt(distance) * layerDistance - this.radius;

                // Radius of the disk can be obtained by Pythagoras
                const diskRadius = Math.sqrt(
                    this.radius ** 2 - diskZPosition ** 2
                );

                // Share same material for all secondary objects (muted color)
                const helperLineMaterial = new LineBasicMaterial({
                    color: 0xcccccc,
                });

                // Create disk line around the sphere
                const diskLineGeometry = new CircleGeometry(diskRadius, 64);
                const diskLine = new LineSegments(
                    new EdgesGeometry(diskLineGeometry),
                    helperLineMaterial
                );
                diskLine.position.z = diskZPosition;
                diskLine.layers.set(Layer.DISK_LINES);
                this.stateVectorObjects.push(diskLine);
                this.scene.add(diskLine);

                // State vector dots should be distributed equally on the disk border
                const radialStateVectorDistance =
                    (2 * Math.PI) / stateVectors.length;

                // Calculate state vector positions on the disk
                stateVectors.forEach((stateVector, i) => {
                    // Apply rotation matrix to the state vector
                    const radialStateVectorOffset =
                        i * radialStateVectorDistance;
                    const stateVectorPosition = new Vector3(
                        -diskRadius * Math.sin(radialStateVectorOffset),
                        diskRadius * Math.cos(radialStateVectorOffset),
                        diskZPosition
                    );

                    // Create dots where the state vector cuts the sphere (probability=1)
                    const stateVectorDotGeometry = new SphereGeometry(
                        0.015,
                        8,
                        4
                    );
                    const stateVectorDot = new Mesh(
                        stateVectorDotGeometry,
                        helperLineMaterial
                    );
                    stateVectorDot.position.copy(stateVectorPosition);
                    stateVectorDot.layers.set(Layer.STATE_VECTOR_DOTS);
                    this.stateVectorObjects.push(stateVectorDot);
                    this.scene.add(stateVectorDot);

                    // Label these dots with the state vectors
                    const stateVectorLabelDiv = document.createElement("div");
                    stateVectorLabelDiv.textContent = `|${stateVector}>`;

                    const stateVectorLabel = new CSS2DObject(
                        stateVectorLabelDiv
                    );
                    stateVectorLabel.position.copy(stateVectorPosition);
                    stateVectorLabel.layers.set(Layer.STATE_VECTOR_LABELS);

                    // Set conditional label classes based on the position relative to the sphere
                    stateVectorLabel.onBeforeRender = (
                        renderer,
                        scene,
                        camera
                    ) => {
                        const stateVectorLabelCameraPosition =
                            stateVectorLabel.position.clone();
                        stateVectorLabelCameraPosition.applyMatrix4(
                            camera.matrixWorldInverse
                        );

                        if (
                            stateVectorLabelCameraPosition.z < -CAMERA_Z_OFFSET
                        ) {
                            // Label is behind sphere
                            stateVectorLabelDiv.className =
                                "state-vector-label covered";
                        } else {
                            // Label is in front of sphere
                            stateVectorLabelDiv.className =
                                "state-vector-label";
                        }
                    };

                    this.stateVectorObjects.push(stateVectorLabel);
                    this.scene.add(stateVectorLabel);

                    // Create state vector projection lines that connect the state vectors with the center of the sphere
                    const stateVectorProjectionGeometry =
                        new BufferGeometry().setFromPoints([
                            NULL_VECTOR,
                            stateVectorPosition,
                        ]);
                    const stateVectorProjection = new Line(
                        stateVectorProjectionGeometry,
                        helperLineMaterial
                    );
                    stateVectorProjection.layers.set(
                        Layer.STATE_VECTOR_PROJECTIONS
                    );
                    this.stateVectorObjects.push(stateVectorProjection);
                    this.scene.add(stateVectorProjection);

                    // Create probability vector
                    // Positions will be later set by `setQuantumStates`
                    const probabilityVectorMeshLine = new MeshLine();
                    const probabilityVectorMaterial = new MeshLineMaterial({
                        lineWidth: 0.03,
                    });
                    const probabilityVector = new Mesh(
                        probabilityVectorMeshLine,
                        probabilityVectorMaterial
                    );
                    this.stateVectorObjects.push(probabilityVector);
                    this.scene.add(probabilityVector);

                    // Create probability dots
                    const probabilityDotGeometry = new SphereGeometry(
                        0.025,
                        8,
                        4
                    );
                    const probabilityDotMaterial = new MeshBasicMaterial({
                        color: 0xffffff,
                    });
                    const probabilityDot = new Mesh(
                        probabilityDotGeometry,
                        probabilityDotMaterial
                    );
                    this.stateVectorObjects.push(probabilityDot);
                    this.scene.add(probabilityDot);

                    // Save definition for every state vector and a hash map
                    this.stateVectorDefinitions[stateVector] = {
                        stateVectorPosition,
                        dot: {
                            mesh: probabilityDot,
                            material: probabilityDotMaterial,
                        },
                        vector: {
                            meshLine: probabilityVectorMeshLine,
                            material: probabilityVectorMaterial,
                        },
                    };
                });
            }
        );
    }

    /**
     * Cleans up all visual objects related to a specific state vector initialization.
     */
    private cleanupStateVectors() {
        this.stateVectorDefinitions = {};

        this.stateVectorObjects.forEach((obj) => this.scene.remove(obj));
        this.stateVectorObjects = [];
    }

    /**
     * Groups the given state vectors by their Hamming distance and returns a HashMap.
     * @param stateVectors State vectors.
     */
    private static groupByHammingDistance(stateVectors: string[]): {
        [distance: number]: string[];
    } {
        const result: { [distance: number]: string[] } = {};

        stateVectors.forEach((stateVector: string) => {
            const distance =
                QSphereSceneManager.hammingDistanceToNullVector(stateVector);
            if (result[distance] === undefined) {
                result[distance] = [];
            }

            result[distance].push(stateVector);
        });

        return result;
    }

    /**
     * Calculates the Hamming distance to the zero vector with the same size.
     * https://en.wikipedia.org/wiki/Hamming_distance
     * @param stateVector String representation of the state vector, e.g. "0010" (-> 1).
     */
    private static hammingDistanceToNullVector(stateVector: string): number {
        let distance = 0;

        for (const char of stateVector) {
            if (char === "1") {
                distance++;
            }
        }

        return distance;
    }
}
